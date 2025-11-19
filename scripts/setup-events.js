const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase konfigurace
const supabaseUrl = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n📝 KROK 1: Vytvoření tabulky events');
  console.log('='.repeat(80));
  console.log('\nProsím, otevři Supabase Dashboard:');
  console.log('👉 https://supabase.com/dashboard/project/kkqrumygyxuefrwbpyiy/editor');
  console.log('\nPak jdi na SQL Editor a spusť následující SQL:\n');

  const sqlPath = path.join(__dirname, 'create-events.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(sql);

  console.log('\n' + '='.repeat(80));
  console.log('\n⏸️  Po spuštění SQL stiskni ENTER pro pokračování...');

  // Počkej na Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n📤 KROK 2: Import dat do tabulky events');
  console.log('='.repeat(80));

  // Načti data
  const eventsPath = path.join(__dirname, 'events-data.json');
  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

  console.log(`\n✅ Nalezeno ${eventsData.length} akcí k importu\n`);

  // Importuj data
  const eventsToInsert = eventsData.map((event, index) => ({
    name: event.name,
    location: event.location || null,
    date: event.date || null,
    link: event.link || null,
    display_order: index + 1
  }));

  const { data, error } = await supabase
    .from('events')
    .insert(eventsToInsert)
    .select();

  if (error) {
    console.error('❌ Chyba při importu:', error.message);
    console.error('Detail:', error);
    process.exit(1);
  }

  console.log(`\n✅ Úspěšně importováno ${data.length} akcí!`);
  console.log('\n📊 Importované akce:');
  console.log('='.repeat(80));
  data.forEach((event, i) => {
    console.log(`  ${i + 1}. ${event.name}`);
    console.log(`     📍 ${event.location || 'bez místa'}`);
    console.log(`     📅 ${event.date || 'bez data'}`);
    console.log(`     🔗 ${event.link || 'bez odkazu'}`);
    console.log('');
  });
  console.log('='.repeat(80));

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatální chyba:', err);
  process.exit(1);
});
