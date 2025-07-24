const { createClient } = require('@supabase/supabase-js');
const {sb} = require('./credentials.json');
const supabase = createClient(sb.url, sb.key)

const getSettings = async (sips_id) => {
    const {error,data} = await supabase.from("sips_locations").select("*").eq("id", sips_id).single()
    return data ? data : false
}

getSettings(100).then(res => {console.log(res)})
