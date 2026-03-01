#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables from .env.local
const envFile = join(rootDir, '.env.local');
const envContent = readFileSync(envFile, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('🔄 Regenerating reviews cache...\n');

  // Fetch all reviews with restaurant and cafe data
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      restaurant:restaurants(*),
      cafe:cafes(*)
    `)
    .order('display_order', { ascending: true })
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching reviews:', error.message);
    process.exit(1);
  }

  console.log(`✅ Fetched ${reviews.length} reviews from database`);

  // Find review #11 to verify the update
  const review11 = reviews.find(r => r.id === 11);
  if (review11) {
    console.log('\n📝 Review #11 (Ask4 Masaryčka):');
    console.log(`   Title: ${review11.title}`);
    console.log(`   cafe_id: ${review11.cafe_id}`);
    console.log(`   restaurant_id: ${review11.restaurant_id}`);
    console.log(`   Has cafe data: ${review11.cafe ? 'YES ✅' : 'NO ❌'}`);
    if (review11.cafe) {
      console.log(`   Cafe name: ${review11.cafe.name}`);
    }
  }

  // Write to cache file
  const cacheFile = join(rootDir, '.reviews-cache.json');
  writeFileSync(cacheFile, JSON.stringify(reviews, null, 2), 'utf-8');

  console.log(`\n✅ Successfully wrote ${reviews.length} reviews to .reviews-cache.json`);
  console.log('🎉 Cache regenerated!');
}

main().catch(console.error);
