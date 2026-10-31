import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  getAllAdminUsers,
  createUser,
  updateUser,
  deleteUser,
  hasMinimumRole,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getAdminSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) return { error: 'Unauthorized', status: 401 };
  if (!hasMinimumRole(session, 'admin')) {
    return { error: 'Forbidden. Administrator access required.', status: 403 };
  }
  return { session };
}

export async function GET(request: NextRequest) {
  const auth = getAdminSession(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const role = searchParams.get('role') || '';

  const users = getAllAdminUsers(q, role);
  return NextResponse.json({
    users,
    currentUserId: auth.session.id,
  });
}

export async function POST(request: NextRequest) {
  const auth = getAdminSession(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const result = createUser({
      username: body.username,
      displayName: body.displayName,
      password: body.password,
      role: body.role,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = getAdminSession(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, displayName, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const result = updateUser(id, { displayName, role }, auth.session.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = getAdminSession(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let id: string | null = null;
    const { searchParams } = new URL(request.url);
    id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const result = deleteUser(id, auth.session.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 400 });
  }
}
