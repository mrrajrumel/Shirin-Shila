import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'shirin_shila_secret_session_token_2026_secured_tso';

function decodeBase64Url(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  } catch {
    return '';
  }
}

async function verifyHmacSignature(encodedPayload: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ADMIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload));
    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSignature = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return expectedSignature === signature;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('shirin_shila_admin_session')?.value;
    const isLoginPage = pathname === '/admin/login';

    let isAuthenticated = false;
    if (sessionCookie) {
      try {
        const parts = sessionCookie.split('.');
        if (parts.length === 2) {
          const [encodedPayload, signature] = parts;
          if (encodedPayload && signature) {
            const isSignatureValid = await verifyHmacSignature(encodedPayload, signature);
            if (isSignatureValid) {
              const decoded = decodeBase64Url(encodedPayload);
              if (decoded) {
                const payload = JSON.parse(decoded);
                if (
                  payload &&
                  payload.exp &&
                  Date.now() < payload.exp &&
                  payload.role === 'admin' &&
                  (payload.username?.toLowerCase() === 'shirin' ||
                    payload.username?.toLowerCase() === 'rumel')
                ) {
                  isAuthenticated = true;
                }
              }
            }
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
