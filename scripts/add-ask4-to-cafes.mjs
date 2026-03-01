#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Use anon key for reads, service key for writes
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🚀 Linking Ask4 Masaryčka cafe to review #11...\n');

  // Step 1: Find existing Ask4 Masaryčka in cafes table
  const { data: existingCafe, error: findError } = await supabase
    .from('cafes')
    .select('*')
    .eq('name', 'Ask4 Masaryčka')
    .single();

  if (findError) {
    console.error('❌ Error finding cafe:', findError.message);
    process.exit(1);
  }

  console.log('✅ Found existing cafe:');
  console.log(`   ID: ${existingCafe.id}`);
  console.log(`   Name: ${existingCafe.name}`);
  console.log(`   Location: ${existingCafe.location}\n`);

  // Step 1.5: Check if review #11 exists
  const { data: existingReview, error: reviewCheckError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', 11)
    .maybeSingle();

  if (reviewCheckError) {
    console.error('❌ Error checking review:', reviewCheckError.message);
    process.exit(1);
  }

  if (!existingReview) {
    console.error('❌ Review #11 does not exist in database');
    process.exit(1);
  }

  console.log('✅ Found existing review #11:');
  console.log(`   Title: ${existingReview.title}`);
  console.log(`   Current cafe_id: ${existingReview.cafe_id}`);
  console.log(`   Current restaurant_id: ${existingReview.restaurant_id}\n`);

  // Step 2: Update review #11 to link to this cafe (using admin client to bypass RLS)
  const { error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({ cafe_id: existingCafe.id })
    .eq('id', 11);

  if (updateError) {
    console.error('❌ Error updating review:', updateError.message);
    process.exit(1);
  }

  // Step 3: Verify the update
  const { data: verifyReview, error: verifyError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', 11)
    .maybeSingle();

  if (verifyError) {
    console.error('❌ Error verifying review:', verifyError.message);
    process.exit(1);
  }

  console.log('✅ Updated review #11:');
  console.log(`   Title: ${verifyReview.title}`);
  console.log(`   cafe_id: ${verifyReview.cafe_id}`);
  console.log(`   restaurant_id: ${verifyReview.restaurant_id}\n`);

  console.log('🎉 Done! Review #11 is now linked to Ask4 Masaryčka cafe!');
}

main().catch(console.error);
