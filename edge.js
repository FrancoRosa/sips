import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.0";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dips@knelec.ca",
    pass: "Password2011570!",
  },
});
Deno.serve(async (req) => {
  if (req.method === "POST") {
    const formData = await req.formData();
    const file = formData.get("file");
    const sips_id = formData.get("sips_id");
    const path = formData.get("path");

    const stream = file.stream();
    const reader = stream.getReader();
    const chunks = [];
    let totalSize = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
    }
    const fileBuffer = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      fileBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    if (!file || file.size > 16384) {
      return new Response("File too large", {
        status: 400,
      });
    }
    const { data: sipsData, error: idError } = await supabase
      .from("sips_locations")
      .select("name, enabled, email_receivers")
      .eq("id", sips_id)
      .single();
    if (idError) {
      return new Response(`Error uploading file ${idError.message}`, {
        status: 500,
      });
    }
    if (!sipsData) {
      return new Response("sips id does not exist", {
        status: 500,
      });
    }
    const { data, error: uploadError } = await supabase.storage
      .from("sips")
      .upload(`sips/${sips_id}/${path}`, fileBuffer);

    if (uploadError) {
      return new Response(`Error uploading file  ${idError.message}`, {
        status: 500,
      });
    }

    const mailOptions = {
      from: {
        name: sipsData.name,
        address: "dips@knelec.ca",
      },
      // to: "km115.franco@gmail.com, dcurry@kennedyenergy.com",
      to: sipsData.email_receivers.join(", "),
      subject: `${sipsData.name} FSC Midnight report`,
      text: `${sipsData.name} FSC Midnight report, file attached`,
      attachments: [
        {
          filename: file.name,
          content: fileBuffer,
        },
      ],
    };
    if (sipsData.enabled) {
      const info = await transporter.sendMail(mailOptions);
      return new Response(
        `File uploaded and mailed successfully, ${info.messageId}`,
        {
          status: 200,
        }
      );
    }
    return new Response(
      `File uploaded successfully but not emailed (disabled)`,
      {
        status: 200,
      }
    );
  }
  return new Response("Method not allowed", {
    status: 405,
  });
});
