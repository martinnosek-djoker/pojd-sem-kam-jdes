-- Add place_ids column to cafes table for caching Google Places API place IDs
-- This reduces API costs by avoiding repeated Find Place API calls
ALTER TABLE cafes
ADD COLUMN IF NOT EXISTS place_ids jsonb DEFAULT NULL;

-- Add place_ids column to bakeries table
ALTER TABLE bakeries
ADD COLUMN IF NOT EXISTS place_ids jsonb DEFAULT NULL;

-- Add comments explaining the purpose
COMMENT ON COLUMN cafes.place_ids IS 'Cache for Google Places API place IDs. Format: {"Anděl": "ChIJ...", "Letná": "ChIJ..."}';
COMMENT ON COLUMN bakeries.place_ids IS 'Cache for Google Places API place IDs. Format: {"Náměstí Republiky": "ChIJ...", "Florenc": "ChIJ..."}';
