export const runtime = 'nodejs'; // Forces Vercel to use Node instead of Edge
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  // 1. If not logged in and NOT on login/auth pages, redirect to login
  if (!user && !isLoginPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If logged in, check is_superadmin status
  if (user && !isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Block non-admins unless they are already on the login page (to avoid loops)
    if (!profile?.is_superadmin && !isLoginPage) {
      return new NextResponse("Access Denied: SuperAdmins Only", { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}