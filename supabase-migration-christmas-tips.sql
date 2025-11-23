-- Migration: Create christmas_tips table for Christmas 2025 section
-- Stores tips for where to buy Christmas items (cookies, bread, gifts, experiences, kitchenware)

CREATE TABLE IF NOT EXISTS public.christmas_tips (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cukrovi', 'vanocka', 'jedle-darky', 'zazitky', 'veci-do-kuchyne')),
  image_url TEXT,
  shop_url TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.christmas_tips ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access on christmas_tips"
  ON public.christmas_tips
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users (admin) to insert
CREATE POLICY "Allow authenticated insert on christmas_tips"
  ON public.christmas_tips
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users (admin) to update
CREATE POLICY "Allow authenticated update on christmas_tips"
  ON public.christmas_tips
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users (admin) to delete
CREATE POLICY "Allow authenticated delete on christmas_tips"
  ON public.christmas_tips
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_christmas_tips_category ON public.christmas_tips(category);
CREATE INDEX idx_christmas_tips_display_order ON public.christmas_tips(display_order);

-- Insert sample data
INSERT INTO public.christmas_tips (name, category, image_url, shop_url, description, display_order) VALUES
  ('Cukrárna XY', 'cukrovi', null, 'https://example.com', 'Nejlepší vánoční cukroví v Praze', 1),
  ('Pekárna ABC', 'vanocka', null, 'https://example.com', 'Tradiční vánočky pečené ručně', 1),
  ('Delikatesy Praha', 'jedle-darky', null, 'https://example.com', 'Prémiové jedlé dárky', 1),
  ('Gastronomické kurzy', 'zazitky', null, 'https://example.com', 'Kurzy vaření a pečení', 1),
  ('Kitchen Store', 'veci-do-kuchyne', null, 'https://example.com', 'Kvalitní kuchyňské vybavení', 1);

COMMENT ON TABLE public.christmas_tips IS 'Christmas shopping tips organized by category';
COMMENT ON COLUMN public.christmas_tips.category IS 'Categories: cukrovi (cookies), vanocka (Christmas bread), jedle-darky (edible gifts), zazitky (experiences), veci-do-kuchyne (kitchenware)';
