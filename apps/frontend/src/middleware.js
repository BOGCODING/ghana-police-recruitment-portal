import { NextResponse } from 'next/server';

/**
 * Middleware to handle authentication and route protection.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Define Route Groups
  
  // Routes that require the user to be logged in
  const protectedPrefixes = [
    '/dashboard',
    '/application',
    '/profile',
    '/notifications',
    '/track',
    '/download'
  ];

  // Routes that are only for users who are NOT logged in (e.g. login, register)
  const authPrefixes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];

  // 2. Check Authentication
  const token = request.cookies.get('accessToken')?.value;

  // 3. Handle Protected Routes
  // If the user tries to access a protected route and is NOT logged in, redirect to login.
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      // Optional: Add a 'from' query param to redirect back after login
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Handle Auth Routes
  // If the user is ALREADY logged in and tries to access login/register, redirect to dashboard.
  const isAuthRoute = authPrefixes.some(prefix => pathname.startsWith(prefix));
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 5. Allow all other requests (Public routes, static assets, etc.)
  return NextResponse.next();
}

export const config = {
  // Matcher ignores internal Next.js paths (_next), api routes (handled by backend usually, 
  // or if Next.js API, can be protected here too), and common static files.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
