const fs = require('fs');
const path = require('path');

// Přečti CSV soubor
const csvPath = '/Users/martin.nosek/Downloads/Gastromapa NEW - List 1.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Rozdělení na řádky
const lines = csvContent.split('\n');

// Extrakce akcí - sloupce AC, AD, AE, AF (indexy 28, 29, 30, 31 při 0-indexování)
const events = [];

// Přeskočíme první řádek (header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Split by comma, ale musíme být opatrní na čárky uvnitř uvozovek
  const columns = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  columns.push(current); // Přidat poslední sloupec

  // Sloupce AC-AF jsou na indexech 28-31
  const name = columns[28]?.trim();
  const location = columns[29]?.trim();
  const date = columns[30]?.trim();
  const link = columns[31]?.trim();

  // Přidej pouze pokud má alespoň název
  if (name && name !== 'Gastro akce:' && name !== '') {
    events.push({
      name,
      location,
      date,
      link
    });
  }
}

console.log('='.repeat(80));
console.log('EXTRAHOVANÉ AKCE:');
console.log('='.repeat(80));
console.log(JSON.stringify(events, null, 2));
console.log('='.repeat(80));
console.log(`Celkem nalezeno: ${events.length} akcí`);
console.log('='.repeat(80));

// Uložení do JSON souboru
const outputPath = path.join(__dirname, 'events-data.json');
fs.writeFileSync(outputPath, JSON.stringify(events, null, 2));
console.log(`\nData uložena do: ${outputPath}`);
