const { colors } = require("./colors");
const { getPdf } = require("./formatjs");
const { renameSync, mkdirSync, appendFileSync, readFileSync } = require("fs");
const { print } = require("unix-print");
const { sips_id } = require("../settings.json");
const { insertReport, insertTransactions } = require("./db");


const USER = "fx"
const LOCAL_DIR = `/home/${USER}/sips_files`
console.log({ sips_id })

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
  console.log(colors.green, `... ${new Date().toLocaleString("sv")}`)
  console.log(colors.cyan, payload)
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
      insertReport(payload)
      getPdf(payload);
      moveFile("./output.pdf", path);
      console.log(colors.cyan, "... upload totals and logs");

      return;
    } else {
      const fileName = getDateFromTx(payload);
      const month = getMonth();
      const path = `${LOCAL_DIR}/${month}/${fileName}`;
      console.log(
        colors.green,
        "... append to log & update pdf"
      );
      const records = appendPayload(path.replace(".pdf", ".txt"), payload);
      insertTransactions(payload.split('\n').filter(line => line.includes("MAG")))
      getPdf(records);
      moveFile("./output.pdf", path);
      console.log(colors.cyan, "----------- ----------- -----------");
      return;
    }
  }
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

exports.processPayload = processPayload;
