const fs = require('fs');

const projectRef = 'kkqrumygyxuefrwbpyiy';

// Read the SQL migration files
const reviewsSQL = fs.readFileSync('./supabase-migration-reviews.sql', 'utf8');
const storageSQL = fs.readFileSync('./supabase-storage-setup.sql', 'utf8');
const ratingsSQL = fs.readFileSync('./supabase-migration-review-ratings.sql', 'utf8');
const overallSQL = fs.readFileSync('./supabase-migration-review-overall.sql', 'utf8');

console.log('\n📋 SQL Migration Instructions\n');
console.log('Please run these migrations in Supabase Dashboard:\n');
console.log('1. Go to https://supabase.com/dashboard');
console.log(`2. Select your project: ${projectRef}`);
console.log('3. Click "SQL Editor" in the left sidebar');
console.log('4. Click "New query" button');
console.log('5. Copy and paste the SQL below');
console.log('6. Click "Run" (or press Ctrl/Cmd + Enter)\n');

console.log('═'.repeat(80));
console.log('MIGRATION 1: Reviews Table');
console.log('═'.repeat(80));
console.log(reviewsSQL);
console.log('═'.repeat(80));

console.log('\n');

console.log('═'.repeat(80));
console.log('MIGRATION 2: Storage Bucket for Images');
console.log('═'.repeat(80));
console.log(storageSQL);
console.log('═'.repeat(80));

console.log('\n');

console.log('═'.repeat(80));
console.log('MIGRATION 3: Review Ratings and Dishes');
console.log('═'.repeat(80));
console.log(ratingsSQL);
console.log('═'.repeat(80));

console.log('\n');

console.log('═'.repeat(80));
console.log('MIGRATION 4: Overall Rating and Total Spent');
console.log('═'.repeat(80));
console.log(overallSQL);
console.log('═'.repeat(80));

console.log('\n✅ After running ALL migrations, restart your dev server!\n');
