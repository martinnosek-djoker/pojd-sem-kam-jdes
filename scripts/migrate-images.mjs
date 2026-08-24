#!/usr/bin/env node

/**
 * Script pro migraci všech obrázků z externích URL na lokální úložiště
 *
 * Použití:
 * node scripts/migrate-images.mjs [table-name]
 *
 * Příklady:
 * node scripts/migrate-images.mjs restaurants  # Migruje pouze restaurace
 * node scripts/migrate-images.mjs all         # Migruje vše
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase konfigurace
const SUPABASE_URL = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

// Vytvoření složek
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const RESTAURANTS_DIR = path.join(IMAGES_DIR, 'restaurants');
const CAFES_DIR = path.join(IMAGES_DIR, 'cafes');
const BAKERIES_DIR = path.join(IMAGES_DIR, 'bakeries');
const TRENDINGS_DIR = path.join(IMAGES_DIR, 'trendings');

[IMAGES_DIR, RESTAURANTS_DIR, CAFES_DIR, BAKERIES_DIR, TRENDINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
 * Fetch data from Supabase
 */
async function fetchFromSupabase(table) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${table}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update image URL in Supabase
 */
async function updateImageUrl(table, id, newImageUrl) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ image_url: newImageUrl })
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${response.statusText}`);
  }
}

/**
 * Migruje obrázky pro danou tabulku
 */
async function migrateTable(tableName, targetDir, typePrefix) {
  console.log(`\n📊 Migrace tabulky: ${tableName}`);
  console.log('─'.repeat(60));

  try {
    const records = await fetchFromSupabase(tableName);
    console.log(`📋 Nalezeno záznamů: ${records.length}`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const record of records) {
      if (!record.image_url) {
        skipped++;
        continue;
      }

      // Přeskoč již migrované (lokální cesty)
      if (record.image_url.startsWith('/images/')) {
        console.log(`⏭️  ${record.name}: Již migrováno`);
        skipped++;
        continue;
      }

      try {
        console.log(`📥 ${record.name}: Stahuji...`);

        const { buffer, contentType } = await downloadImage(record.image_url);
        const extension = getFileExtension(record.image_url, contentType);
        const normalizedName = normalizeFileName(record.name);
        const fileName = `${normalizedName}-${record.id}${extension}`;
        const filePath = path.join(targetDir, fileName);

        // Ulož soubor
        fs.writeFileSync(filePath, buffer);

        // Aktualizuj databázi
        const newImageUrl = `/images/${typePrefix}/${fileName}`;
        await updateImageUrl(tableName, record.id, newImageUrl);

        console.log(`✅ ${record.name}: OK -> ${newImageUrl}`);
        migrated++;

        // Malá pauza mezi requesty
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${record.name}: ${error.message}`);
        failed++;
      }
    }

    console.log('─'.repeat(60));
    console.log(`✅ Úspěšně migrováno: ${migrated}`);
    console.log(`⏭️  Přeskočeno: ${skipped}`);
    console.log(`❌ Selhalo: ${failed}`);

  } catch (error) {
    console.error(`❌ Chyba při migraci tabulky ${tableName}:`, error.message);
  }
}

/**
 * Hlavní funkce
 */
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';

  console.log('\n🚀 Migrace obrázků z externích URL na lokální storage');
  console.log('═'.repeat(60));

  const tables = [
    { name: 'restaurants', dir: RESTAURANTS_DIR, prefix: 'restaurants' },
    { name: 'cafes', dir: CAFES_DIR, prefix: 'cafes' },
    { name: 'bakeries', dir: BAKERIES_DIR, prefix: 'bakeries' },
    { name: 'trendings', dir: TRENDINGS_DIR, prefix: 'trendings' }
  ];

  if (target === 'all') {
    for (const table of tables) {
      await migrateTable(table.name, table.dir, table.prefix);
    }
  } else {
    const table = tables.find(t => t.name === target);
    if (!table) {
      console.error(`❌ Neznámá tabulka: ${target}`);
      console.log('\nDostupné tabulky:', tables.map(t => t.name).join(', '));
      process.exit(1);
    }
    await migrateTable(table.name, table.dir, table.prefix);
  }

  console.log('\n═'.repeat(60));
  console.log('🎉 Migrace dokončena!');
  console.log('\n💡 Nezapomeň commitnout nové obrázky do git repozitáře');
}

main().catch(error => {
  console.error('❌ Kritická chyba:', error);
  process.exit(1);
});
