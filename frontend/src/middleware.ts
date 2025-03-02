import { NextRequest, NextResponse } from 'next/server';

// This is a simplified middleware for demo purposes
// In a real application, this would check for valid authentication tokens
export function middleware(request: NextRequest) {
  // Mock authentication check - for demo purposes
  const isAuthenticated = request.cookies.has('auth_session');
  const { pathname } = request.nextUrl;

  // Paths that are accessible without authentication
  const publicPaths = ['/', '/auth'];
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith('/auth')
  );

  // For protected routes in App Router, we need to check both the route group and actual URLs
  const isProtectedRoute = 
    pathname.includes('(protected)') || 
    [
      '/dashboard',
      '/bank-accounts', 
      '/transactions', 
      '/documents', 
      '/bank-statements',
      '/chat',
      '/settings'
    ].some(route => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure paths that trigger this middleware
export const config = {
  // Skip static files and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}; 