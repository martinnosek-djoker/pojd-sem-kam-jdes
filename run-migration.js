const fs = require('fs');

const projectRef = 'kkqrumygyxuefrwbpyiy';

// Read the SQL migration file
const migrationSQL = fs.readFileSync('./supabase-migration-enable-michelin-rls.sql', 'utf8');

console.log('\n📋 SQL Migration Instructions\n');
console.log('Please run this migration in Supabase Dashboard:\n');
console.log('1. Go to https://supabase.com/dashboard');
console.log(`2. Select your project: ${projectRef}`);
console.log('3. Click "SQL Editor" in the left sidebar');
console.log('4. Click "New query" button');
console.log('5. Copy and paste the SQL below');
console.log('6. Click "Run" (or press Ctrl/Cmd + Enter)\n');
console.log('─'.repeat(80));
console.log('SQL Migration:');
console.log('─'.repeat(80));
console.log(migrationSQL);
console.log('─'.repeat(80));
console.log('\n✅ After running the migration, restart your dev server!\n');
