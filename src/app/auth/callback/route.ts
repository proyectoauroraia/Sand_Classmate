
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Use 127.0.0.1 instead of localhost for browser compatibility
  const newOrigin = origin.replace('localhost', '127.0.0.1');

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${newOrigin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${newOrigin}/auth/auth-code-error`)
}
