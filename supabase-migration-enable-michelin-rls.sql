-- Enable Row Level Security on michelin_restaurants table
-- This fixes the security advisor warnings about RLS not being enabled

ALTER TABLE michelin_restaurants ENABLE ROW LEVEL SECURITY;
