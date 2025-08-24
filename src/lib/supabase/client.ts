
'use client';

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Ensure the environment variables are not empty.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // This will be logged in the browser console, which is helpful for debugging.
    console.error("Supabase URL or Anon Key is missing. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.");
    
    // To avoid crashing the app, we can return a dummy/mock client
    // or handle this case gracefully in the calling component.
    // For now, let's allow it to fail during initialization to make the issue obvious.
    // In a production app, you might want to return a mock client.
    throw new Error("Supabase client configuration is missing.");
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
