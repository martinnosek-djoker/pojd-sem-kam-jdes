#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Get review 9 (Óda)
  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', 9)
    .single();

  console.log('Current images:', JSON.stringify(review.images, null, 2));

  // Fix the first image path
  const newImages = [...review.images];
  newImages[0] = '/images/restaurants/oda.webp';

  const { error } = await supabase
    .from('reviews')
    .update({ images: newImages })
    .eq('id', 9);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✓ Fixed! New path:', newImages[0]);
  }
}

main().catch(console.error);
