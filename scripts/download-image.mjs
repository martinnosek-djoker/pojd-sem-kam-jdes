#!/usr/bin/env node

/**
 * Script pro stahování obrázků z URL a ukládání do public/images
 *
 * Použití:
 * node scripts/download-image.mjs <URL> [název-souboru]
 *
 * Příklad:
 * node scripts/download-image.mjs https://example.com/photo.jpg moje-restaurace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vytvoření složek pro různé typy obrázků
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const RESTAURANTS_DIR = path.join(IMAGES_DIR, 'restaurants');
const CAFES_DIR = path.join(IMAGES_DIR, 'cafes');
const BAKERIES_DIR = path.join(IMAGES_DIR, 'bakeries');
const TRENDINGS_DIR = path.join(IMAGES_DIR, 'trendings');

// Vytvoření všech potřebných složek
[IMAGES_DIR, RESTAURANTS_DIR, CAFES_DIR, BAKERIES_DIR, TRENDINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Normalizuje název souboru - odstraní diakritiku, nahradí mezery
 */
function normalizeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // odstranění diakritiky
    .replace(/[^a-z0-9]/g, '-') // nahrazení non-alphanumeric za pomlčku
    .replace(/-+/g, '-') // více pomlček za sebou -> jedna
    .replace(/^-|-$/g, ''); // odstranění pomlček na začátku/konci
}

/**
 * Získá příponu souboru z URL nebo Content-Type
 */
function getFileExtension(url, contentType) {
  // Nejdřív zkusíme z URL
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  if (urlExt && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt)) {
    return urlExt;
  }

  // Pak z Content-Type
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

  return '.jpg'; // fallback
}

/**
 * Stáhne obrázek z URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect - následuj
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
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
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Chybí URL obrázku');
    console.log('\nPoužití:');
    console.log('  node scripts/download-image.mjs <URL> [název-souboru] [typ]');
    console.log('\nPříklad:');
    console.log('  node scripts/download-image.mjs https://example.com/photo.jpg moje-restaurace restaurants');
    console.log('\nTypy: restaurants, cafes, bakeries, trendings (výchozí: restaurants)');
    process.exit(1);
  }

  const imageUrl = args[0];
  let customName = args[1];
  const type = args[2] || 'restaurants';

  // Výběr cílové složky podle typu
  const typeToDir = {
    'restaurants': RESTAURANTS_DIR,
    'cafes': CAFES_DIR,
    'bakeries': BAKERIES_DIR,
    'trendings': TRENDINGS_DIR
  };

  const targetDir = typeToDir[type] || RESTAURANTS_DIR;

  try {
    console.log(`📥 Stahuji obrázek z: ${imageUrl}`);

    const { buffer, contentType } = await downloadImage(imageUrl);
    const extension = getFileExtension(imageUrl, contentType);

    // Pokud není zadán vlastní název, použij timestamp
    if (!customName) {
      customName = `image-${Date.now()}`;
    } else {
      customName = normalizeFileName(customName);
    }

    const fileName = `${customName}${extension}`;
    const filePath = path.join(targetDir, fileName);

    // Zkontroluj jestli soubor již existuje
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  Soubor ${fileName} již existuje`);
      const timestamp = Date.now();
      const newFileName = `${customName}-${timestamp}${extension}`;
      const newFilePath = path.join(targetDir, newFileName);
      fs.writeFileSync(newFilePath, buffer);
      console.log(`✅ Obrázek uložen jako: ${newFileName}`);
      console.log(`📁 Cesta: /images/${type}/${newFileName}`);
      return;
    }

    // Ulož soubor
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Obrázek úspěšně stažen a uložen!`);
    console.log(`📁 Název souboru: ${fileName}`);
    console.log(`📍 Lokální cesta: /images/${type}/${fileName}`);
    console.log(`\n💡 Použij tuto cestu v databázi místo URL:`);
    console.log(`   /images/${type}/${fileName}`);

  } catch (error) {
    console.error('❌ Chyba při stahování obrázku:', error.message);
    process.exit(1);
  }
}

main();
