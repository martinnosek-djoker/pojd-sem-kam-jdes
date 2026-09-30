-- Adds a "co si dát" (what to order) field to cafes - a specific menu item
-- recommendation shown on the public card, e.g. "turecká vejce", "malinový danish".
--
-- Run this manually in the Supabase SQL editor.

ALTER TABLE cafes ADD COLUMN IF NOT EXISTS specialty TEXT;
