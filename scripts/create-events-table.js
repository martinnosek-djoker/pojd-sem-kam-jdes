const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase konfigurace
const supabaseUrl = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📋 Načítání dat z JSON souboru...');

  // Načti data
  const eventsPath = path.join(__dirname, 'events-data.json');
  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

  console.log(`✅ Nalezeno ${eventsData.length} akcí\n`);

  // SQL pro vytvoření tabulky (spustíme ručně v Supabase SQL Editor)
  console.log('📝 SQL pro vytvoření tabulky (spusť v Supabase SQL Editor):');
  console.log('='.repeat(80));
  console.log(`
-- Vytvoření tabulky events
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    date TEXT,
    link TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy pro čtení (veřejně přístupné)
CREATE POLICY "Events jsou veřejně čitelné" ON public.events
    FOR SELECT USING (true);

-- Policy pro insert/update/delete (pouze pro autentifikované uživatele - adminy)
CREATE POLICY "Pouze autentifikovaní uživatelé mohou upravovat events" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');
`);
  console.log('='.repeat(80));
  console.log('\n⚠️  DŮLEŽITÉ: Nejdřív spusť výše uvedený SQL v Supabase, pak pokračuj.');
  console.log('Stiskni Enter pro pokračování importu dat...');

  // Počkej na Enter
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n📤 Začínám import dat do Supabase...\n');

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
    process.exit(1);
  }

  console.log(`✅ Úspěšně importováno ${data.length} akcí!`);
  console.log('\n📊 Importované akce:');
  data.forEach((event, i) => {
    console.log(`  ${i + 1}. ${event.name} - ${event.location} (${event.date})`);
  });

  process.exit(0);
}

main();
