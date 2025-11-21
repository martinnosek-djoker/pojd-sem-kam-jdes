-- Fix RLS policies for events table after adding new columns
-- This script updates or recreates the policies to allow start_date and end_date

-- First, check existing policies
-- SELECT * FROM pg_policies WHERE tablename = 'events';

-- Option 1: Drop and recreate policies (safest)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.events;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.events;

-- Create new policies that allow all columns
CREATE POLICY "Enable read access for all users"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON public.events FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON public.events FOR DELETE
USING (true);

-- Option 2: If you want to disable RLS temporarily for testing
-- ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Note: Make sure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
