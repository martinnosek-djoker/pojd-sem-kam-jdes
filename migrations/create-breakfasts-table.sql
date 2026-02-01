-- Create breakfasts table
CREATE TABLE IF NOT EXISTS breakfasts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location TEXT NOT NULL,
  addresses JSONB DEFAULT NULL,
  coordinates JSONB DEFAULT NULL,
  website_url TEXT DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS breakfasts_name_idx ON breakfasts(name);

-- Create index on location for filtering
CREATE INDEX IF NOT EXISTS breakfasts_location_idx ON breakfasts(location);

-- Add RLS policies (Row Level Security)
ALTER TABLE breakfasts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON breakfasts
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON breakfasts
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON breakfasts
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON breakfasts
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_breakfasts_updated_at
  BEFORE UPDATE ON breakfasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
