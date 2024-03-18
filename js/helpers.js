const { colors } = require("./colors");
const { getPdf } = require("./format");
const { renameSync, mkdir, mkdirSync } = require("fs");
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

const moveFile = (origin, destination) => {
  // check if "sips exists"

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

  try {
    console.log({ origin, destination });
    renameSync(origin, destination);
  } catch (err) {
    console.log("... error moving file");
    console.error(err);
  }
};

const processPayload = (payload) => {
  if (payload) {
    if (payload.includes(">print")) {
      const fileName = getFileName();
      const month = getMonth();
      const path = `/tmp/sips/${month}/${fileName}`;
      console.log(colors.red, `----------- printing ${path} -----------`);
      console.log(colors.red, payload);
      getPdf(payload).then((res) => {
        moveFile(res, path);
        printFile(path);
      });
      console.log(colors.red, "----------- ----------- -----------");
    } else {
      const fileName = getDateFromTx(payload);
      console.log(
        colors.cyan,
        "----------- Append to log & update pdf -----------"
      );
      console.log(colors.cyan, payload);
      if (fileName) {
        getPdf(payload, moveFile, `/tmp/${fileName}`);
      }
      console.log(colors.cyan, "----------- ----------- -----------");
    }
  }
};

const getFileName = () => {
  const date = new Date().toLocaleDateString("sv");
  const time = new Date().toLocaleTimeString("sv");
  return `${date.split("-").join("")}_${time.split(":").join("")}.pdf`;
};

const getDateFromTx = (payload) => {
  const lines = payload.split("\n");
  let name;
  lines.forEach((line) => {
    const info = line.replace(/ +/g, " ").split(" ");
    if (info.length == 9) {
      name = `${info[1]}.pdf`;
      return;
    }
  });
  return name;
};

exports.processPayload = processPayload;
