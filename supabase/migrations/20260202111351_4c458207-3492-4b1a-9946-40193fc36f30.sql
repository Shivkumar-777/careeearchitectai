-- Add user_type column to profiles for career stage categorization
ALTER TABLE public.profiles 
ADD COLUMN user_type text DEFAULT 'job_seeker';

-- Add check constraint for valid user types
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_user_type CHECK (user_type IN ('student', 'job_seeker', 'professional'));