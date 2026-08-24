#!/usr/bin/env node

/**
 * Script pro aktualizaci image_url v databázi na základě existujících lokálních souborů
 * (rychlejší alternativa k migrate-images.mjs - nestahuje znovu, jen aktualizuje DB)
 *
 * Použití:
 * node scripts/update-image-urls.mjs [table-name]
 *
 * Příklady:
 * node scripts/update-image-urls.mjs restaurants  # Aktualizuje pouze restaurace
 * node scripts/update-image-urls.mjs all         # Aktualizuje vše
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase konfigurace
const SUPABASE_URL = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

/**
 * Normalizuje název souboru (musí být identická s normalizeFileName v api-config.ts)
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
 * Najde lokální soubor pro danou položku
 * Hledá různé varianty: {name}.webp, {name}-{id}.webp, {name}.jpg, atd.
 */
function findLocalImage(name, id, targetDir) {
  const normalizedName = normalizeFileName(name);
  const possibleExtensions = ['.webp', '.jpg', '.jpeg', '.png'];
  const possibleFormats = [
    normalizedName,                    // campo-de-fiori.webp
    `${normalizedName}-${id}`,        // campo-de-fiori-1.webp
  ];

  for (const format of possibleFormats) {
    for (const ext of possibleExtensions) {
      const fileName = `${format}${ext}`;
      const filePath = path.join(targetDir, fileName);
      if (fs.existsSync(filePath)) {
        return fileName;
      }
    }
  }

  return null;
}

/**
 * Aktualizuje URL pro danou tabulku
 */
async function updateTable(tableName, targetDir, typePrefix) {
  console.log(`\n📊 Aktualizace tabulky: ${tableName}`);
  console.log('─'.repeat(60));

  try {
    const records = await fetchFromSupabase(tableName);
    console.log(`📋 Nalezeno záznamů: ${records.length}`);

    let updated = 0;
    let alreadyLocal = 0;
    let notFound = 0;
    let noImage = 0;

    for (const record of records) {
      if (!record.image_url) {
        noImage++;
        continue;
      }

      // Přeskoč již migrované (lokální cesty)
      if (record.image_url.startsWith('/images/')) {
        alreadyLocal++;
        continue;
      }

      // Hledej lokální soubor
      const localFileName = findLocalImage(record.name, record.id, targetDir);

      if (localFileName) {
        try {
          const newImageUrl = `/images/${typePrefix}/${localFileName}`;
          await updateImageUrl(tableName, record.id, newImageUrl);
          console.log(`✅ ${record.name}: ${record.image_url.substring(0, 40)}... → ${newImageUrl}`);
          updated++;

          // Malá pauza mezi requesty
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ ${record.name}: Chyba při aktualizaci DB - ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${record.name}: Lokální soubor nenalezen (Google URL zůstává)`);
        notFound++;
      }
    }

    console.log('─'.repeat(60));
    console.log(`✅ Aktualizováno: ${updated}`);
    console.log(`📍 Již lokální cesty: ${alreadyLocal}`);
    console.log(`⚠️  Lokální soubor nenalezen: ${notFound}`);
    console.log(`⏭️  Bez obrázku: ${noImage}`);

  } catch (error) {
    console.error(`❌ Chyba při aktualizaci tabulky ${tableName}:`, error.message);
  }
}

/**
 * Hlavní funkce
 */
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';

  console.log('\n🚀 Aktualizace image_url v databázi');
  console.log('═'.repeat(60));

  const tables = [
    { name: 'restaurants', dir: path.join(IMAGES_DIR, 'restaurants'), prefix: 'restaurants' },
    { name: 'cafes', dir: path.join(IMAGES_DIR, 'cafes'), prefix: 'cafes' },
    { name: 'bakeries', dir: path.join(IMAGES_DIR, 'bakeries'), prefix: 'bakeries' },
    { name: 'trendings', dir: path.join(IMAGES_DIR, 'trendings'), prefix: 'trendings' }
  ];

  if (target === 'all') {
    for (const table of tables) {
      await updateTable(table.name, table.dir, table.prefix);
    }
  } else {
    const table = tables.find(t => t.name === target);
    if (!table) {
      console.error(`❌ Neznámá tabulka: ${target}`);
      console.log('\nDostupné tabulky:', tables.map(t => t.name).join(', '));
      process.exit(1);
    }
    await updateTable(table.name, table.dir, table.prefix);
  }

  console.log('\n═'.repeat(60));
  console.log('🎉 Aktualizace dokončena!');
  console.log('\n💡 Tip: Pokud některé obrázky nebyly nalezeny, můžeš je stáhnout pomocí:');
  console.log('   node scripts/download-all-images.mjs');
}

main().catch(error => {
  console.error('❌ Kritická chyba:', error);
  process.exit(1);
});
