import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  changePassword,
  createSessionToken,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiting for password-change attempts
const changePwAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_PW_ATTEMPTS = 5;
const PW_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting per user
  const rateKey = session.id;
  const now = Date.now();
  const record = changePwAttempts.get(rateKey);
  if (record) {
    if (now < record.resetAt && record.count >= MAX_PW_ATTEMPTS) {
      const remaining = Math.ceil((record.resetAt - now) / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${remaining} minute(s) before trying again.` },
        { status: 429 }
      );
    }
    if (now >= record.resetAt) {
      changePwAttempts.delete(rateKey);
    }
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const result = await changePassword(session.id, currentPassword, newPassword);
    if (!result.success) {
      // Increment failure counter
      const existing = changePwAttempts.get(rateKey) || { count: 0, resetAt: now + PW_WINDOW_MS };
      changePwAttempts.set(rateKey, {
        count: existing.count + 1,
        resetAt: existing.resetAt,
      });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Clear rate-limit record on success
    changePwAttempts.delete(rateKey);

    const response = NextResponse.json({ success: true, message: 'Password updated successfully.' });

    // Issue updated session token reflecting the new tokenVersion so current session persists while older sessions are invalidated
    const refreshedToken = createSessionToken(session, result.tokenVersion);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: refreshedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

