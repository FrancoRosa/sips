const { createClient } = require("@supabase/supabase-js");
const { url, key } = require("./credentials.json");
const { sips_id } = require("../settings");
const { savedReports, savedTransactions } = require("../backups");
const supabase = createClient(url, key);

const getDateFromReport = (payload) => {
  const lines = payload.split("\n");
  for (const line of lines) {
    if (line.includes("MIDNIGHT")) {
      const textDate = line.split("FOR:")[1];
      return new Date(textDate).toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
};

const getDateFromTransaction = (payload) => {
  const lines = payload.split("\n");
  for (const line of lines) {
    if (line.includes("MAG")) {
      const textDate = line.split(" ")[1];
      return new Date(textDate).toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
};

const getLocation = async () => {
  const test = await supabase
    .from("sips_locations")
    .select()
    .single()
    .eq("id", sips_id);
  console.log(test);
};

const insertTransactions = async (transactions) => {
  if (insertTransactions.length > 0) {
    const { statusText } = await supabase
      .from("sips_transactions")
      .insert(transactions.map((t) => ({ sips_location_id: sips_id, ...t })))
      .select();
    return statusText;
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
        savedReports.push(report);
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
