-- Drops the reviews feature entirely from the database.
-- Run this manually in the Supabase SQL editor (dashboard) once you've
-- confirmed the app no longer references the reviews table/data.
-- This is IRREVERSIBLE unless you have a backup/point-in-time-restore.

DROP TABLE IF EXISTS reviews CASCADE;
