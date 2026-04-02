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
    github TEXT,
    website TEXT,
    -- Address breakdown
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    pincode TEXT,
    -- Education
    college TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year TEXT,
    cgpa TEXT,
    -- Personal
    date_of_birth TEXT,
    gender TEXT,
    nationality TEXT,
    -- Professional
    current_company TEXT,
    job_title TEXT,
    years_of_experience TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add new columns if table already exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cgpa TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

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

-- Function to upsert profile (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.upsert_profile_admin(
    p_user_id UUID,
    p_name TEXT,
    p_emails TEXT[],
    p_phone_numbers TEXT[],
    p_linkedin TEXT,
    p_github TEXT,
    p_website TEXT,
    p_address TEXT,
    p_city TEXT,
    p_state TEXT,
    p_country TEXT,
    p_pincode TEXT,
    p_college TEXT,
    p_degree TEXT,
    p_branch TEXT,
    p_graduation_year TEXT,
    p_cgpa TEXT,
    p_date_of_birth TEXT,
    p_gender TEXT,
    p_nationality TEXT,
    p_current_company TEXT,
    p_job_title TEXT,
    p_years_of_experience TEXT,
    p_skills TEXT[],
    p_languages TEXT[]
)
RETURNS public.profiles AS $$
DECLARE
    v_profile public.profiles;
BEGIN
    INSERT INTO public.profiles (
        id, name, emails, phone_numbers,
        linkedin, github, website,
        address, city, state, country, pincode,
        college, degree, branch, graduation_year, cgpa,
        date_of_birth, gender, nationality,
        current_company, job_title, years_of_experience,
        skills, languages,
        created_at, updated_at
    ) VALUES (
        p_user_id, p_name, p_emails, p_phone_numbers,
        p_linkedin, p_github, p_website,
        p_address, p_city, p_state, p_country, p_pincode,
        p_college, p_degree, p_branch, p_graduation_year, p_cgpa,
        p_date_of_birth, p_gender, p_nationality,
        p_current_company, p_job_title, p_years_of_experience,
        p_skills, p_languages,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        emails = EXCLUDED.emails,
        phone_numbers = EXCLUDED.phone_numbers,
        linkedin = EXCLUDED.linkedin,
        github = EXCLUDED.github,
        website = EXCLUDED.website,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        pincode = EXCLUDED.pincode,
        college = EXCLUDED.college,
        degree = EXCLUDED.degree,
        branch = EXCLUDED.branch,
        graduation_year = EXCLUDED.graduation_year,
        cgpa = EXCLUDED.cgpa,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        nationality = EXCLUDED.nationality,
        current_company = EXCLUDED.current_company,
        job_title = EXCLUDED.job_title,
        years_of_experience = EXCLUDED.years_of_experience,
        skills = EXCLUDED.skills,
        languages = EXCLUDED.languages,
        updated_at = NOW()
    RETURNING * INTO v_profile;
    
    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for resumes (if using Supabase Storage)
-- Note: Create this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: resumes
-- Public: false (private)
-- Allowed file types: .pdf, .doc, .docx
