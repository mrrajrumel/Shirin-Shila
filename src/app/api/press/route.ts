import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { PressItem } from '@/data/press';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const items = await readStore<PressItem[]>('press');
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
    const items = await readStore<PressItem[]>('press');

    const newItem: PressItem = {
      id: body.id || `press-${Date.now()}`,
      publication: body.publication?.trim() || 'News Publication',
      headline: body.headline?.trim() || 'Media Coverage Headline',
      date: body.date?.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      kind: body.kind || 'News article',
      image: body.image || '/images/gallery-1.jpg',
      url: body.url?.trim() || undefined,
      excerpt: body.excerpt?.trim() || '',
    };

    const updated = [newItem, ...items];
    await writeStore('press', updated);
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
      return NextResponse.json({ error: 'Item ID is required for update' }, { status: 400 });
    }

    const items = await readStore<PressItem[]>('press');
    const index = items.findIndex((i) => i.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Press item not found' }, { status: 404 });
    }

    const updatedItem: PressItem = {
      ...items[index],
      ...body,
      id: items[index].id,
    };

    items[index] = updatedItem;
    await writeStore('press', items);
    revalidatePath('/');

    return NextResponse.json({ success: true, item: updatedItem, items });
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
      return NextResponse.json({ error: 'Press ID is required' }, { status: 400 });
    }

    const items = await readStore<PressItem[]>('press');
    const filtered = items.filter((i) => i.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await writeStore('press', filtered);
    revalidatePath('/');

    return NextResponse.json({ success: true, id, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
