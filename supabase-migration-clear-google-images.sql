-- Migration: Remove Google Places Photo API URLs from all tables
-- These URLs no longer work without API key

-- Clear Google Places Photo API URLs from restaurants
UPDATE public.restaurants
SET image_url = NULL
WHERE image_url LIKE '%maps.googleapis.com/maps/api/place/photo%';

-- Clear Google Places Photo API URLs from cafes
UPDATE public.cafes
SET image_url = NULL
WHERE image_url LIKE '%maps.googleapis.com/maps/api/place/photo%';

-- Clear Google Places Photo API URLs from bakeries
UPDATE public.bakeries
SET image_url = NULL
WHERE image_url LIKE '%maps.googleapis.com/maps/api/place/photo%';

-- Log results
DO $$
DECLARE
  restaurants_updated INTEGER;
  cafes_updated INTEGER;
  bakeries_updated INTEGER;
BEGIN
  -- Count affected rows (this is approximate since UPDATE already happened)
  SELECT COUNT(*) INTO restaurants_updated FROM public.restaurants WHERE image_url IS NULL;
  SELECT COUNT(*) INTO cafes_updated FROM public.cafes WHERE image_url IS NULL;
  SELECT COUNT(*) INTO bakeries_updated FROM public.bakeries WHERE image_url IS NULL;

  RAISE NOTICE 'Cleared Google Places Photo API URLs:';
  RAISE NOTICE 'Restaurants with NULL image_url: %', restaurants_updated;
  RAISE NOTICE 'Cafes with NULL image_url: %', cafes_updated;
  RAISE NOTICE 'Bakeries with NULL image_url: %', bakeries_updated;
END $$;
