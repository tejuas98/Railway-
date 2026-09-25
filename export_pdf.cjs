const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  
  const htmlPath = 'file:///Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/research_and_references_slide.html';
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  
  // Wait for all web fonts to load
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPdf = '/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/research_and_references_slide.pdf';
  await page.pdf({
    path: outPdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1',
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Also copy to brain artifacts directory
  const brainPdf = '/Users/toru/.gemini/antigravity-ide/brain/5c1eb704-4a41-430a-9bbd-597f7a32853e/research_and_references_slide.pdf';
  fs.copyFileSync(outPdf, brainPdf);

  // Take screenshot as well to cross check visual fidelity
  const outPng = '/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/screenshots/research_and_references_slide.png';
  await page.screenshot({ path: outPng, clip: { x: 0, y: 0, width: 1920, height: 1080 } });

  console.log('PDF generated at:', outPdf);
  console.log('PDF copied to brain artifacts at:', brainPdf);
  console.log('PDF File size:', fs.statSync(outPdf).size, 'bytes');

  await browser.close();
})();
