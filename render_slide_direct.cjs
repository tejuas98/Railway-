const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');

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

  const outPath = '/Users/toru/.gemini/antigravity-ide/scratch/Railway-repo/docs/screenshots/technical_approach_slide.png';
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  console.log('Saved screenshot to:', outPath);
  await browser.close();
})();
