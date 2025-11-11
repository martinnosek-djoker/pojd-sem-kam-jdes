-- Create bakeries table (similar to restaurants but simpler)
-- Run this in Supabase SQL Editor or via psql

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
CREATE POLICY "Public bakeries are viewable by everyone"
  ON bakeries FOR SELECT
  USING (true);

-- Create policy for authenticated operations
CREATE POLICY "Enable insert for all users on bakeries"
  ON bakeries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users on bakeries"
  ON bakeries FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users on bakeries"
  ON bakeries FOR DELETE
  USING (true);

-- Create updated_at trigger for bakeries
CREATE TRIGGER update_bakeries_updated_at
  BEFORE UPDATE ON bakeries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
