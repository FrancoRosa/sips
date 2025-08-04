const { createClient } = require("@supabase/supabase-js");
const { url, key } = require("./credentials.json");
const { sips_id } = require("../settings");
const { addObjToBackup } = require("./helpers");
const supabase = createClient(url, key);

const insertTransactions = async (transactions) => {
  if (insertTransactions.length > 0) {
    const { statusText } = await supabase
      .from("sips_transactions")
      .insert(transactions.map((t) => ({ sips_location_id: sips_id, ...t })))
      .select();
    if (statusText !== "Created") {
      await addObjToBackup("transactions", ...transactions);
    }
  }
  return true;
};

const insertReports = async (reports) => {
  if (insertReports.length > 0) {
    for (const report of reports) {
      const { statusText } = await supabase
        .from("sips_reports")
        .insert({ sips_location_id: sips_id, ...report })
        .select();
      if (statusText !== "Created") {
        await addObjToBackup("reports", report);
      }
    }
  }
  return true;
};

const insertData = async (data) => {
  const txResult = await insertTransactions(data.transactions);
  const rxResult = await insertReports(data.reports);
  console.log({ txResult, rxResult });
};

exports.insertData = insertData;
