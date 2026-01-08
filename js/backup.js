const os = require("os");
const path = require("path");
const { colors } = require("./colors");

const { readFileSync, writeFileSync, mkdirSync } = require("fs");

const documentsPath = path.join(os.homedir(), "Documents");
const LOCAL_DIR = `${documentsPath}/sips_files`;
const BACKUPS_DIR = `${documentsPath}/sips_files/backups.json`;

mkdirSync(LOCAL_DIR, { recursive: true });

const readBackUps = () => {
  const initialBackup = { transactions: [], reports: [] };
  try {
    const fileContent = readFileSync(BACKUPS_DIR, "utf8");
    return JSON.parse(fileContent) || initialBackup;
  } catch (error) {
    writeBackUps(initialBackup);
    return initialBackup;
  }
};

const writeBackUps = (obj) => {
  const outputString = JSON.stringify(obj, null, 2);
  writeFileSync(BACKUPS_DIR, outputString, "utf8");
};

const addObjToBackup = (type, payload) => {
  const queue = readBackUps();
  queue[type].push(...payload);
  writeBackUps(queue);
};

const getReportsFromBackup = () => {
  const queue = readBackUps() || { transactions: [], reports: [] };
  if (queue.reports.length > 0) {
    return queue.reports;
  } else return false;
};

const getTransFromBackup = () => {
  const queue = readBackUps();
  if (queue.transactions.length > 0) {
    return queue.transactions;
  } else return false;
};

const removeTransFromBackup = () => {
  const queue = readBackUps() || { transactions: [], reports: [] };
  queue.transactions = [];
  writeBackUps(queue);
};

const removeReportsFromBackup = () => {
  const queue = readBackUps() || { transactions: [], reports: [] };
  queue.reports = [];
  writeBackUps(queue);
};

exports.addObjToBackup = addObjToBackup;
exports.getReportsFromBackup = getReportsFromBackup;
exports.getTransFromBackup = getTransFromBackup;
exports.removeReportsFromBackup = removeReportsFromBackup;
exports.removeTransFromBackup = removeTransFromBackup;
exports.LOCAL_DIR = LOCAL_DIR;
