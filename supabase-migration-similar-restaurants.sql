-- Add similar_restaurant_ids column to reviews table for manual selection
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS similar_restaurant_ids INTEGER[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN reviews.similar_restaurant_ids IS 'Array of restaurant IDs to display as similar/recommended restaurants';
