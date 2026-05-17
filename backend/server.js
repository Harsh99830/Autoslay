import express from 'express';
import { encryptObject, decryptObject } from './crypto.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://autoslay.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// Ensure uploads directory exists (use /tmp on Vercel — only writable dir in serverless)
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create uploads dir:', e.message);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Supabase client (service role for admin operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Auth middleware - verify JWT token
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get user profile (including custom data from profiles table)
app.get('/user', authMiddleware, async (req, res) => {
  try {
    // Get profile data from your database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    // Decrypt all profile fields before sending to client
    const p = decryptObject(profile || {}, ['id', 'created_at', 'updated_at']);

    const userData = {
      id: req.user.id,
      email: req.user.email,
      name: p.name || req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || '',
      emails: p.emails || [req.user.email],
      phone_numbers: p.phone_numbers || [],
      resumes: p.resumes || [],
      linkedin: p.linkedin || '',
      github: p.github || '',
      website: p.website || '',
      // Address
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      country: p.country || '',
      pincode: p.pincode || '',
      // Education
      college: p.college || '',
      degree: p.degree || '',
      branch: p.branch || '',
      graduation_year: p.graduation_year || '',
      cgpa: p.cgpa || '',
      // Personal
      date_of_birth: p.date_of_birth || '',
      gender: p.gender || '',
      nationality: p.nationality || '',
      // Professional
      current_company: p.current_company || '',
      job_title: p.job_title || '',
      years_of_experience: p.years_of_experience || '',
      skills: p.skills || [],
      languages: p.languages || [],
    };

    res.json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.post('/user/update', authMiddleware, async (req, res) => {
  const {
    name, emails, phone_numbers,
    linkedin, github, website,
    address, city, state, country, pincode,
    college, degree, branch, graduation_year, cgpa,
    date_of_birth, gender, nationality,
    current_company, job_title, years_of_experience,
    skills, languages
  } = req.body;
  const userId = req.user.id;

  console.log('Update request body:', req.body);

  try {
    // Use service role client - it bypasses RLS
    // But we need to handle the case where profile doesn't exist yet
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    console.log('Existing profile:', existingProfile);

    let result;
    
    // Encrypt all profile fields before writing to Supabase
    const enc = encryptObject({
      name,
      emails,
      phone_numbers,
      linkedin,
      github,
      website,
      address,
      city,
      state,
      country,
      pincode,
      college,
      degree,
      branch,
      graduation_year,
      cgpa,
      date_of_birth,
      gender,
      nationality,
      current_company,
      job_title,
      years_of_experience,
      skills,
      languages,
    });

    // Use RPC function that bypasses RLS via SECURITY DEFINER
    const { data, error } = await supabase.rpc('upsert_profile_admin', {
      p_user_id: userId,
      p_name: enc.name,
      p_emails: enc.emails,
      p_phone_numbers: enc.phone_numbers,
      p_linkedin: enc.linkedin,
      p_github: enc.github,
      p_website: enc.website,
      p_address: enc.address,
      p_city: enc.city,
      p_state: enc.state,
      p_country: enc.country,
      p_pincode: enc.pincode,
      p_college: enc.college,
      p_degree: enc.degree,
      p_branch: enc.branch,
      p_graduation_year: enc.graduation_year,
      p_cgpa: enc.cgpa,
      p_date_of_birth: enc.date_of_birth,
      p_gender: enc.gender,
      p_nationality: enc.nationality,
      p_current_company: enc.current_company,
      p_job_title: enc.job_title,
      p_years_of_experience: enc.years_of_experience,
      p_skills: enc.skills,
      p_languages: enc.languages
    });
    
    if (error) {
      console.log('RPC error:', error);
      throw error;
    }
    
    result = { data, error: null };

    console.log('Supabase result:', result);

    if (result.error) throw result.error;

    // Return the plain (unencrypted) values that the client just sent — no need to decrypt the RPC response
    const userData = {
      id: userId,
      email: req.user.email,
      name: name || '',
      emails: emails || [],
      phone_numbers: phone_numbers || [],
      resumes: result.data?.resumes || [],
      linkedin: linkedin || '',
      github: github || '',
      website: website || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || '',
      pincode: pincode || '',
      college: college || '',
      degree: degree || '',
      branch: branch || '',
      graduation_year: graduation_year || '',
      cgpa: cgpa || '',
      date_of_birth: date_of_birth || '',
      gender: gender || '',
      nationality: nationality || '',
      current_company: current_company || '',
      job_title: job_title || '',
      years_of_experience: years_of_experience || '',
      skills: skills || [],
      languages: languages || [],
    };

    res.json(userData);
  } catch (err) {
    console.error('Error updating user:', err);
    console.error('Error details:', err.message, err.stack);
    if (err.code) console.error('Error code:', err.code);
    if (err.details) console.error('Error details:', err.details);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// Upload resume
app.post('/upload-resume', authMiddleware, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user.id;

  try {
    // Get current profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, resumes')
      .eq('id', userId)
      .single();

    const fileUrl = `/uploads/${req.file.filename}`;
    const currentResumes = existingProfile?.resumes || [];
    const updatedResumes = [...currentResumes, fileUrl];

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({
          resumes: updatedResumes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } else {
      // Insert new profile
      result = await supabase
        .from('profiles')
        .insert({
          id: userId,
          resumes: updatedResumes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) throw result.error;

    res.json({ url: fileUrl, message: 'Resume uploaded successfully' });
  } catch (err) {
    console.error('Error uploading resume:', err);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Google OAuth callback handler (optional - for server-side token exchange if needed)
app.post('/auth/callback', async (req, res) => {
  const { access_token, refresh_token } = req.body;
  
  // This endpoint can be used to verify tokens or perform additional setup
  // The actual OAuth flow happens client-side with Supabase
  res.json({ success: true });
});

// Export for Vercel
export default app;

// Listen locally (Vercel ignores this)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
