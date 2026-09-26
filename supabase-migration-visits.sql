-- Creates the "visits" table for the lightweight "Nejnovější recenze" homepage carousel.
-- A visit just records that you went to a restaurant/cafe on a date and what you ate there.
-- Everything else (name, location, price, rating, photo) is joined in from the
-- restaurants/cafes tables at read time - nothing is duplicated here.
--
-- Run this manually in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  cafe_id BIGINT REFERENCES cafes(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  dishes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT visits_exactly_one_place CHECK (
    (restaurant_id IS NOT NULL AND cafe_id IS NULL) OR
    (restaurant_id IS NULL AND cafe_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS visits_visit_date_idx ON visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS visits_restaurant_id_idx ON visits(restaurant_id);
CREATE INDEX IF NOT EXISTS visits_cafe_id_idx ON visits(cafe_id);

-- Enable Row Level Security
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Same effective access pattern as restaurants/cafes in this app: admin writes go
-- through the anon key (auth is app-level, via the /admin login cookie), so writes
-- need to be public here too, not gated to a Supabase "authenticated" role.
DROP POLICY IF EXISTS "Allow public read access on visits" ON visits;
DROP POLICY IF EXISTS "Allow public insert on visits" ON visits;
DROP POLICY IF EXISTS "Allow public update on visits" ON visits;
DROP POLICY IF EXISTS "Allow public delete on visits" ON visits;

CREATE POLICY "Allow public read access on visits"
  ON visits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on visits"
  ON visits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on visits"
  ON visits FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on visits"
  ON visits FOR DELETE
  TO public
  USING (true);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS visits_updated_at ON visits;
DROP FUNCTION IF EXISTS update_visits_updated_at();

CREATE OR REPLACE FUNCTION update_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_visits_updated_at();
