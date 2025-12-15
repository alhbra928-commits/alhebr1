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

// Custom fetch with retry logic
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // If server error (5xx) and not last attempt, retry
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`⚠️ Server error ${response.status}, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      return response;
    } catch (error) {
      // Network error
      if (attempt < maxRetries) {
        console.warn(`⚠️ Network error, retrying (${attempt}/${maxRetries})...`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      // Last attempt failed
      throw error;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Max retries exceeded');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      'x-client-info': 'palm-olive-platform',
    },
    fetch: customFetch,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});
