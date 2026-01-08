const { createClient } = require("@supabase/supabase-js");
const { url, key } = require("./credentials.json");

const {
  addObjToBackup,
  getReportsFromBackup,
  getTransFromBackup,
  removeReportsFromBackup,
  removeTransFromBackup,
} = require("./backup");

const supabase = createClient(url, key);

const insertTransactions = async (transactions, sips_id) => {
  const queue = (await getTransFromBackup()) || [];
  const fullTransactions = [...queue, ...transactions];
  if (fullTransactions.length > 0) {
    const payload = fullTransactions.map((t) => ({
      sips_location_id: sips_id,
      ...t,
    }));
    const { statusText, error } = await supabase
      .from("sips_transactions")
      .insert(payload)
      .select();
    error && console.error(error);

    if (statusText !== "Created") {
      console.log("... error, not uploaded but stored");
      await addObjToBackup("transactions", [...transactions]);
    } else {
      console.log(colors.cyan, "... transaction successfully uploaded");
      removeTransFromBackup();
    }
  }
  return true;
};

const insertReports = async (reports, sips_id) => {
  const queue = (await getReportsFromBackup()) || [];
  const fullReports = [...queue, ...reports];

  if (fullReports.length > 0) {
    const payload = fullReports.map((t) => ({
      sips_location_id: sips_id,
      ...t,
    }));
    const { statusText, error } = await supabase
      .from("sips_reports")
      .insert(payload)
      .select();
    error && console.error(error);

    if (statusText !== "Created") {
      console.log("... error, not uploaded but stored");
      await addObjToBackup("reports", [...reports]);
    } else {
      console.log(colors.cyan, "... reports successfully uploaded");
      removeReportsFromBackup();
    }
  }
  return true;
};

const insertData = async (data, sips_id) => {
  const txResult = await insertTransactions(data.transactions, sips_id);
  const rxResult = await insertReports(data.reports, sips_id);
};

exports.insertData = insertData;
