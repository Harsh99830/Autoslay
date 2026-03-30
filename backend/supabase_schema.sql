-- AutoSlay Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable Row Level Security
alter table if exists profiles enable row level security;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    emails TEXT[] DEFAULT '{}',
    phone_numbers TEXT[] DEFAULT '{}',
    resumes TEXT[] DEFAULT '{}',
    linkedin TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can only access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;

-- Create policy: users can only access their own profile (for client-side access)
CREATE POLICY "Users can only access their own profile"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create policy: service role can access all profiles (for server-side access)
CREATE POLICY "Service role can access all profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, emails)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        ARRAY[NEW.email]
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for resumes (if using Supabase Storage)
-- Note: Create this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: resumes
-- Public: false (private)
-- Allowed file types: .pdf, .doc, .docx
