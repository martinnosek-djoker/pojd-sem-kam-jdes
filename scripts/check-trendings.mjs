import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTrendings() {
  const { data, error } = await supabase
    .from('trendings')
    .select('id, name, address, display_order')
    .order('display_order');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Trendings v databázi ===\n');
  data.forEach(t => {
    const hasAddress = t.address ? '✅' : '❌';
    console.log(`${hasAddress} [${t.display_order}] ${t.name}`);
    if (t.address) console.log(`    → ${t.address}`);
  });
  console.log(`\nCelkem: ${data.length} trendingů`);
  console.log(`S adresami: ${data.filter(t => t.address).length}`);
  console.log(`Bez adres: ${data.filter(t => !t.address).length}`);
}

checkTrendings();
