import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { ContactInfo } from '@/data/contact';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET() {
  try {
    const info = await readStore<ContactInfo>('contactInfo');
    return NextResponse.json(
      { success: true, info },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const current = await readStore<ContactInfo>('contactInfo');

    const updated: ContactInfo = {
      ...current,
      managementEmail: body.managementEmail || current.managementEmail,
      pressEmail: body.pressEmail || current.pressEmail,
      agencyName: body.agencyName || current.agencyName,
      representationNotes: body.representationNotes || current.representationNotes,
      socials: {
        ...current.socials,
        ...(body.socials || {}),
      },
    };

    await writeStore('contactInfo', updated);
    revalidatePath('/');

    return NextResponse.json({ success: true, info: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

