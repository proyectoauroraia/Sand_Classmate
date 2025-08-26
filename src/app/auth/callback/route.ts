
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Use NEXT_PUBLIC_BASE_URL for redirection to ensure consistency
      const redirectUrl = new URL(next, process.env.NEXT_PUBLIC_BASE_URL || origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  const errorUrl = new URL('/auth/auth-code-error', process.env.NEXT_PUBLIC_BASE_URL || origin);
  return NextResponse.redirect(errorUrl);
}
