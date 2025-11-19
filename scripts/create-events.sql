-- Vytvoření tabulky events
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    date TEXT,
    link TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy pro čtení (veřejně přístupné)
CREATE POLICY "Events jsou veřejně čitelné" ON public.events
    FOR SELECT USING (true);

-- Policy pro insert/update/delete (pouze pro autentifikované uživatele - adminy)
CREATE POLICY "Pouze autentifikovaní uživatelé mohou upravovat events" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');
