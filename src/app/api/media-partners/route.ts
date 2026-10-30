import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { MediaPartner } from '@/data/media-partners';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

function deriveNameFromLogo(logoUrl: string): string {
  try {
    const filename = logoUrl.split('/').pop() || 'Partner';
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Media Partner';
  }
}

export async function GET() {
  try {
    const items = await readStore<MediaPartner[]>('mediaPartners');
    return NextResponse.json(
      { success: true, items },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
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
    const existing = await readStore<MediaPartner[]>('mediaPartners');

    // Case 1: Bulk append via array of items
    if (Array.isArray(body.items)) {
      const newItems: MediaPartner[] = body.items.map((item: any, idx: number) => ({
        id: item.id || `partner-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: item.name?.trim() || deriveNameFromLogo(item.logo || ''),
        banglaName: item.banglaName?.trim() || undefined,
        logo: item.logo?.trim() || '/images/logos/channel-i.svg',
        website: item.website?.trim() || undefined,
      }));

      const updated = [...existing, ...newItems];
      await writeStore('mediaPartners', updated);
      revalidatePath('/');
      return NextResponse.json({ success: true, count: newItems.length, items: updated });
    }

    // Case 2: Bulk append via array of logo URLs
    if (Array.isArray(body.logos)) {
      const newItems: MediaPartner[] = body.logos.map((logoUrl: string, idx: number) => ({
        id: `partner-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        name: deriveNameFromLogo(logoUrl),
        logo: logoUrl.trim(),
      }));

      const updated = [...existing, ...newItems];
      await writeStore('mediaPartners', updated);
      revalidatePath('/');
      return NextResponse.json({ success: true, count: newItems.length, items: updated });
    }

    // Case 3: Single item append
    const newItem: MediaPartner = {
      id: body.id || `partner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: body.name?.trim() || deriveNameFromLogo(body.logo || ''),
      banglaName: body.banglaName?.trim() || undefined,
      logo: body.logo?.trim() || '/images/logos/channel-i.svg',
      website: body.website?.trim() || undefined,
    };

    const updated = [...existing, newItem];
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

    // Bulk replace (e.g. reorder or batch delete)
    if (Array.isArray(body.items)) {
      await writeStore('mediaPartners', body.items);
      revalidatePath('/');
      return NextResponse.json({ success: true, items: body.items });
    }

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
      name: body.name?.trim() || items[index].name || deriveNameFromLogo(body.logo || items[index].logo),
      banglaName: body.banglaName !== undefined ? body.banglaName?.trim() : items[index].banglaName,
      logo: body.logo?.trim() || items[index].logo,
      website: body.website !== undefined ? body.website?.trim() : items[index].website,
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
