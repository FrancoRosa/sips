import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
serve(async (req) => {
  const { type, table, record } = await req.json();
  if (type !== "INSERT" || table !== "sips_reports") {
    return new Response("Ignored", {
      status: 200
    });
  }
  const { sips_location_id, id: report_id } = record;
  // Get emails associated with the sips_location_id
  const { data: sips_location, error: emailErr } = await supabase.from("sips_locations").select("name, email_receivers").single().eq("id", sips_location_id);
  if (emailErr || !sips_location.email_receivers || sips_location.email_receivers.length === 0) {
    console.error("Email fetch error or no receivers:", emailErr);
    return new Response("No receivers", {
      status: 500
    });
  }
  // Get full report details if needed
  const { data: report, error: reportErr } = await supabase.from("sips_reports").select("*").eq("id", report_id).single();
  if (reportErr || !report) {
    console.error("Report fetch error:", reportErr);
    return new Response("No report found", {
      status: 500
    });
  }
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "dips@knelec.ca",
      pass: "Password2011570!"
    }
  });
  const emailList = sips_location.email_receivers.join(", ");
  await transporter.sendMail({
    from: {
      name: sips_location.name,
      address: "dips@knelec.ca"
    },
    to: emailList,
    subject: `Report FSC ${sips_location.name}`,
    text: JSON.stringify(report, null, 2),
    html: `<pre>${report.report}</pre>`
  });
  return new Response("Email sent", {
    status: 200
  });
});
