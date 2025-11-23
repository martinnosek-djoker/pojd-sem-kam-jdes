-- Fix Row Level Security policies for christmas_tips table
-- The admin interface uses anon key, so we need to allow anon role to insert/update/delete

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated insert on christmas_tips" ON public.christmas_tips;
DROP POLICY IF EXISTS "Allow authenticated update on christmas_tips" ON public.christmas_tips;
DROP POLICY IF EXISTS "Allow authenticated delete on christmas_tips" ON public.christmas_tips;

-- Create new policies that allow both authenticated and anon roles
CREATE POLICY "Allow insert on christmas_tips"
  ON public.christmas_tips
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow update on christmas_tips"
  ON public.christmas_tips
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow delete on christmas_tips"
  ON public.christmas_tips
  FOR DELETE
  TO public
  USING (true);
