-- Migration: Merge bakeries and breakfasts into cafes with tags
-- This migration adds a tags field to cafes and migrates data from bakeries and breakfasts

-- Step 1: Add tags column to cafes table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cafes' AND column_name = 'tags'
    ) THEN
        ALTER TABLE cafes ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Step 2: Create index on tags for faster filtering
CREATE INDEX IF NOT EXISTS cafes_tags_idx ON cafes USING GIN(tags);

-- Step 3: Migrate data from bakeries to cafes with "dezert" tag
-- Only insert bakeries that don't already exist in cafes (based on name)
INSERT INTO cafes (name, location, addresses, coordinates, website_url, image_url, tags, created_at, updated_at)
SELECT
    b.name,
    b.location,
    b.addresses,
    b.coordinates,
    b.website_url,
    b.image_url,
    ARRAY['dezert']::TEXT[],
    b.created_at,
    b.updated_at
FROM bakeries b
WHERE NOT EXISTS (
    SELECT 1 FROM cafes c WHERE c.name = b.name
)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Migrate data from breakfasts to cafes with "snídaně" tag
-- Only insert breakfasts that don't already exist in cafes (based on name)
INSERT INTO cafes (name, location, addresses, coordinates, website_url, image_url, tags, created_at, updated_at)
SELECT
    br.name,
    br.location,
    br.addresses,
    br.coordinates,
    br.website_url,
    br.image_url,
    ARRAY['snídaně']::TEXT[],
    br.created_at,
    br.updated_at
FROM breakfasts br
WHERE NOT EXISTS (
    SELECT 1 FROM cafes c WHERE c.name = br.name
)
ON CONFLICT (name) DO NOTHING;

-- Step 5: For cafes that existed in multiple tables, add appropriate tags
-- If a cafe exists in both cafes and bakeries, add "dezert" tag
UPDATE cafes c
SET tags = array_append(tags, 'dezert')
WHERE EXISTS (
    SELECT 1 FROM bakeries b WHERE b.name = c.name
)
AND NOT ('dezert' = ANY(c.tags));

-- If a cafe exists in both cafes and breakfasts, add "snídaně" tag
UPDATE cafes c
SET tags = array_append(tags, 'snídaně')
WHERE EXISTS (
    SELECT 1 FROM breakfasts br WHERE br.name = c.name
)
AND NOT ('snídaně' = ANY(c.tags));

-- Step 6: Optional - Keep bakeries and breakfasts tables for backup
-- You can drop them later after verifying the migration worked correctly:
-- DROP TABLE IF EXISTS bakeries CASCADE;
-- DROP TABLE IF EXISTS breakfasts CASCADE;

-- Summary of migration
DO $$
DECLARE
    cafe_count INT;
    bakery_count INT;
    breakfast_count INT;
    dezert_tag_count INT;
    snidane_tag_count INT;
BEGIN
    SELECT COUNT(*) INTO cafe_count FROM cafes;
    SELECT COUNT(*) INTO bakery_count FROM bakeries;
    SELECT COUNT(*) INTO breakfast_count FROM breakfasts;
    SELECT COUNT(*) INTO dezert_tag_count FROM cafes WHERE 'dezert' = ANY(tags);
    SELECT COUNT(*) INTO snidane_tag_count FROM cafes WHERE 'snídaně' = ANY(tags);

    RAISE NOTICE '=== Migration Summary ===';
    RAISE NOTICE 'Total cafes: %', cafe_count;
    RAISE NOTICE 'Cafes with "dezert" tag: %', dezert_tag_count;
    RAISE NOTICE 'Cafes with "snídaně" tag: %', snidane_tag_count;
    RAISE NOTICE 'Original bakeries count: %', bakery_count;
    RAISE NOTICE 'Original breakfasts count: %', breakfast_count;
END $$;
