const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://pojdsemkamjdes.cz';

// Tablet viewport sizes (landscape orientation)
// Using deviceScaleFactor: 1 to stay within Google Play's 3840px max dimension limit
const VIEWPORTS = {
  '7inch': { width: 3840, height: 2400, deviceScaleFactor: 1 },
  '10inch': { width: 3840, height: 2400, deviceScaleFactor: 1 },
};

// Pages to screenshot with their URLs and descriptive names
const PAGES = [
  { url: '/', name: 'homepage', waitFor: 6000 },
  { url: '/lokality', name: 'localities', waitFor: 5000 },
  { url: '/akce', name: 'events', waitFor: 5000 },
  { url: '/kuchyne', name: 'cuisines', waitFor: 5000 },
];

async function generateScreenshots() {
  console.log('🚀 Starting tablet screenshot generation...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const [sizeName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`📱 Generating screenshots for ${sizeName} tablet (${viewport.width}x${viewport.height})...`);

    const outputDir = path.join(__dirname, '..', 'store-listing', 'screenshots', `tablet-${sizeName}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const page = await browser.newPage();
    await page.setViewport(viewport);

    for (let i = 0; i < PAGES.length; i++) {
      const pageConfig = PAGES[i];
      const url = `${BASE_URL}${pageConfig.url}`;

      console.log(`  📸 ${i + 1}/${PAGES.length} Taking screenshot of ${url}...`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for loading spinner to disappear (if present)
        try {
          await page.waitForSelector('.animate-spin', { hidden: true, timeout: 10000 });
        } catch (e) {
          // Loading spinner might not be present or might not disappear, continue anyway
        }

        // Wait for additional time to ensure all content is loaded
        await new Promise(resolve => setTimeout(resolve, pageConfig.waitFor));

        // Hide the Android app promo banner using CSS injection
        await page.addStyleTag({
          content: `
            /* Hide all fixed/sticky elements at the top with purple background */
            div[style*="rgb(128, 90, 213)"],
            div[style*="purple"],
            [class*="bg-purple"],
            div[class*="fixed"]:has(a[href*="instagram"]),
            div[class*="sticky"]:has(a[href*="instagram"]) {
              display: none !important;
            }
            /* Ensure body starts from top */
            body {
              padding-top: 0 !important;
              margin-top: 0 !important;
            }
          `
        });

        // Also try JavaScript removal
        await page.evaluate(() => {
          // Find all elements and check their background color
          const allDivs = document.querySelectorAll('div');
          allDivs.forEach(div => {
            const style = window.getComputedStyle(div);
            const bgColor = style.backgroundColor;
            const position = style.position;

            // Check if it's a purple banner (rgb(128, 90, 213))
            if (bgColor && (
              bgColor.includes('128, 90, 213') ||
              bgColor.includes('128,90,213') ||
              (bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) &&
               Math.abs(parseInt(RegExp.$1) - 128) < 10 &&
               Math.abs(parseInt(RegExp.$2) - 90) < 10 &&
               Math.abs(parseInt(RegExp.$3) - 213) < 10)
            )) {
              div.remove();
            }
          });
        });

        // First, ensure we're at the very top
        await page.evaluate(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Scroll to trigger any lazy-loaded images
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Scroll back to absolute top to show page title and content from beginning
        await page.evaluate(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
        await new Promise(resolve => setTimeout(resolve, 1500));

        const filename = path.join(outputDir, `${i + 1}-${pageConfig.name}.png`);
        await page.screenshot({
          path: filename,
          fullPage: false, // Only visible viewport
          type: 'png',
        });

        console.log(`  ✅ Saved: ${filename}`);
      } catch (error) {
        console.error(`  ❌ Error taking screenshot of ${url}:`, error.message);
      }
    }

    await page.close();
    console.log(`✨ Completed ${sizeName} screenshots\n`);
  }

  await browser.close();
  console.log('🎉 All tablet screenshots generated successfully!');
}

generateScreenshots().catch((error) => {
  console.error('❌ Error generating screenshots:', error);
  process.exit(1);
});
