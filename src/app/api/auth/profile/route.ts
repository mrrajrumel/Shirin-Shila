import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  updateDisplayName,
  ensureAdminAccounts,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return up-to-date profile from persistent store
  const users = ensureAdminAccounts();
  const user = users.find((u) => u.id === session.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    const result = updateDisplayName(session.id, displayName);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        displayName: result.user!.displayName,
        role: result.user!.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

