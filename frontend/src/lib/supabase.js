import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API base URL for your Node backend.
// If VITE_API_URL is explicitly set (e.g. via Vercel env vars), use it.
// Otherwise fall back based on hostname: localhost → local dev server,
// anything else (production domain) → deployed backend.
const explicitApiUrl = import.meta.env.VITE_API_URL;
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const API_BASE =
  explicitApiUrl && explicitApiUrl !== 'http://localhost:4000'
    ? explicitApiUrl
    : isLocalhost
    ? 'http://localhost:4000'
    : 'https://autoslay-backend.vercel.app';
