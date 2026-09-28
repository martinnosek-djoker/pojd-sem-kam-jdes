-- Add image_url column to events table so gastro events can show a photo/logo.
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
