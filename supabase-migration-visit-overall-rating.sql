-- Adds an overall 1-10 rating for each visit (separate from per-dish ratings
-- and the free-text comment). Used to compute a restaurant's/cafe's long-term
-- rating as an average across its rated visits, shown in the app as a medal.
-- Run this once in the Supabase SQL editor.

ALTER TABLE visits ADD COLUMN IF NOT EXISTS overall_rating SMALLINT;

ALTER TABLE visits ADD CONSTRAINT visits_overall_rating_range
  CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 10));
