const puppeteer = require('/Users/toru/.gemini/antigravity-ide/scratch/sarjom-prototype/node_modules/puppeteer-core');

const links = [
  { name: "Table Header: NTES (CRIS)", url: "https://enquiry.indianrail.gov.in/mntes/" },
  { name: "Table Header: Where Is My Train", url: "https://whereismytrain.in/" },
  { name: "Table Header: RailYatri", url: "https://www.railyatri.in/" },
  { name: "Academic 1: Elsevier TR-E", url: "https://doi.org/10.1016/j.tre.2020.102022" },
  { name: "Academic 2: DTU Denmark PhD", url: "https://backend.orbit.dtu.dk/ws/portalfiles/portal/110602997/PhD_2013_02.pdf" },
  { name: "Academic 3: MIT Barbour 2018", url: "https://lab-work.github.io/download/barbour2018prediction.pdf" },
  { name: "Academic 4: arXiv:2510.01262 (RSTGCN)", url: "https://arxiv.org/abs/2510.01262" },
  { name: "Academic 5: ResearchGate 10 ETA Tips", url: "https://www.researchgate.net/publication/396261601_Ten_quick_tips_for_improving_estimated_time_of_arrival_predictions_using_machine_learning_in_logistics_and_transportation_systems" },
  { name: "Academic 6: arXiv:2510.09350 (ST-GAT)", url: "https://arxiv.org/abs/2510.09350" },
  { name: "Academic 7: Eastern-European Journal", url: "https://pdfs.semanticscholar.org/9f67/39912a7ea225287d86df71dc40a58eb98d9b.pdf" },
  { name: "Academic 8: MIT Transit Lab", url: "https://transitlab.mit.edu/" },
  { name: "PS / Portal 1: SIH 2026 Portal", url: "https://sih.gov.in/" },
  { name: "PS / Portal 2: BEL RTIS (LDU)", url: "https://bel-india.in/product/real-time-train-information-system-rtis/" },
  { name: "PS / Portal 3: SIH Buddy Deep Dive", url: "https://www.sihbuddy.in/ps/SIH26028" },
  { name: "PS / Portal 4: ISRO SAC NavIC", url: "https://www.sac.gov.in/" },
  { name: "PS / Portal 5: Official NTES Portal", url: "https://enquiry.indianrail.gov.in/mntes/" },
  { name: "PS / Portal 6: IR Operating Manual (Rule 401)", url: "https://indianrailways.gov.in/railwayboard/uploads/codesmanual/operating%20manual-traffic.pdf" },
  { name: "PS / Portal 7: CRIS Portal", url: "https://cris.org.in/" },
  { name: "PS / Portal 8: Railway General Rules", url: "https://indianrailways.gov.in/" },
  { name: "PS / Portal 9: Where Is My Train", url: "https://whereismytrain.in/" },
  { name: "PS / Portal 10: CAG Audit Report 32", url: "https://cag.gov.in/" },
  { name: "PS / Portal 11: RailYatri.in", url: "https://www.railyatri.in/" },
  { name: "PS / Portal 12: RailMadad Portal", url: "https://railmadad.indianrailways.gov.in/" }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];

  for (let i = 0; i < links.length; i++) {
    const item = links[i];
    process.stdout.write(`Testing [${i + 1}/${links.length}] ${item.name}... `);
    try {
      const response = await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const status = response ? response.status() : 'loaded';
      const title = await page.title();
      const currentUrl = page.url();
      console.log(`OK (Status: ${status}, Title: "${title.slice(0, 45)}...")`);
      results.push({ name: item.name, url: item.url, status, title, currentUrl, ok: true });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({ name: item.name, url: item.url, error: err.message, ok: false });
    }
  }

  await browser.close();
  console.log('\n--- SUMMARY ---');
  const successful = results.filter(r => r.ok).length;
  console.log(`Passed: ${successful}/${results.length}`);
})();
