
-- Add new columns to manifestations table for sleep stories functionality
ALTER TABLE public.manifestations 
ADD COLUMN content_type TEXT DEFAULT 'manifestation' CHECK (content_type IN ('manifestation', 'sleep_story')),
ADD COLUMN description TEXT,
ADD COLUMN duration INTEGER,
ADD COLUMN category TEXT,
ADD COLUMN narrator TEXT,
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN is_premium BOOLEAN DEFAULT false;

-- Create storage bucket for sleep stories
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sleep-stories', 'sleep-stories', true);

-- Create storage policy for sleep stories bucket - allow public read access
CREATE POLICY "Public read access for sleep stories" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'sleep-stories');

-- Create storage policy for authenticated users to upload sleep stories (admin functionality)
CREATE POLICY "Authenticated users can upload sleep stories" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'sleep-stories' AND auth.role() = 'authenticated');
