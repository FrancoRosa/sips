const path = require("path");

const { colors } = require("./colors");
const { insertData } = require("./db");
const { writeFileSync, mkdirSync } = require("fs");
const { LOCAL_DIR } = require("./backup");

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

const saveReportFile = (report, date) => {
  try {
    const monthFolder = date.slice(0, 7);
    const dirPath = path.join(LOCAL_DIR, monthFolder);
    // ensure directory exists
    mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, `${date}_report.txt`);
    // ensure file ends with newline and append (safe if file exists, creates otherwise)
    const content = report.endsWith("\n") ? report : report + "\n";
    writeFileSync(filePath, content, { encoding: "utf8", flag: "a" });
    console.log(colors.green, `... saved report to ${filePath}`);
    return filePath;
  } catch (err) {
    console.error(colors.red, "... error saving report file", err);
    throw err;
  }
};

const saveTransactionFile = (transaction, date) => {
  try {
    const monthFolder = date.slice(0, 7); // "YYYY-MM"
    const dirPath = path.join(LOCAL_DIR, monthFolder);
    mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, `${date}_transactions.txt`);
    const content = transaction.endsWith("\n")
      ? transaction
      : transaction + "\n";
    writeFileSync(filePath, content, { encoding: "utf8", flag: "a" });
    return filePath;
  } catch (err) {
    console.error(colors.red, "... error saving transaction file", err);
    throw err;
  }
};
const completePayload = (payload) => {
  let validTransactions = [];
  let validReports = [];
  payload.transactions.forEach((transaction) => {
    const date = dateFromTransaction(transaction);
    if (date) {
      validTransactions.push({ date, transaction });
      saveTransactionFile(transaction, date);
    }
  });
  payload.reports.forEach((report) => {
    const date = dateFromReport(report);
    if (date) {
      validReports.push({ date, report: report.join("\n") });
      saveReportFile(report.join("\n"), date);
    }
  });

  return { transactions: validTransactions, reports: validReports };
};

const lineCleaner = (text) => {
  return text.replace(/\p{Cc}/gu, "").trim();
};

const inspectPayload = (payload, sips_id) => {
  let reportStart = false;
  let transactions = [];
  let reports = [];
  let reportLines = [];
  const lines = payload.split("\n");
  lines.forEach((line, index) => {
    if (line.includes("MAG-")) {
      console.log(colors.blue, "... transaction parsed");
      transactions.push(lineCleaner(line));
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
      console.log(colors.blue, "... report parsed");
      reports.push(reportLines);
    }
  });
  const dataToInsert = completePayload({ reports, transactions });

  insertData(dataToInsert, sips_id);
};

exports.inspectPayload = inspectPayload;
