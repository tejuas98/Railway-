const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('file:///Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/research_and_references_slide.html', { waitUntil: 'networkidle0' });
  
  // Wait for web fonts to load
  await page.evaluateHandle('document.fonts.ready');

  const outPath = '/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/screenshots/research_and_references_slide.png';
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1920, height: 1080 } });

  // Also copy to brain artifacts
  const brainPath = '/Users/toru/.gemini/antigravity-ide/brain/5c1eb704-4a41-430a-9bbd-597f7a32853e/research_and_references_slide.png';
  const fs = require('fs');
  fs.copyFileSync(outPath, brainPath);

  console.log('Successfully captured 1920x1080 slide to:', outPath);
  await browser.close();
})();
