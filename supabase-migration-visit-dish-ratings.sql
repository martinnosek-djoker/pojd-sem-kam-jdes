-- Adds per-dish ratings and a short overall comment to the visits table.
-- "dishes" changes from a plain TEXT[] of names to a JSONB array of
-- {name, rating}. Existing dish names are preserved with rating = null
-- (they weren't rated before, so there's nothing to backfill there).
--
-- Run this manually in the Supabase SQL editor.

ALTER TABLE visits ADD COLUMN IF NOT EXISTS dishes_new JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE visits SET dishes_new = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', d, 'rating', null)), '[]'::jsonb)
  FROM unnest(dishes) AS d
);

ALTER TABLE visits DROP COLUMN dishes;
ALTER TABLE visits RENAME COLUMN dishes_new TO dishes;

ALTER TABLE visits ADD COLUMN IF NOT EXISTS comment TEXT;
