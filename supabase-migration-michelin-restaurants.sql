-- Create michelin_restaurants table
CREATE TABLE IF NOT EXISTS michelin_restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  award_type TEXT NOT NULL CHECK (award_type IN ('2-stars', '1-star', 'bib-gourmand')),
  location TEXT NOT NULL,
  addresses JSONB,
  coordinates JSONB,
  cuisine_type TEXT,
  description TEXT,
  website_url TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on award_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_michelin_restaurants_award_type ON michelin_restaurants(award_type);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_michelin_restaurants_display_order ON michelin_restaurants(display_order);

-- Enable Row Level Security
ALTER TABLE michelin_restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to michelin_restaurants"
  ON michelin_restaurants
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to modify michelin_restaurants"
  ON michelin_restaurants
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_michelin_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER michelin_restaurants_updated_at
  BEFORE UPDATE ON michelin_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_michelin_restaurants_updated_at();
