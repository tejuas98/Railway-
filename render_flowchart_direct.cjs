const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

async function renderFlowchart() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

  const svgPath = path.resolve(__dirname, 'docs/assets/detailed_user_flowchart_3_users.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 1400px; height: 900px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; }
        svg { width: 1400px; height: 900px; }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 500));
  
  const outPath = path.resolve(__dirname, 'docs/screenshots/detailed_user_flowchart_3_users.png');
  await page.screenshot({ path: outPath });
  console.log(`Rendered flowchart PNG to: ${outPath}`);

  await browser.close();
}

renderFlowchart().catch(err => {
  console.error(err);
  process.exit(1);
});
