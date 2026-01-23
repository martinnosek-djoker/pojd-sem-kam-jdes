-- Add rating fields and dishes to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS rating_interior INTEGER CHECK (rating_interior >= 1 AND rating_interior <= 10),
ADD COLUMN IF NOT EXISTS rating_service INTEGER CHECK (rating_service >= 1 AND rating_service <= 10),
ADD COLUMN IF NOT EXISTS rating_food INTEGER CHECK (rating_food >= 1 AND rating_food <= 10),
ADD COLUMN IF NOT EXISTS dishes TEXT[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN reviews.rating_interior IS 'Rating for interior design (1-10 stars)';
COMMENT ON COLUMN reviews.rating_service IS 'Rating for service quality (1-10 stars)';
COMMENT ON COLUMN reviews.rating_food IS 'Rating for food quality (1-10 stars)';
COMMENT ON COLUMN reviews.dishes IS 'Array of dishes/meals had during the visit';
