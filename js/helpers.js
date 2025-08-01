const { renameSync, mkdirSync, appendFileSync, readFileSync } = require("fs");
const { execSync } = require("child_process");
const { print } = require("unix-print");
const { insertReport, insertTransactions, insertData } = require("./db");
const { colors } = require("./colors");
const { getPdf } = require("./formatjs");
const { sips_id } = require("../settings.json");

const SERIAL_PORT = "/dev/ttyUSB0";
const USER_NAME = execSync("ls -ld /home/* 2>/dev/null | awk '{print $3}'")
  .toString()
  .trim();

const LOCAL_DIR = `/home/${USER_NAME}/sips_files`;
console.log({ USER_NAME, sips_id });

const getMonth = () => {
  return new Date().toLocaleDateString("sv").slice(0, 7);
};

const printFile = (path) => {
  console.log(colors.green, `... printing file ${path}`);
  print(path)
    .then((res) => {
      console.log(colors.cyan, res);
    })
    .catch((err) => {
      console.log(colors.red, `... error ${path}`);
      console.log(colors.red, err);
    });
};

const createDir = () => {
  try {
    mkdirSync(LOCAL_DIR);
  } catch {
    console.log(colors.red, "... sips already exists");
  }
  try {
    mkdirSync(`${LOCAL_DIR}/${getMonth()}`);
  } catch {
    console.log(colors.red, `... sips/${getMonth()} already exists`);
  }
};

const moveFile = (origin, destination) => {
  createDir();

  try {
    renameSync(origin, destination);
    console.log(colors.green, `... destination: ${destination}`);
  } catch (err) {
    console.log(colors.red, "... error moving file");
    console.error(err);
  }
};

const appendPayload = (path, payload) => {
  createDir();
  appendFileSync(path, payload);
  return readFileSync(path).toString();
};

const processPayload = (payload) => {
  console.log(colors.green, `... ${new Date().toLocaleString("sv")}`);
  console.log(colors.cyan, payload);
  if (payload) {
    if (payload.includes(">print")) {
      const fileName = getFileName();
      const month = getMonth();
      const path = `${LOCAL_DIR}/${month}/${fileName}`;
      console.log(colors.red, `----------- printing ${path} -----------`);
      console.log(colors.red, payload);
      getPdf(payload);
      moveFile("./output.pdf", path);
      printFile(path);
      return;
    } else if (payload.includes("MIDNIGHT TOTALS")) {
      const fileName = getDateFromTx(payload).replace(".pdf", "-totals.pdf");
      const month = getMonth();
      const path = `${LOCAL_DIR}/${month}/${fileName}`;
      insertReport(payload);
      getPdf(payload);
      moveFile("./output.pdf", path);
      console.log(colors.cyan, "... upload totals and logs");

      return;
    } else {
      const fileName = getDateFromTx(payload);
      const month = getMonth();
      const path = `${LOCAL_DIR}/${month}/${fileName}`;
      console.log(colors.green, "... append to log & update pdf");
      const records = appendPayload(path.replace(".pdf", ".txt"), payload);
      insertTransactions(
        payload.split("\n").filter((line) => line.includes("MAG"))
      );
      getPdf(records);
      moveFile("./output.pdf", path);
      console.log(colors.cyan, "----------- ----------- -----------");
      return;
    }
  }
};
const dateFromReport = (report) => {
  const line = report[0];
  if (line.includes("MIDNIGHT")) {
    const textDate = line.split("FOR:")[1];
    return new Date(textDate).toISOString().slice(0, 10);
  }
  return false;
};

const dateFromTransaction = (transaction) => {
  if (transaction.includes("MAG")) {
    const textDate = transaction.split(" ")[1];
    return new Date(textDate).toISOString().slice(0, 10);
  }
  return false;
};

const completePayload = (payload) => {
  let validTransactions = [];
  let validReports = [];
  payload.transactions.forEach((transaction) => {
    const date = dateFromTransaction(transaction);
    if (date) {
      validTransactions.push({ date, transaction });
    }
  });
  payload.reports.forEach((report) => {
    const date = dateFromReport(report);
    if (date) {
      validReports.push({ date, report: report.join("\n") });
    }
  });
  return { transactions: validTransactions, reports: validReports };
};

const inspectPayload = (payload) => {
  let reportStart = false;
  let transactions = [];
  let reports = [];
  let reportLines = [];
  const lines = payload.split("\n");
  lines.forEach((line, index) => {
    if (line.includes("MAG-")) {
      transactions.push(line);
      if (reportStart) {
        reportStart = false;
        reports.push(reportLines);
        reportLines = [];
      }
    }
    if (line.includes("MIDNIGHT")) {
      reportStart = true;
    }
    if (reportStart == true) {
      reportLines.push(line);
    }
    if (reportStart && lines.length - 1 == index) {
      reports.push(reportLines);
    }
  });
  const dataToInsert = completePayload({ reports, transactions });
  insertData(dataToInsert);
};

const getFileName = () => {
  const date = new Date().toLocaleDateString("sv");
  const time = new Date().toLocaleTimeString("sv");
  return `${date.split("-").join("")}_${time.split(":").join("")}.pdf`;
};

const getDateFromTx = () => {
  const date = new Date().toISOString().slice(0, 10);
  return `${date}.pdf`;
};

// exports.processPayload = processPayload;
exports.inspectPayload = inspectPayload;
exports.SERIAL_PORT = SERIAL_PORT;
exports.USER_NAME = USER_NAME;
