// Only required if Node <18
// import fetch from "node-fetch";
const fs = require("fs");
const FormData = require("form-data");

/**
 * Uploads a file to a Supabase Edge Function
 * @param {string} edgeFunctionUrl - The full URL to the Edge Function
 * @param {string} filePath - Path to the file on disk
 * @param {string} sips_id - The sips_id to send
 * @param {string} path - The destination path in Supabase Storage
 */
async function sendFileToEdgeFunction(
  edgeFunctionUrl,
  filePath,
  sips_id,
  path
) {
  const form = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  form.append("file", fileBuffer, {
    filename: "output.pdf",
    contentType: "application/pdf",
  });
  form.append("sips_id", sips_id);
  form.append("path", path);

  const response = await fetch(edgeFunctionUrl, {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zeWRvd3Vkb3Flc3NrZ21ndHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc0ODc0NDAsImV4cCI6MjAxMzA2MzQ0MH0.uynpLHpBVJA0ny6LNfO1QHhPFcOhznX8GkxW8_f_0CY",
    },
  });

  const text = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(`Response: ${text}`);
}

sendFileToEdgeFunction(
  "https://osydowudoqesskgmgtwd.supabase.co/functions/v1/sips_emails",
  "./js/output.pdf",
  "100", // sips_id
  "100/2025-07/output.pdf" // destination path
);
