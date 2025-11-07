-- Clear all restaurants from database
-- Run this in Supabase SQL Editor to start fresh

DELETE FROM restaurants;

-- Reset the ID sequence
ALTER SEQUENCE restaurants_id_seq RESTART WITH 1;
