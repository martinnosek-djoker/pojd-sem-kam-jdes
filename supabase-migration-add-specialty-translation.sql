-- English machine translation of the "co si dát" (cafes) / "specialty"
-- (restaurants) text, filled in automatically on save, so the English site
-- doesn't show Czech there.
--
-- Run this manually in the Supabase SQL editor.

ALTER TABLE cafes ADD COLUMN IF NOT EXISTS specialty_en TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS specialty_en TEXT;
