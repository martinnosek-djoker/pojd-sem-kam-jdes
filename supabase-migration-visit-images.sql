-- Adds a photo gallery to visits - actual uploaded photos (e.g. from a phone's
-- gallery), stored as public Supabase Storage URLs, not pasted external links.
--
-- Run this manually in the Supabase SQL editor.

ALTER TABLE visits ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
