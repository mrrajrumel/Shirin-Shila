import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { ShowreelItem } from '@/data/showreel';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const items = await readStore<ShowreelItem[]>('showreels');
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
    const items = await readStore<ShowreelItem[]>('showreels');

    const newItem: ShowreelItem = {
      id: body.id || `reel-${Date.now()}`,
      title: body.title?.trim() || 'Showreel Video',
      banglaTitle: body.banglaTitle?.trim() || undefined,
      category: body.category?.trim() || 'Performance Reel',
      duration: body.duration?.trim() || '3:00',
      youtubeId: body.youtubeId?.trim() || '',
      thumbnail: body.thumbnail?.trim() || '/images/gallery-3.jpg',
      year: body.year?.trim() || new Date().getFullYear().toString(),
      director: body.director?.trim() || undefined,
      coStar: body.coStar?.trim() || undefined,
      description: body.description?.trim() || '',
      sceneHighlight: body.sceneHighlight?.trim() || '',
    };

    const updated = [newItem, ...items];
    await writeStore('showreels', updated);
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
      return NextResponse.json({ error: 'Video ID is required for update' }, { status: 400 });
    }

    const items = await readStore<ShowreelItem[]>('showreels');
    const index = items.findIndex((i) => i.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Showreel not found' }, { status: 404 });
    }

    const updatedItem: ShowreelItem = {
      ...items[index],
      ...body,
      id: items[index].id,
    };

    items[index] = updatedItem;
    await writeStore('showreels', items);
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
      return NextResponse.json({ error: 'Showreel ID is required' }, { status: 400 });
    }

    const items = await readStore<ShowreelItem[]>('showreels');
    const filtered = items.filter((i) => i.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await writeStore('showreels', filtered);
    revalidatePath('/');

    return NextResponse.json({ success: true, id, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
