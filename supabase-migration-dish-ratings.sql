-- Change dishes from TEXT[] to JSONB to support ratings
-- First, we need to drop the old column and create a new one
ALTER TABLE reviews DROP COLUMN IF EXISTS dishes;
ALTER TABLE reviews ADD COLUMN dishes JSONB DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN reviews.dishes IS 'Array of dish objects with name and rating: [{"name": "Dish name", "rating": 8}]';
