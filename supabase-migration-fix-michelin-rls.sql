-- Fix RLS policies for michelin_restaurants table

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to michelin_restaurants" ON michelin_restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to modify michelin_restaurants" ON michelin_restaurants;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to michelin_restaurants"
  ON michelin_restaurants
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert michelin_restaurants"
  ON michelin_restaurants
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update michelin_restaurants"
  ON michelin_restaurants
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete michelin_restaurants"
  ON michelin_restaurants
  FOR DELETE
  USING (auth.role() = 'authenticated');
