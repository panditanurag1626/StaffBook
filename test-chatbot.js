const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('FAILED REQUEST:', request.url(), request.failure().errorText));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000);
  await browser.close();
})();
