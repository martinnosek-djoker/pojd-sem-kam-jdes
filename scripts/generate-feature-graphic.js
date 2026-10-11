// Google Play feature graphic (1024x500) in the terracotta identity, rendered
// from HTML with Lora (the site's serif) so it matches the og-image.
//
//   node scripts/generate-feature-graphic.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const mark = fs.readFileSync(path.join(ROOT, 'public', 'images', 'logo-mark.png')).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Work+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1024px;height:500px;overflow:hidden}
  .g{position:relative;width:1024px;height:500px;background:#FBF3E7;
     background-image:radial-gradient(ellipse 70% 90% at 50% 50%,#F6DFCB 0%,#FBF3E7 70%);
     display:flex;align-items:center;justify-content:center;gap:56px;padding:0 90px}
  .corner{position:absolute;width:64px;height:64px;border:0 solid #D98B6A}
  .tl{top:28px;left:28px;border-top-width:2px;border-left-width:2px}
  .br{bottom:28px;right:28px;border-bottom-width:2px;border-right-width:2px}
  img{width:300px;height:auto;flex:none}
  .t h1{font-family:'Lora',serif;font-weight:700;font-size:64px;line-height:1.08;color:#2E2019}
  .t .rule{width:96px;height:3px;background:#C1572E;margin:24px 0 20px}
  .t p{font-family:'Work Sans',sans-serif;font-weight:600;font-size:24px;line-height:1.3;color:#C1572E}
</style></head><body><div class="g">
  <div class="corner tl"></div><div class="corner br"></div>
  <img src="data:image/png;base64,${mark}">
  <div class="t"><h1>Pojď sem!<br>Kam jdeš?</h1><div class="rule"></div>
  <p>Nejlepší restaurace a kavárny<br>v Praze</p></div>
</div></body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'store-listing', 'graphics', 'feature-graphic.png');
  await page.screenshot({ path: out, type: 'png' });
  await browser.close();
  console.log('wrote', path.relative(ROOT, out));
})();
