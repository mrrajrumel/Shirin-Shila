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
  const { pathname, searchParams } = request.nextUrl;

  // 1. Agent Negotiation: Serve Markdown when requested via Accept header or query param
  const acceptHeader = request.headers.get('accept') || '';
  const wantsMarkdown =
    acceptHeader.includes('text/markdown') ||
    acceptHeader.includes('text/x-markdown') ||
    searchParams.get('format') === 'markdown';

  if ((pathname === '/' || pathname === '') && wantsMarkdown) {
    const markdownUrl = new URL('/api/markdown', request.url);
    const response = NextResponse.rewrite(markdownUrl);
    response.headers.set(
      'Link',
      '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </api/markdown>; rel="alternate"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="service-desc"'
    );
    response.headers.set('Vary', 'Accept');
    return response;
  }

  // 2. Admin Authentication Checks
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

  // 3. Default response with RFC 8288 Link header for agent discovery
  const response = NextResponse.next();
  response.headers.set(
    'Link',
    '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </api/markdown>; rel="alternate"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="service-desc"'
  );
  response.headers.set('Vary', 'Accept');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|images|documents|uploads).*)'],
};
