-- Add overall rating and total spent to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
ADD COLUMN IF NOT EXISTS total_spent INTEGER;

-- Add comments for clarity
COMMENT ON COLUMN reviews.overall_rating IS 'Overall rating of the restaurant visit (1-10 stars)';
COMMENT ON COLUMN reviews.total_spent IS 'Total amount spent in CZK';
