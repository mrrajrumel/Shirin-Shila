import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await getDatabaseStatus();
  return NextResponse.json({
    success: true,
    status: {
      connected: status.connected,
      configured: status.configured,
      version: status.version || null,
      tablesCount: status.tables ? status.tables.length : 0,
      tables: status.tables || [],
    },
  });
}
