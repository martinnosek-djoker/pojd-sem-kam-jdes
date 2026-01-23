-- Create storage bucket for restaurant review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to restaurant images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'restaurant-images' AND auth.role() = 'authenticated');

-- Allow authenticated users (admins) to update images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'restaurant-images' AND auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'restaurant-images' AND auth.role() = 'authenticated');
