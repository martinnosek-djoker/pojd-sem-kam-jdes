-- Adds an optional 1-10 rating to cafes (restaurants already have one),
-- shown as a star rating on the cafe card. Existing cafes stay unrated (NULL)
-- until you fill them in via the admin.
--
-- Run this manually in the Supabase SQL editor.

ALTER TABLE cafes
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1)
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10));
