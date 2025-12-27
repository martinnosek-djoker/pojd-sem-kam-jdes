import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADDRESSES = {
  'SOMA': 'Budečská 28, 120 00 Praha, Czech Republic',
  // Add mèmè & brunch address when found
};

async function migrateAddresses() {
  console.log('🚀 Starting address migration...\n');

  for (const [name, address] of Object.entries(ADDRESSES)) {
    console.log(`Updating ${name}...`);

    const { data, error } = await supabase
      .from('trendings')
      .update({ address })
      .eq('name', name)
      .select();

    if (error) {
      console.error(`  ❌ Error updating ${name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`  ✅ Updated ${name}`);
      console.log(`     → ${address}`);
    } else {
      console.log(`  ⚠️  ${name} not found in database`);
    }
  }

  console.log('\n✨ Migration complete!');
}

migrateAddresses();
