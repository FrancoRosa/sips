import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import nodemailer from "npm:nodemailer@6.9.0";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
serve(async (req) => {
  const { type, table, record } = await req.json();
  if (type !== "INSERT" || table !== "sips_reports") {
    return new Response("Ignored", {
      status: 200,
    });
  }
  const { sips_location_id, id: report_id } = record;
  // Fetch location and email receivers
  const { data: sips_location, error: emailErr } = await supabase
    .from("sips_locations")
    .select("name, email_receivers")
    .eq("id", sips_location_id)
    .single();
  if (emailErr || !sips_location?.email_receivers?.length) {
    console.error("No receivers:", emailErr);
    return new Response("No receivers", {
      status: 500,
    });
  }
  // Fetch report
  const { data: report, error: reportErr } = await supabase
    .from("sips_reports")
    .select("*")
    .eq("id", report_id)
    .single();
  if (reportErr || !report) {
    console.error("No report found:", reportErr);
    return new Response("No report found", {
      status: 500,
    });
  }
  const { data: transactions, error: txErr } = await supabase
    .from("sips_transactions")
    .select("transaction")
    .eq("sips_location_id", sips_location_id)
    .eq("date", report.date);
  // Generate PDF report
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  const content = report.report || JSON.stringify(report, null, 2);
  const lines = doc.splitTextToSize(content, 180);
  const linesPerPage = 50;
  const pages = Array.from(
    {
      length: Math.ceil(lines.length / linesPerPage),
    },
    (_, i) => lines.slice(i * linesPerPage, (i + 1) * linesPerPage)
  );
  pages.forEach((page, i) => {
    doc.setFontSize(10);
    doc.text(page, 10, 10);
    doc.setTextColor(160);
    doc.text(`${i + 1}/${pages.length}`, 180, 280);
    if (i < pages.length - 1) doc.addPage();
  });
  const pdfBuffer = doc.output("arraybuffer");
  const doc2 = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  doc2.setFont("courier", "normal");
  doc2.setFontSize(10);
  const content2 =
    transactions.map((t) => t.transaction).join("\n") ||
    "No transactions recorded";
  const lines2 = doc2.splitTextToSize(content2, 240);
  const linesPerPage2 = 36;
  const pages2 = Array.from(
    {
      length: Math.ceil(lines2.length / linesPerPage2),
    },
    (_, i) => lines2.slice(i * linesPerPage2, (i + 1) * linesPerPage2)
  );
  pages2.forEach((page, i) => {
    doc2.setFontSize(12);
    doc2.text(page, 10, 10);
    doc2.setTextColor(160);
    doc2.text(`${i + 1}/${pages2.length}`, 180, 280);
    if (i < pages2.length - 1) doc2.addPage();
  });
  const pdfBuffer2 = doc2.output("arraybuffer");
  // Send email with PDF
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "dips@knelec.ca",
      pass: "Password2011570!",
    },
  });
  await transporter.sendMail({
    from: {
      name: sips_location.name,
      address: "dips@knelec.ca",
    },
    to: sips_location.email_receivers.join(", "),
    subject: `Report FSC ${sips_location.name} ${report.date} `,
    text: `Attached is the full report. \n FSC ${sips_location.name} ${report.date} `,
    attachments: [
      {
        filename: `report_${sips_location.name.replaceAll(" ", "")}_${
          report.date
        }.pdf`,
        content: new Uint8Array(pdfBuffer),
        contentType: "application/pdf",
      },
      {
        filename: `transactions_${sips_location.name.replaceAll(" ", "")}_${
          report.date
        }.pdf`,
        content: new Uint8Array(pdfBuffer2),
        contentType: "application/pdf",
      },
    ],
  });
  return new Response("Email with PDF sent", {
    status: 200,
  });
});
