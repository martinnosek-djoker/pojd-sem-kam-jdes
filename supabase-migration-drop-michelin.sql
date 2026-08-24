-- Drops the Michelin restaurants feature entirely from the database.
-- Run this manually in the Supabase SQL editor (dashboard) once you've
-- confirmed the app no longer references the michelin_restaurants table/data.
-- This is IRREVERSIBLE unless you have a backup/point-in-time-restore.

DROP TABLE IF EXISTS michelin_restaurants CASCADE;
