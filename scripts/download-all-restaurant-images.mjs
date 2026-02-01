#!/usr/bin/env node

/**
 * Script pro stažení všech obrázků restaurací z API
 * Stáhne obrázky z Google Places API a uloží je lokálně
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESTAURANTS_DIR = path.join(__dirname, '..', 'public', 'images', 'restaurants');

// Vytvoř složku pokud neexistuje
if (!fs.existsSync(RESTAURANTS_DIR)) {
  fs.mkdirSync(RESTAURANTS_DIR, { recursive: true });
}

/**
 * Normalizuje název souboru
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
 * Získá příponu souboru
 */
function getFileExtension(url, contentType) {
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  if (urlExt && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt)) {
    return urlExt;
  }

  if (contentType) {
    const mimeTypes = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    };
    return mimeTypes[contentType] || '.jpg';
  }

  return '.jpg';
}

/**
 * Stáhne obrázek z URL
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
 * Hlavní funkce
 */
async function main() {
  try {
    console.log('📥 Načítám seznam restaurací...');

    const response = await fetch('https://pojdsemkamjdes.cz/api/restaurants', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const restaurants = await response.json();
    console.log(`✓ Načteno ${restaurants.length} restaurací\n`);

    const restaurantsWithImages = restaurants.filter(r => r.image_url && r.image_url.startsWith('http'));
    console.log(`📸 Restaurací s obrázky: ${restaurantsWithImages.length}\n`);

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const restaurant of restaurantsWithImages) {
      const fileName = normalizeFileName(restaurant.name);
      const existingFiles = fs.readdirSync(RESTAURANTS_DIR).filter(f => f.startsWith(fileName));

      if (existingFiles.length > 0) {
        console.log(`⏭️  ${restaurant.name} - již existuje`);
        skipped++;
        continue;
      }

      try {
        console.log(`📥 Stahuji: ${restaurant.name}...`);
        const { buffer, contentType } = await downloadImage(restaurant.image_url);
        const extension = getFileExtension(restaurant.image_url, contentType);
        const filePath = path.join(RESTAURANTS_DIR, `${fileName}${extension}`);

        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Uloženo jako: ${fileName}${extension}`);
        downloaded++;

        // Malá pauza mezi požadavky
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ ${restaurant.name}: ${error.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Souhrn:`);
    console.log(`   ✅ Staženo: ${downloaded}`);
    console.log(`   ⏭️  Přeskočeno (již existuje): ${skipped}`);
    console.log(`   ❌ Selhalo: ${failed}`);
    console.log(`   📁 Celkem souborů: ${fs.readdirSync(RESTAURANTS_DIR).filter(f => f !== '.gitkeep').length}`);

  } catch (error) {
    console.error('❌ Chyba:', error.message);
    process.exit(1);
  }
}

main();
