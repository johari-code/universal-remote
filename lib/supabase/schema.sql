

-- Create remotes table
CREATE TABLE IF NOT EXISTS remotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  device_type TEXT,
  brand TEXT,
  model TEXT,
  layout JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create remote_buttons table
CREATE TABLE IF NOT EXISTS remote_buttons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  remote_id UUID REFERENCES remotes(id) ON DELETE CASCADE,
  button_id TEXT NOT NULL,
  button_type TEXT NOT NULL,
  hex_code TEXT,
  protocol TEXT,
  frequency INTEGER DEFAULT 38000,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(remote_id, button_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_remotes_user_id ON remotes(user_id);
CREATE INDEX IF NOT EXISTS idx_remote_buttons_remote_id ON remote_buttons(remote_id);

-- Enable Row Level Security
ALTER TABLE remotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_buttons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own remotes" ON remotes
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create own remotes" ON remotes
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own remotes" ON remotes
  FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete own remotes" ON remotes
  FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can view buttons of own remotes" ON remote_buttons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM remotes 
      WHERE remotes.id = remote_buttons.remote_id 
      AND remotes.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can manage buttons of own remotes" ON remote_buttons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM remotes 
      WHERE remotes.id = remote_buttons.remote_id 
      AND remotes.user_id = auth.jwt() ->> 'sub'
    )
  );

