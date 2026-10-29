import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { ProjectItem } from '@/data/filmography';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const items = await readStore<ProjectItem[]>('filmography');
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
    const items = await readStore<ProjectItem[]>('filmography');

    const newItem: ProjectItem = {
      id: body.id || `film-${Date.now()}`,
      title: body.title?.trim() || 'Untitled Project',
      banglaTitle: body.banglaTitle?.trim() || undefined,
      category: body.category || 'Film',
      year: body.year?.trim() || new Date().getFullYear().toString(),
      director: body.director?.trim() || undefined,
      coStar: body.coStar?.trim() || undefined,
      productionHouse: body.productionHouse?.trim() || undefined,
      role: body.role?.trim() || undefined,
      description: body.description?.trim() || '',
      image: body.image || '/images/poster-begum-jaan.jpg',
      featured: Boolean(body.featured),
      awards: body.awards?.trim() || undefined,
      status: body.status || 'Released',
    };

    const updated = [newItem, ...items];
    await writeStore('filmography', updated);
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
      return NextResponse.json({ error: 'Project ID is required for update' }, { status: 400 });
    }

    const items = await readStore<ProjectItem[]>('filmography');
    const index = items.findIndex((i) => i.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedItem: ProjectItem = {
      ...items[index],
      ...body,
      id: items[index].id, // preserve ID
    };

    items[index] = updatedItem;
    await writeStore('filmography', items);
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const items = await readStore<ProjectItem[]>('filmography');
    const filtered = items.filter((i) => i.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await writeStore('filmography', filtered);
    revalidatePath('/');

    return NextResponse.json({ success: true, id, items: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
