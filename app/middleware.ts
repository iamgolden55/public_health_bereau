// app/middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname)
  
  // Get token from multiple sources
  const cookieToken = req.cookies.get("token")?.value
  const authHeader = req.headers.get('Authorization')
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)
  
  console.log('Token sources:', {
    hasCookieToken: !!cookieToken,
    hasAuthHeader: !!authHeader
  })

  const path = req.nextUrl.pathname
  
  // Don't require auth for these paths
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/api/token/refresh",
    "/_next",
    "/api/auth",
    "/loading.gif", // If you use any loading assets
    "/favicon.ico"
  ]

  // Allow public paths
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    console.log('Public path detected, allowing access')
    return NextResponse.next()
  }

  // Handle missing token
  if (!token) {
    console.log('No token found, redirecting to login')
    const response = NextResponse.redirect(new URL("/auth/login", req.url))
    response.cookies.delete('token')
    return response
  }

  // Token exists, proceed and ensure cookie is set
  console.log('Token found, proceeding with request')
  const response = NextResponse.next()
  
  // Ensure token is in cookie if it came from auth header
  if (token && !cookieToken) {
    console.log('Setting token cookie from auth header')
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}