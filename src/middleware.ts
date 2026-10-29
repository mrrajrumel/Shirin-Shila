import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('shirin_shila_admin_session')?.value;
    const isLoginPage = pathname === '/admin/login';

    let isAuthenticated = false;
    if (sessionCookie) {
      try {
        const [encodedPayload] = sessionCookie.split('.');
        if (encodedPayload) {
          const payload = JSON.parse(
            Buffer.from(encodedPayload, 'base64url').toString('utf-8')
          );
          if (payload && payload.exp && Date.now() < payload.exp && payload.role === 'admin') {
            isAuthenticated = true;
          }
        }
      } catch {
        isAuthenticated = false;
      }
    }

    // If authenticated user visits /admin/login, redirect to /admin dashboard
    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // If unauthenticated user visits any protected /admin route, kick to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('from', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
