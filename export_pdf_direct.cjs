const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('file:///Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/technical_approach_slide.html', { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  const outPdf = '/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/technical_approach_slide.pdf';
  await page.pdf({
    path: outPdf,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1',
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  console.log('PDF saved to:', outPdf);
  await browser.close();
})();
