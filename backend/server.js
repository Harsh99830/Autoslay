import express from 'express';
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
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

    // Combine auth user with profile data
    const userData = {
      id: req.user.id,
      email: req.user.email,
      name: profile?.name || req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || '',
      emails: profile?.emails || [req.user.email],
      phone_numbers: profile?.phone_numbers || [],
      resumes: profile?.resumes || [],
      linkedin: profile?.linkedin || '',
      website: profile?.website || '',
    };

    res.json(userData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.post('/user/update', authMiddleware, async (req, res) => {
  const { name, emails, phone_numbers, linkedin, website } = req.body;
  const userId = req.user.id;

  try {
    // Use service role client - it bypasses RLS
    // But we need to handle the case where profile doesn't exist yet
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({
          name,
          emails,
          phone_numbers,
          linkedin,
          website,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
    } else {
      // Insert new profile
      result = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name,
          emails,
          phone_numbers,
          linkedin,
          website,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    const userData = {
      id: userId,
      email: req.user.email,
      name: result.data?.name || name || '',
      emails: result.data?.emails || emails || [],
      phone_numbers: result.data?.phone_numbers || phone_numbers || [],
      resumes: result.data?.resumes || [],
      linkedin: result.data?.linkedin || linkedin || '',
      website: result.data?.website || website || '',
    };

    res.json(userData);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update profile' });
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

app.listen(PORT, () => {
  console.log(`🚀 AutoSlay backend running on http://localhost:${PORT}`);
});
