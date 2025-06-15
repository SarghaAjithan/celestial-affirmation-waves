
-- Add user_id column to manifestations table to link manifestations to users
ALTER TABLE public.manifestations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on manifestations table
ALTER TABLE public.manifestations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view only their own manifestations
CREATE POLICY "Users can view their own manifestations" 
  ON public.manifestations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own manifestations
CREATE POLICY "Users can create their own manifestations" 
  ON public.manifestations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own manifestations
CREATE POLICY "Users can update their own manifestations" 
  ON public.manifestations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own manifestations
CREATE POLICY "Users can delete their own manifestations" 
  ON public.manifestations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
