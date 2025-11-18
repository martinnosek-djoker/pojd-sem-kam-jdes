-- Table for storing device FCM tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android', -- 'android' or 'ios'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);

-- Enable RLS (Row Level Security)
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their token (for device registration)
CREATE POLICY "Anyone can insert device tokens"
  ON device_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update their own token
CREATE POLICY "Anyone can update device tokens"
  ON device_tokens
  FOR UPDATE
  USING (true);

-- Policy: Only authenticated users can read tokens (for admin)
CREATE POLICY "Only authenticated users can read tokens"
  ON device_tokens
  FOR SELECT
  USING (auth.role() = 'authenticated');
