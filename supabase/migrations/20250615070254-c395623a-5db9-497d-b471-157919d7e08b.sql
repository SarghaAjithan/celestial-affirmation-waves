
-- Create a new table to store manifestations
CREATE TABLE public.manifestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- future: user_id UUID, -- enable if/when adding authentication
  -- Optionally save mood, voice style etc
  mood INT,
  voice TEXT,
  background_music TEXT
);

-- (No RLS yet, public read/write for demo, update as soon as you add auth)

