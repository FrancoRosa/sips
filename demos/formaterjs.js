const {jsPDF} = require('jspdf');
const { readFileSync } = require("fs");
const html = readFileSync("template.html", "utf8");
const sample = `
5027I 13MAR24 11:06A  706970890065300011 SQ:003 PU:01 PD:04 00039.333 MAG-OFF
PROMPTS- 12:****`;
const records = [];

for (let index = 0; index < 20; index++) {
  records.push(sample);
}
const date = new Date().toLocaleString("sv");
function generatePDFfromHTML(htmlContent, outputPath) {
  const doc = new jsPDF();
  doc.text(htmlContent, 10, 10);
  doc.save(outputPath);
  console.log('PDF generated successfully');
}

// Usage
const htmlContent = 'Hello World. This is custom HTML content.';
generatePDFfromHTML(htmlContent, 'custom.pdf');