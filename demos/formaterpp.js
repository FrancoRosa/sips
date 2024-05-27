const puppeteer = require('puppeteer');

async function generatePDFfromHTML(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();
}

// Usage
const htmlContent = '<h1>Hello World</h1><p>This is custom HTML content.</p>';
generatePDFfromHTML(htmlContent, 'custom.pdf')
  .then(() => console.log('PDF generated successfully'))
  .catch(err => console.error('Error generating PDF:', err));