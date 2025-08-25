
'use client';

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase URL or Anon Key is missing. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
