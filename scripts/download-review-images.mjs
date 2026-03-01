#!/usr/bin/env node

/**
 * Script pro stažení obrázků k recenzím z API
 * Stáhne obrázky z Supabase storage a uloží je lokálně jako .webp
 *
 * Použití:
 *   node scripts/download-review-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVIEWS_DIR = path.join(__dirname, '..', 'public', 'images', 'reviews');
const BASE_URL = 'https://pojdsemkamjdes.cz';

// Vytvoř složku pokud neexistuje
if (!fs.existsSync(REVIEWS_DIR)) {
  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
}

/**
 * Normalizuje název soubolu (identické s ReviewCard.tsx)
 */
function normalizeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Stáhne obrázek z URL, vrátí buffer
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          contentType: response.headers['content-type']
        });
      });
    }).on('error', reject);
  });
}

/**
 * Stáhne obrázky pro všechny recenze
 */
async function downloadReviewImages() {
  console.log('\n📂 Stahování obrázků recenzí');
  console.log(`📥 Načítám seznam recenzí z ${BASE_URL}/api/reviews...`);

  let reviews;
  try {
    const response = await fetch(`${BASE_URL}/api/reviews`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    reviews = await response.json();
  } catch (error) {
    console.error(`❌ Chyba při fetchu recenzí: ${error.message}`);
    return { downloaded: 0, skipped: 0, failed: 0 };
  }

  if (!Array.isArray(reviews)) {
    console.error('❌ Neplatná odpověď z API');
    return { downloaded: 0, skipped: 0, failed: 0 };
  }

  console.log(`✓ Načteno ${reviews.length} recenzí`);

  const reviewsWithImages = reviews.filter(review => review.images && review.images.length > 0);
  console.log(`📸 S obrázky: ${reviewsWithImages.length}`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const review of reviewsWithImages) {
    const reviewId = review.id;
    const placeName = review.restaurant?.name || review.cafe?.name || 'review';
    const normalizedPlaceName = normalizeFileName(placeName);

    // Vytvoř složku pro recenzi
    const reviewDir = path.join(REVIEWS_DIR, reviewId.toString());
    if (!fs.existsSync(reviewDir)) {
      fs.mkdirSync(reviewDir, { recursive: true });
    }

    console.log(`\n📝 Recenze #${reviewId}: ${placeName}`);

    for (let i = 0; i < review.images.length; i++) {
      const imageUrl = review.images[i];

      // Skip local images
      if (imageUrl.startsWith('/images/')) {
        console.log(`  ⏭️  Obrázek ${i + 1} - již lokální`);
        skipped++;
        continue;
      }

      // Generate filename matching ReviewCard logic
      const fileName = i === 0
        ? `${normalizedPlaceName}.webp`
        : `${normalizedPlaceName}-${i + 1}.webp`;
      const targetPath = path.join(reviewDir, fileName);

      if (fs.existsSync(targetPath)) {
        console.log(`  ⏭️  ${fileName} - již existuje`);
        skipped++;
        continue;
      }

      try {
        console.log(`  📥 Stahuji ${fileName}...`);
        const { buffer } = await downloadImage(imageUrl);

        // Skip tiny/placeholder images
        if (buffer.length < 1024) {
          console.log(`  ⏭️  ${fileName} - obrázek příliš malý (${buffer.length}B)`);
          skipped++;
          continue;
        }

        fs.writeFileSync(targetPath, buffer);
        console.log(`  ✅ Uloženo: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        downloaded++;

        // Small pause between requests
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`  ❌ ${fileName}: ${error.message}`);
        failed++;
      }
    }
  }

  return { downloaded, skipped, failed };
}

/**
 * Hlavní funkce
 */
async function main() {
  console.log('🚀 Stažení obrázků recenzí pro mobile build');

  const result = await downloadReviewImages();

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Celkový souhrn:`);
  console.log(`   ✅ Staženo: ${result.downloaded}`);
  console.log(`   ⏭️  Přeskočeno: ${result.skipped}`);
  console.log(`   ❌ Selhalo: ${result.failed}`);

  // Print review count
  const reviewDirs = fs.existsSync(REVIEWS_DIR)
    ? fs.readdirSync(REVIEWS_DIR).filter(f => !f.startsWith('.'))
    : [];
  console.log(`\n📁 Recenzí s obrázky: ${reviewDirs.length}`);

  // Print total image count
  let totalImages = 0;
  for (const reviewDir of reviewDirs) {
    const reviewPath = path.join(REVIEWS_DIR, reviewDir);
    if (fs.statSync(reviewPath).isDirectory()) {
      const images = fs.readdirSync(reviewPath).filter(f => !f.startsWith('.'));
      totalImages += images.length;
    }
  }
  console.log(`📷 Celkem obrázků: ${totalImages}\n`);
}

main();
