
-- Enable RLS on manifestations table if not already enabled
ALTER TABLE public.manifestations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all manifestations (both user-created and admin sleep stories)
CREATE POLICY "Users can view all manifestations" 
ON public.manifestations 
FOR SELECT 
USING (true);

-- Allow users to insert their own manifestations (user_id matches auth.uid())
CREATE POLICY "Users can insert own manifestations" 
ON public.manifestations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admin users to insert sleep stories (admin content with null user_id)
CREATE POLICY "Admin can insert sleep stories" 
ON public.manifestations 
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  content_type = 'sleep_story' AND
  auth.email() IN ('admin@example.com', 'krishna@yopmail.com')
);

-- Allow users to update their own manifestations
CREATE POLICY "Users can update own manifestations" 
ON public.manifestations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own manifestations
CREATE POLICY "Users can delete own manifestations" 
ON public.manifestations 
FOR DELETE 
USING (auth.uid() = user_id);
