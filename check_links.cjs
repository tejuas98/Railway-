const https = require('https');
const http = require('http');

const links = [
  "https://enquiry.indianrail.gov.in",
  "https://whereismytrain.in",
  "https://www.railyatri.in",
  "https://doi.org/10.1016/j.tre.2025.103982",
  "https://backend.orbit.dtu.dk/ws/portalfiles/portal/110602997/PhD_2013_02.pdf",
  "https://lab-work.github.io/download/barbour2018prediction.pdf",
  "https://arxiv.org/abs/2510.01262",
  "https://www.researchgate.net/publication/396261601_Ten_quick_tips_for_improving_estimated_time_of_arrival_predictions_using_machine_learning_in_logistics_and_transportation_systems",
  "https://arxiv.org/abs/2510.09350",
  "https://pdfs.semanticscholar.org/9f67/39912a7ea225287d86df71dc40a58eb98d9b.pdf",
  "https://transitlab.mit.edu/",
  "https://sih.gov.in",
  "https://bel-india.in/product/real-time-train-information-system-rtis/",
  "https://www.sihbuddy.in/ps/SIH26028",
  "https://www.sac.gov.in",
  "https://indianrailways.gov.in/railwayboard/uploads/codesmanual/operating%20manual-traffic.pdf",
  "https://cris.org.in",
  "https://indianrailways.gov.in",
  "https://cag.gov.in",
  "https://railmadad.indianrailways.gov.in"
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    return { url, status: res.status, ok: res.ok, finalUrl: res.url };
  } catch (err) {
    return { url, error: err.message };
  }
}

(async () => {
  console.log('Testing ' + links.length + ' links...\n');
  for (const url of links) {
    const res = await checkUrl(url);
    if (res.error) {
      console.log(`❌ [ERROR] ${url} -> ${res.error}`);
    } else if (res.ok) {
      console.log(`✅ [${res.status}] ${url}`);
    } else {
      console.log(`⚠️ [${res.status}] ${url} -> Final: ${res.finalUrl}`);
    }
  }
})();
