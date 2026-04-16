import { NextResponse } from 'next/server'
import { createClient } from '../../utils/supabase/server'

export async function GET(request: Request) {
  // 1. Grab the URL the user just landed on
  const { searchParams, origin } = new URL(request.url)
  
  // 2. Extract the secret 'code' Google/Supabase attached to the URL
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // 3. Trade the temporary code for a secure, permanent session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 4. Redirect the user to the protected dashboard
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // If there is no code or an error happens, send them back to login
  return NextResponse.redirect(`${origin}/login`)
}