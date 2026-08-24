#!/usr/bin/env node

/**
 * Script pro stažení všech obrázků ze všech kategorií z API
 * Stáhne obrázky z Google Places API a uloží je lokálně jako .webp
 *
 * Použití:
 *   node scripts/download-all-images.mjs           -- stáhne všechny kategorie
 *   node scripts/download-all-images.mjs cafes     -- stáhne jen kavárny
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Kategorie: API endpoint, cílová složka, pole pro název
const CATEGORIES = {
  restaurants: { endpoint: '/api/restaurants', nameField: 'name' },
  cafes:       { endpoint: '/api/cafes',       nameField: 'name' },
  bakeries:    { endpoint: '/api/bakeries',    nameField: 'name' },
  trendings:   { endpoint: '/api/trendings',   nameField: 'name' },
};

const BASE_URL = 'https://pojdsemkamjdes.cz';

// Vytvoř složky pokud neexistují
for (const category of Object.keys(CATEGORIES)) {
  const dir = path.join(IMAGES_DIR, category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Normalizuje název soubolu (musí být identická s normalizeFileName v api-config.ts)
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
 * Stáhne obrázky jedné kategorie
 */
async function downloadCategory(category) {
  const config = CATEGORIES[category];
  const targetDir = path.join(IMAGES_DIR, category);

  console.log(`\n📂 Kategorie: ${category}`);
  console.log(`📥 Načítám seznam z ${BASE_URL}${config.endpoint}...`);

  let items;
  try {
    const response = await fetch(`${BASE_URL}${config.endpoint}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    items = await response.json();
  } catch (error) {
    console.error(`❌ Chyba při fetchu ${category}: ${error.message}`);
    return { downloaded: 0, skipped: 0, failed: 0 };
  }

  // API may return array directly or wrapped in object
  if (!Array.isArray(items)) {
    // Try common wrapper patterns
    items = items.data || items.results || items[category] || [];
  }

  console.log(`✓ Načteno ${items.length} položek`);

  const itemsWithImages = items.filter(item => item.image_url && item.image_url.startsWith('http'));
  console.log(`📸 S obrázky: ${itemsWithImages.length}`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of itemsWithImages) {
    const name = item[config.nameField];
    if (!name) continue;

    const fileName = normalizeFileName(name);
    // Always save as .webp (browsers detect format by content, not extension)
    const targetPath = path.join(targetDir, `${fileName}.webp`);

    if (fs.existsSync(targetPath)) {
      console.log(`⏭️  ${name} - již existuje`);
      skipped++;
      continue;
    }

    try {
      console.log(`📥 Stahuji: ${name}...`);
      const { buffer } = await downloadImage(item.image_url);

      // Skip tiny/placeholder images (< 1KB likely a transparent pixel)
      if (buffer.length < 1024) {
        console.log(`⏭️  ${name} - obrázek příliš malý (${buffer.length}B), přeskočen`);
        skipped++;
        continue;
      }

      fs.writeFileSync(targetPath, buffer);
      console.log(`✅ Uloženo: ${fileName}.webp (${(buffer.length / 1024).toFixed(1)} KB)`);
      downloaded++;

      // Small pause between requests
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  return { downloaded, skipped, failed };
}

/**
 * Hlavní funkce
 */
async function main() {
  const requestedCategory = process.argv[2];

  // Validate category if specified
  if (requestedCategory && !CATEGORIES[requestedCategory]) {
    console.error(`❌ Neznámá kategorie: ${requestedCategory}`);
    console.log(`Dostupné kategorie: ${Object.keys(CATEGORIES).join(', ')}`);
    process.exit(1);
  }

  const categoriesToProcess = requestedCategory
    ? [requestedCategory]
    : Object.keys(CATEGORIES);

  console.log('🚀 Stažení obrázků pro mobile build');
  console.log(`Kategorie: ${categoriesToProcess.join(', ')}`);

  const totals = { downloaded: 0, skipped: 0, failed: 0 };

  for (const category of categoriesToProcess) {
    const result = await downloadCategory(category);
    totals.downloaded += result.downloaded;
    totals.skipped += result.skipped;
    totals.failed += result.failed;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Celkový souhrn:`);
  console.log(`   ✅ Staženo: ${totals.downloaded}`);
  console.log(`   ⏭️  Přeskočeno: ${totals.skipped}`);
  console.log(`   ❌ Selhalo: ${totals.failed}`);

  // Print file counts per category
  console.log('\n📁 Soubory na disku:');
  for (const category of Object.keys(CATEGORIES)) {
    const dir = path.join(IMAGES_DIR, category);
    const count = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => !f.startsWith('.')).length : 0;
    console.log(`   ${category}: ${count}`);
  }
}

main();
