import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore, TimelineStoreData } from '@/lib/server-storage';
import { JourneyItem } from '@/data/timeline';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const data = await readStore<TimelineStoreData>('timeline');
    return NextResponse.json({ success: true, data }, {
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
    const store = await readStore<TimelineStoreData>('timeline');
    const track = body.track === 'bottom' ? 'bottom' : 'top';

    const newItem: JourneyItem = {
      id: body.id || `${body.year || '2026'}-${(body.month || 'january').toLowerCase()}-${Date.now().toString().slice(-4)}`,
      year: body.year?.trim() || '2026',
      month: body.month || 'January',
      title: body.title?.trim() || undefined,
      content: body.content?.trim() || 'Award & Honor milestone in Dhallywood cinema',
      image: body.image?.trim() || '/images/award-trophy-gala.jpg',
    };

    if (track === 'bottom') {
      store.bottom = [newItem, ...store.bottom];
    } else {
      store.top = [newItem, ...store.top];
    }

    await writeStore('timeline', store);
    revalidatePath('/');

    return NextResponse.json({ success: true, item: newItem, data: store });
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
      return NextResponse.json({ error: 'Milestone ID is required' }, { status: 400 });
    }

    const store = await readStore<TimelineStoreData>('timeline');
    store.top = store.top.filter((i) => i.id !== id);
    store.bottom = store.bottom.filter((i) => i.id !== id);

    await writeStore('timeline', store);
    revalidatePath('/');

    return NextResponse.json({ success: true, id, data: store });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
