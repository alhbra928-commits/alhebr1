import { createClient } from '@supabase/supabase-js';

// Default fallback values for production
const FALLBACK_SUPABASE_URL = 'https://xdjeygiadqavkmwarkfz.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkamV5Z2lhZHFhdmttd2Fya2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Mzk0NjYsImV4cCI6MjA3NjUxNTQ2Nn0.cEVEABWKMlHAc29xWHK0xVpCilWWt4r9ccOOg7skLr0';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Log which values are being used
if (import.meta.env.DEV) {
  console.log('Supabase Config:', {
    url: supabaseUrl === FALLBACK_SUPABASE_URL ? 'Using Fallback URL' : 'Using Env URL',
    key: supabaseAnonKey === FALLBACK_SUPABASE_ANON_KEY ? 'Using Fallback Key' : 'Using Env Key'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
});
