-- Safe SQL script to create cafes table (checks for existence first)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on cafes" ON cafes;
DROP POLICY IF EXISTS "Allow authenticated insert on cafes" ON cafes;
DROP POLICY IF EXISTS "Allow authenticated update on cafes" ON cafes;
DROP POLICY IF EXISTS "Allow authenticated delete on cafes" ON cafes;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS cafes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  addresses JSONB,
  coordinates JSONB,
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS cafes_name_key ON cafes(name);

-- Create index on location for faster queries
CREATE INDEX IF NOT EXISTS cafes_location_idx ON cafes(location);

-- Enable Row Level Security
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;

-- Create policies (fresh)
CREATE POLICY "Allow public read access on cafes"
  ON cafes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated insert on cafes"
  ON cafes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on cafes"
  ON cafes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete on cafes"
  ON cafes FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS cafes_updated_at ON cafes;
DROP FUNCTION IF EXISTS update_cafes_updated_at();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cafes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER cafes_updated_at
  BEFORE UPDATE ON cafes
  FOR EACH ROW
  EXECUTE FUNCTION update_cafes_updated_at();
