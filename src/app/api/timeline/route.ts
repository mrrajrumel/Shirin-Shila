import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore, TimelineStoreData } from '@/lib/server-storage';
import { JourneyItem } from '@/data/timeline';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const monthOrderMap: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

function sortOldestToNewest(items: JourneyItem[]): JourneyItem[] {
  return [...items].sort((a, b) => {
    const yearA = parseInt(a.year, 10) || 0;
    const yearB = parseInt(b.year, 10) || 0;
    if (yearA !== yearB) return yearA - yearB;
    const monthA = monthOrderMap[a.month] || 0;
    const monthB = monthOrderMap[b.month] || 0;
    return monthA - monthB;
  });
}

function splitAlternating(sorted: JourneyItem[]) {
  const top: JourneyItem[] = [];
  const bottom: JourneyItem[] = [];
  sorted.forEach((item, idx) => {
    if (idx % 2 === 0) {
      top.push(item);
    } else {
      bottom.push(item);
    }
  });
  return { top, bottom };
}

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET() {
  try {
    const store = await readStore<TimelineStoreData>('timeline');
    // Consolidate all items
    const rawItems: JourneyItem[] = [
      ...(Array.isArray(store.top) ? store.top : []),
      ...(Array.isArray(store.bottom) ? store.bottom : []),
    ];

    // De-duplicate by id if any duplicates exist
    const seen = new Set<string>();
    const uniqueItems: JourneyItem[] = [];
    for (const it of rawItems) {
      if (it && it.id && !seen.has(it.id)) {
        seen.add(it.id);
        uniqueItems.push(it);
      }
    }

    const sortedItems = sortOldestToNewest(uniqueItems);
    const { top, bottom } = splitAlternating(sortedItems);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: sortedItems,
          top,
          bottom,
          milestones: store.milestones || [],
        },
      },
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
    const store = await readStore<TimelineStoreData>('timeline');

    // Collect all existing items
    const rawItems: JourneyItem[] = [
      ...(Array.isArray(store.top) ? store.top : []),
      ...(Array.isArray(store.bottom) ? store.bottom : []),
    ];
    const seen = new Set<string>();
    let allItems: JourneyItem[] = [];
    for (const it of rawItems) {
      if (it && it.id && !seen.has(it.id)) {
        seen.add(it.id);
        allItems.push(it);
      }
    }

    const itemId =
      body.id ||
      `${body.year || '2026'}-${(body.month || 'january').toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newItem: JourneyItem = {
      id: itemId,
      year: body.year?.toString().trim() || '2026',
      month: body.month || 'January',
      title: body.title?.trim() || undefined,
      content: body.content?.trim() || 'Award & Honor milestone in Dhallywood cinema',
      image: body.image?.trim() || '/images/award-trophy-gala.jpg',
    };

    // If item already exists, update it, otherwise append
    const existingIndex = allItems.findIndex((it) => it.id === itemId);
    if (existingIndex >= 0) {
      allItems[existingIndex] = newItem;
    } else {
      allItems.push(newItem);
    }

    // Sort strictly from Oldest to Newest
    const sorted = sortOldestToNewest(allItems);
    const { top, bottom } = splitAlternating(sorted);

    store.top = top;
    store.bottom = bottom;

    await writeStore('timeline', store);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      item: newItem,
      data: {
        items: sorted,
        top,
        bottom,
        milestones: store.milestones,
      },
    });
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
    const store = await readStore<TimelineStoreData>('timeline');

    let allItems: JourneyItem[] = [];

    if (Array.isArray(body.items)) {
      // Direct list update / reordering
      allItems = body.items;
    } else if (body.id) {
      // Single item update
      const rawItems: JourneyItem[] = [
        ...(Array.isArray(store.top) ? store.top : []),
        ...(Array.isArray(store.bottom) ? store.bottom : []),
      ];
      const seen = new Set<string>();
      for (const it of rawItems) {
        if (it && it.id && !seen.has(it.id)) {
          seen.add(it.id);
          allItems.push(it);
        }
      }

      const idx = allItems.findIndex((it) => it.id === body.id);
      const updatedItem: JourneyItem = {
        id: body.id,
        year: body.year?.toString().trim() || '2026',
        month: body.month || 'January',
        title: body.title?.trim() || undefined,
        content: body.content?.trim() || 'Award & Honor milestone in Dhallywood cinema',
        image: body.image?.trim() || '/images/award-trophy-gala.jpg',
      };

      if (idx >= 0) {
        allItems[idx] = updatedItem;
      } else {
        allItems.push(updatedItem);
      }
    } else {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const sorted = sortOldestToNewest(allItems);
    const { top, bottom } = splitAlternating(sorted);

    store.top = top;
    store.bottom = bottom;

    await writeStore('timeline', store);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: {
        items: sorted,
        top,
        bottom,
        milestones: store.milestones,
      },
    });
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
    const rawItems: JourneyItem[] = [
      ...(Array.isArray(store.top) ? store.top : []),
      ...(Array.isArray(store.bottom) ? store.bottom : []),
    ];
    const seen = new Set<string>();
    const remaining: JourneyItem[] = [];
    for (const it of rawItems) {
      if (it && it.id && it.id !== id && !seen.has(it.id)) {
        seen.add(it.id);
        remaining.push(it);
      }
    }

    const sorted = sortOldestToNewest(remaining);
    const { top, bottom } = splitAlternating(sorted);

    store.top = top;
    store.bottom = bottom;

    await writeStore('timeline', store);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      id,
      data: {
        items: sorted,
        top,
        bottom,
        milestones: store.milestones,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
