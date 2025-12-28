import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('adminAccessToken')?.value;
  const refreshToken = request.cookies.get('adminRefreshToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  // allow client-side to handle auth via encryption/localStorage 
  // if (!token && !refreshToken && !isAuthPage) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // If we have either token and are on login page, go to dashboard
  if ((token || refreshToken) && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
