-- =============================================================
-- ENCRYPTION MIGRATION — run this in Supabase SQL Editor
-- =============================================================

-- Step 1: Convert array columns to TEXT (to store encrypted strings)
ALTER TABLE public.profiles ALTER COLUMN emails TYPE TEXT USING NULL;
ALTER TABLE public.profiles ALTER COLUMN phone_numbers TYPE TEXT USING NULL;
ALTER TABLE public.profiles ALTER COLUMN skills TYPE TEXT USING NULL;
ALTER TABLE public.profiles ALTER COLUMN languages TYPE TEXT USING NULL;

-- Step 2: Replace the RPC function with updated TEXT param types
CREATE OR REPLACE FUNCTION public.upsert_profile_admin(
    p_user_id UUID,
    p_name TEXT,
    p_emails TEXT,
    p_phone_numbers TEXT,
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
    p_skills TEXT,
    p_languages TEXT
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
