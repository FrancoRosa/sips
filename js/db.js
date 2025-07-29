const { createClient } = require('@supabase/supabase-js')
const { url, key } = require("./credentials.json")
const { sips_id } = require("../settings")
const supabase = createClient(url, key)

const getLocation = async () => {
    const test = await supabase
        .from("sips_locations")
        .select().single().eq("id", sips_id)
    console.log(test)
}
const insertTransactions = async (transactions) => {
    console.log({ transactions })
    transactions.forEach(async (transaction) => {
        await insertTransaction(transaction)
    });
}

const insertTransaction = async (transaction) => {
    const { statusText } = await supabase
        .from("sips_transactions")
        .insert({ sips_location_id: sips_id, transaction })
        .select()
    console.log({ statusText })
}

const insertReport = async (report) => {
    const { statusText } = await supabase
        .from("sips_reports")
        .insert({ sips_location_id: sips_id, report })
        .select()
    console.log({ statusText })
}

exports.insertReport = insertReport
exports.insertTransactions = insertTransactions