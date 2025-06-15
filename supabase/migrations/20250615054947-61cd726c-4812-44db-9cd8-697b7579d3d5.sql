
-- Create a storage bucket for voice previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-previews', 'voice-previews', true);

-- Create a policy to allow public access to voice previews with unique name
CREATE POLICY "Voice Previews Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'voice-previews');
