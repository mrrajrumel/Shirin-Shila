import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { GalleryImage } from '@/data/gallery';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const items = await readStore<GalleryImage[]>('gallery');
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
    const items = await readStore<GalleryImage[]>('gallery');

    const newItem: GalleryImage = {
      src: body.src || '/images/award-diff-stage.jpg',
      label: body.label?.trim() || 'Film Honors & Recognition',
      category: body.category?.trim() || 'Awards & Honors',
      year: body.year?.trim() || new Date().getFullYear().toString(),
    };

    const updated = [newItem, ...items];
    await writeStore('gallery', updated);
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
    const { index, item } = body;

    const items = await readStore<GalleryImage[]>('gallery');
    if (index === undefined || index < 0 || index >= items.length) {
      return NextResponse.json({ error: 'Invalid gallery item index' }, { status: 400 });
    }

    items[index] = {
      ...items[index],
      ...item,
    };

    await writeStore('gallery', items);
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
    const indexStr = searchParams.get('index');
    const src = searchParams.get('src');

    const items = await readStore<GalleryImage[]>('gallery');
    let filtered: GalleryImage[];

    if (indexStr !== null) {
      const idx = parseInt(indexStr, 10);
      filtered = items.filter((_, i) => i !== idx);
    } else if (src) {
      filtered = items.filter((i) => i.src !== src);
    } else {
      return NextResponse.json({ error: 'Index or image src is required for deletion' }, { status: 400 });
    }

    await writeStore('gallery', filtered);
    revalidatePath('/');

    return NextResponse.json({ success: true, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
