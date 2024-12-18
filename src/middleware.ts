import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public paths that don't require authentication
const publicPaths = ['/auth/signin', '/auth/signup', '/auth/verify', '/auth/reset-password', '/auth/callback', '/landing']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  // If user is authenticated and trying to access auth pages or landing, redirect to home
  if (session && (publicPaths.includes(pathname) || pathname === '/landing')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If user is not authenticated and trying to access protected routes
  if (!session && !publicPaths.includes(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/landing', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 