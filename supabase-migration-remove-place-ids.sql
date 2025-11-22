-- Migration: Remove place_ids column from cafes and bakeries tables
-- This removes Google Places API dependency

-- Remove place_ids column from cafes table
ALTER TABLE public.cafes
DROP COLUMN IF EXISTS place_ids;

-- Remove place_ids column from bakeries table
ALTER TABLE public.bakeries
DROP COLUMN IF EXISTS place_ids;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed place_ids columns from cafes and bakeries tables';
END $$;
