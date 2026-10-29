import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { MediaPartner } from '@/data/media-partners';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const items = await readStore<MediaPartner[]>('mediaPartners');
    return NextResponse.json({ success: true, items }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
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
    const items = await readStore<MediaPartner[]>('mediaPartners');

    const newItem: MediaPartner = {
      id: body.id || `partner-${Date.now()}`,
      name: body.name?.trim() || 'Media Partner',
      banglaName: body.banglaName?.trim() || undefined,
      logo: body.logo?.trim() || '/images/logos/channel-i.svg',
      website: body.website?.trim() || undefined,
    };

    const updated = [...items, newItem];
    await writeStore('mediaPartners', updated);
    revalidatePath('/');

    return NextResponse.json({ success: true, item: newItem, items: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const items = await readStore<MediaPartner[]>('mediaPartners');
    const index = items.findIndex((i) => i.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    items[index] = {
      ...items[index],
      name: body.name?.trim() || items[index].name,
      banglaName: body.banglaName?.trim() || items[index].banglaName,
      logo: body.logo?.trim() || items[index].logo,
      website: body.website?.trim() || items[index].website,
    };

    await writeStore('mediaPartners', items);
    revalidatePath('/');

    return NextResponse.json({ success: true, item: items[index], items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const items = await readStore<MediaPartner[]>('mediaPartners');
    const filtered = items.filter((i) => i.id !== id);

    await writeStore('mediaPartners', filtered);
    revalidatePath('/');

    return NextResponse.json({ success: true, id, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
