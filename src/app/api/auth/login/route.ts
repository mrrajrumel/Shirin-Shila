import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid admin email or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, email });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
