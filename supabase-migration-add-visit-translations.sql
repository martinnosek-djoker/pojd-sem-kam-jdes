-- English translations of visit review content, for the /en site.
ALTER TABLE visits ADD COLUMN IF NOT EXISTS comment_en TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS dishes_en JSONB;
