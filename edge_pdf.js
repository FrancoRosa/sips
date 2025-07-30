import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

// Initialize Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

serve(async (req) => {
  const { type, table, record } = await req.json();

  if (type !== "INSERT" || table !== "sips_reports") {
    return new Response("Ignored", { status: 200 });
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
    return new Response("No receivers", { status: 500 });
  }

  // Fetch report
  const { data: report, error: reportErr } = await supabase
    .from("sips_reports")
    .select("*")
    .eq("id", report_id)
    .single();

  if (reportErr || !report) {
    console.error("No report found:", reportErr);
    return new Response("No report found", { status: 500 });
  }

  // Generate PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  doc.setFont("courier", "normal");
  const content = report.report || JSON.stringify(report, null, 2);

  const lines = doc.splitTextToSize(content, 180);
  const linesPerPage = 40;
  const pages = Array.from({ length: Math.ceil(lines.length / linesPerPage) }, (_, i) =>
    lines.slice(i * linesPerPage, (i + 1) * linesPerPage)
  );

  pages.forEach((page, i) => {
    doc.setFontSize(12);
    doc.text(page, 10, 10);
    doc.setTextColor(160);
    doc.text(`${i + 1}/${pages.length}`, 180, 280);
    if (i < pages.length - 1) doc.addPage();
  });

  const pdfBuffer = doc.output("arraybuffer");

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
    from: { name: sips_location.name, address: "dips@knelec.ca" },
    to: sips_location.email_receivers.join(", "),
    subject: `Report FSC ${sips_location.name}`,
    text: "Attached is the full report.",
    attachments: [
      {
        filename: `report-${report_id}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ],
  });

  return new Response("Email with PDF sent", { status: 200 });
});
