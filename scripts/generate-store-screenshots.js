// Google Play screenshots (phone + 7" + 10" tablet) taken from the real static
// app build (`out/`, produced by `npm run build:mobile`), with window.Capacitor
// stubbed so the page behaves like the native app: photos and data live from the
// production website/API (so it needs network).
//
//   npm run build:mobile && node scripts/generate-store-screenshots.js            # Czech
//   npm run build:mobile && LOCALE=en node scripts/generate-store-screenshots.js  # English -> screenshots-en/
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');
const LOCALE = process.env.LOCALE === 'en' ? 'en' : 'cs';
const PORT = 8099;
const BASE = `http://localhost:${PORT}`;

const DEVICES = {
  // Phone portrait 1080x1920
  phone: { width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  // Tablets landscape: 7" 1920x1200, 10" 2560x1600
  'tablet-7inch': { width: 960, height: 600, deviceScaleFactor: 2 },
  'tablet-10inch': { width: 1280, height: 800, deviceScaleFactor: 2 },
};

// A few favorites so the pinned star state shows up (restaurants + cafes with local photos).
const FAVORITES = { restaurant: [2336, 885, 884], cafe: [11, 10] };

// scrollTo: text of an element to bring near the top of the viewport before the
// shot (offset = px of breathing room above it); carouselPhoto: scroll the
// "Nejnovější návštěvy" carousel to the first visit that has a real photo.
const SHOTS_CS = [
  { file: '1-homepage', url: '/', scrollTo: 'Nejnovější návštěvy', offset: 130, carouselPhoto: true },
  { file: '2-restaurants', url: '/', scrollTo: 'Rychlé filtry', offset: 24 },
  { file: '3-place-detail', url: '/', scrollTo: 'Rychlé filtry', offset: 24, openFirstPlace: true },
  { file: '4-cafes', url: '/kavarny/', scrollTo: 'Kategorie:', offset: 24 },
  { file: '5-cuisines', url: '/kuchyne/' },
  { file: '6-events', url: '/akce/' },
  { file: '7-localities', url: '/lokality/' },
];

// openFirstPlace: tap the first restaurant card so the detail dialog is in the shot
const SHOTS_EN = [
  { file: '1-homepage', url: '/en', scrollTo: 'Latest visits', offset: 130, carouselPhoto: true },
  { file: '2-restaurants', url: '/en', scrollTo: 'Quick filters', offset: 24 },
  { file: '3-place-detail', url: '/en', scrollTo: 'Quick filters', offset: 24, openFirstPlace: true },
  { file: '4-cafes', url: '/en/kavarny/', scrollTo: 'Category:', offset: 24 },
  { file: '5-cuisines', url: '/en/kuchyne/' },
  { file: '6-events', url: '/en/akce/' },
  { file: '7-localities', url: '/en/lokality/' },
];

const SHOTS = LOCALE === 'en' ? SHOTS_EN : SHOTS_CS;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(OUT_DIR, p);
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    }).listen(PORT, () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  for (const [device, viewport] of Object.entries(DEVICES)) {
    const dir = path.join(__dirname, '..', 'store-listing', LOCALE === 'en' ? 'screenshots-en' : 'screenshots', device);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n📱 ${device} ${viewport.width * viewport.deviceScaleFactor}x${viewport.height * viewport.deviceScaleFactor}`);

    for (const shot of SHOTS) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      await page.evaluateOnNewDocument((favorites) => {
        window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android' };
        localStorage.setItem('favorites:v1', JSON.stringify(favorites));
      }, FAVORITES);

      await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2500));

      // Keep the shots clean: the floating language pill overlaps headings.
      await page.addStyleTag({ content: 'a.fixed.top-3.right-3 { display: none !important; }' });

      if (shot.carouselPhoto) {
        await page.evaluate(() => {
          const card = Array.from(document.querySelectorAll('[data-carousel-card]')).find((c) => c.querySelector('img[src*="supabase.co"]'));
          const track = card && card.parentElement;
          if (card && track) track.scrollTo({ left: card.offsetLeft - 16, behavior: 'instant' });
        });
      }

      if (shot.scrollTo) {
        await page.evaluate((text, offset) => {
          const el = Array.from(document.querySelectorAll('h1,h2,h3,p,label')).find((h) => h.textContent.trim().includes(text));
          if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
        }, shot.scrollTo, shot.offset || 16);
      }
      if (shot.openFirstPlace) {
        await page.evaluate(() => {
          const card = Array.from(document.querySelectorAll('[role=button]')).find((e) => e.querySelector('.font-serif') && /\/10/.test(e.textContent) && !e.closest('[data-carousel-card]'));
          if (card) card.click();
        });
        // the dialog loads visits and similar places from the live API
        await new Promise((r) => setTimeout(r, 4000));
      }
      await new Promise((r) => setTimeout(r, 1500));

      const out = path.join(dir, `${shot.file}.png`);
      await page.screenshot({ path: out });
      console.log(`  ✓ ${shot.file}.png`);
      await page.close();
    }
  }

  await browser.close();
  server.close();
})();
