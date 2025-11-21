-- Migration: Add start_date and end_date to events table
-- This allows filtering events that are currently happening

ALTER TABLE public.events
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance when filtering by dates
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_end_date ON public.events(end_date);

-- Add a composite index for querying currently happening events
CREATE INDEX idx_events_date_range ON public.events(start_date, end_date)
WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

-- Update RLS policies if needed (keeping existing policies)
-- Note: Existing policies should continue to work as these are just additional columns

COMMENT ON COLUMN public.events.start_date IS 'ISO 8601 timestamp when the event starts';
COMMENT ON COLUMN public.events.end_date IS 'ISO 8601 timestamp when the event ends';
