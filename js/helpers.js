const { colors } = require("./colors");
const { getPdf } = require("./formatjs");
const { renameSync, mkdirSync, appendFileSync, readFileSync } = require("fs");
const { print } = require("unix-print");

const getMonth = () => {
  return new Date().toLocaleDateString("sv").slice(0, 7);
};

const printFile = (path) => {
  console.log(`...printing file ${path}`);
  print(path)
    .then((res) => {
      console.log(colors.cyan, res);
    })
    .catch((err) => {
      console.log(`... error ${path}`);
      console.log(err);
    });
};

const createDir = () => {
  try {
    mkdirSync("/tmp/sips");
  } catch {
    console.log(".. already exists");
  }
  try {
    mkdirSync(`/tmp/sips/${getMonth()}`);
  } catch {
    console.log(".. already exists");
  }
};

const moveFile = (origin, destination) => {
  createDir();

  try {
    console.log({ origin, destination });
    renameSync(origin, destination);
  } catch (err) {
    console.log("... error moving file");
    console.error(err);
  }
};

const appendPayload = (path, payload) => {
  createDir();
  appendFileSync(path, payload);
  return readFileSync(path).toString();
};

const processPayload = (payload) => {
  if (payload) {
    if (payload.includes(">print")) {
      const fileName = getFileName();
      const month = getMonth();
      const path = `/tmp/sips/${month}/${fileName}`;
      console.log(colors.red, `----------- printing ${path} -----------`);
      console.log(colors.red, payload);
      getPdf(payload);
      moveFile("./output.pdf", path);
      printFile(path);

      console.log(colors.red, "----------- ----------- -----------");
      return;
    } else if (payload.includes("MIDNIGHT TOTALS")) {
      const fileName = getDateFromTx(payload).replace(".pdf", "-totals.pdf");
      const month = getMonth();
      const path = `/tmp/sips/${month}/${fileName}`;
      getPdf(payload);
      moveFile("./output.pdf", path);
      console.log(colors.cyan, "----- upload totals and logs ----");
      console.log(colors.cyan, "----------- ----------- -----------");

      return;
    } else {
      const fileName = getDateFromTx(payload);
      const month = getMonth();
      const path = `/tmp/sips/${month}/${fileName}`;
      console.log(
        colors.cyan,
        "----------- Append to log & update pdf -----------"
      );
      console.log(colors.cyan, payload);
      const records = appendPayload(path.replace(".pdf", ".txt"), payload);
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
