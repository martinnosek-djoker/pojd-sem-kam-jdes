// Run this script to create the bakeries table in Supabase
// Usage: npx tsx scripts/create-bakeries-table.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const createBakeriesTableSQL = `
-- Create bakeries table (similar to restaurants but simpler)
CREATE TABLE IF NOT EXISTS bakeries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  addresses JSONB,
  coordinates JSONB,
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_bakeries_location ON bakeries(location);
CREATE INDEX IF NOT EXISTS idx_bakeries_name ON bakeries(name);

-- Enable Row Level Security (RLS)
ALTER TABLE bakeries ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Public bakeries are viewable by everyone" ON bakeries;
CREATE POLICY "Public bakeries are viewable by everyone"
  ON bakeries FOR SELECT
  USING (true);

-- Create policy for authenticated operations
DROP POLICY IF EXISTS "Enable insert for all users on bakeries" ON bakeries;
CREATE POLICY "Enable insert for all users on bakeries"
  ON bakeries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on bakeries" ON bakeries;
CREATE POLICY "Enable update for all users on bakeries"
  ON bakeries FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on bakeries" ON bakeries;
CREATE POLICY "Enable delete for all users on bakeries"
  ON bakeries FOR DELETE
  USING (true);

-- Create updated_at trigger for bakeries
CREATE TRIGGER update_bakeries_updated_at
  BEFORE UPDATE ON bakeries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

async function createTable() {
  console.log('Creating bakeries table...');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: createBakeriesTableSQL
  });

  if (error) {
    console.error('Error creating table:', error);
    console.log('\n⚠️  Could not create table automatically.');
    console.log('\n📝 Please run the SQL from create-bakeries-table.sql manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/kkqrumygyxuefrwbpyiy/sql/new');
    process.exit(1);
  }

  console.log('✅ Bakeries table created successfully!');
}

createTable();
