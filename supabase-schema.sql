-- Gastro Tips - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  addresses JSONB,
  cuisine_type TEXT NOT NULL,
  specialty TEXT,
  price INTEGER NOT NULL,
  rating NUMERIC(3,1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(location);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view restaurants)
CREATE POLICY "Public restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  USING (true);

-- Create policy for authenticated insert/update/delete
-- Note: For now, we'll allow all operations since we're using server-side auth
-- In production, you might want to add user authentication
CREATE POLICY "Enable insert for all users"
  ON restaurants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON restaurants FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON restaurants FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trendings table for TOP 10 trending places
CREATE TABLE IF NOT EXISTS trendings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  website_url TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_trendings_display_order ON trendings(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE trendings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public trendings are viewable by everyone"
  ON trendings FOR SELECT
  USING (true);

-- Create policy for authenticated operations
CREATE POLICY "Enable insert for all users"
  ON trendings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON trendings FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON trendings FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_trendings_updated_at
  BEFORE UPDATE ON trendings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration: Add image_url column to existing tables (run this if upgrading)
-- This is safe to run multiple times - it will only add the column if it doesn't exist
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE trendings ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Migration: Change address to addresses (JSONB) - this replaces the old address column
-- First, add the new column
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS addresses JSONB;

-- If you have existing data in 'address' column, you can migrate it:
-- UPDATE restaurants SET addresses = jsonb_build_object('default', address) WHERE address IS NOT NULL AND addresses IS NULL;

-- Then optionally drop the old column (run this manually after verifying data migration):
-- ALTER TABLE restaurants DROP COLUMN IF EXISTS address;

-- Migration: Add address column to trendings table
ALTER TABLE trendings ADD COLUMN IF NOT EXISTS address TEXT;
