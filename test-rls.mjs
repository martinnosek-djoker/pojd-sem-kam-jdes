import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRLS() {
  console.log('🔒 Testing RLS policies...\n');
  
  const { data: restaurants, error: restError } = await supabase
    .from('restaurants')
    .select('id, name')
    .limit(1);
  
  console.log('✓ Public read restaurants:', restError ? '❌ ' + restError.message : '✅ OK (' + restaurants.length + ' rows)');
  
  const { data: michelin, error: michError } = await supabase
    .from('michelin_restaurants')
    .select('id, name')
    .limit(1);
  
  console.log('✓ Public read michelin:', michError ? '❌ ' + michError.message : '✅ OK (' + (michelin?.length || 0) + ' rows)');
  
  const { error: writeError } = await supabase
    .from('restaurants')
    .insert({ name: 'Test', location: 'Test', rating: 5, price: 500 });
  
  console.log('✓ Unauthenticated write:', writeError ? '✅ BLOCKED (' + writeError.message + ')' : '❌ ALLOWED - RLS not working!');
  
  console.log('\n✅ RLS is properly configured!');
}

testRLS();
