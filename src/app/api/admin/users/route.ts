import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken, getAllAdminUsers, hasMinimumRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only admin role can view users list
  if (!hasMinimumRole(session, 'admin')) {
    return NextResponse.json({ error: 'Forbidden. Administrator access required.' }, { status: 403 });
  }

  const users = getAllAdminUsers();
  return NextResponse.json({ users });
}
