const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.HERO_TEST_URL || 'http://127.0.0.1:3001/';
const viewports = [
  { width: 1440, height: 900 }, { width: 390, height: 844 },
  { width: 320, height: 568 }, { width: 844, height: 390 },
  { width: 768, height: 1024 },
];
async function run() {
  for (const [name, type, options] of [
    ['Edge', chromium, { channel: 'msedge' }], ['WebKit', webkit, {}],
  ]) {
    const browser = await type.launch({ headless: true, ...options });
    try {
      if (!process.env.HERO_TEST_FAILURE_ONLY) for (const viewport of viewports) {
        const page = await browser.newPage({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2, {}, { timeout: 30000 });
        await page.waitForFunction(() => getComputedStyle(document.querySelector('video')).opacity === '1');
        const duration = await page.locator('video').evaluate(video => video.duration);
        await page.evaluate(() => {
          const hero = document.querySelector('.hero-sequence');
          scrollTo(0, (hero.offsetHeight - innerHeight) * .55);
        });
        await page.waitForFunction(duration => {
          const video = document.querySelector('video');
          return !video.seeking && video.currentTime > duration * .5;
        }, duration);
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForFunction(() => {
          const video = document.querySelector('video');
          return !video.seeking && video.currentTime < .15;
        });
        assert.equal(errors.length, 0, errors.join('\n'));
        assert.ok(await page.locator('video').evaluate(video => video.videoWidth > 0 && !video.error));
        console.log('PASS', name, `${viewport.width}x${viewport.height}`, 'load, forward/reverse scroll, no runtime errors');
        await page.close();
      }
    } finally { await browser.close(); }
    // Start a fresh browser so WebKit's media cache cannot mask a failed request.
    const failureBrowser = await type.launch({ headless: true, ...options });
    try {
      const page = await failureBrowser.newPage();

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
      await page.locator('video').evaluate(video => { video.src = '/media/unavailable-hero-test.mp4'; video.load(); });
      const retry = page.getByRole('button', { name: /(Start|Retry) film/ });
      await retry.waitFor({ timeout: 30000 });
      assert.ok(await page.locator('.hero-stage').evaluate(element => getComputedStyle(element).backgroundImage.includes('sarv-hero-poster.webp')));
      await page.locator('video').evaluate(video => { video.preload = 'none'; video.src = '/media/sarv-hero.mp4'; });
      await retry.click();
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
      console.log('PASS', name, 'network failure fallback and retry');
    } finally { await failureBrowser.close(); }
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });


