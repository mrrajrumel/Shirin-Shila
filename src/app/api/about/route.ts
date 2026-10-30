import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET() {
  try {
    const about = await readStore<any>('about');
    return NextResponse.json({ success: true, about }, {
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
    const current = await readStore<any>('about');

    const updated = {
      ...current,
      meta: {
        ...current.meta,
        ...(body.meta || {}),
      },
      biography: {
        ...current.biography,
        heading: body.biography?.heading || current.biography.heading,
        paragraphs: Array.isArray(body.biography?.paragraphs)
          ? body.biography.paragraphs
          : current.biography.paragraphs,
      },
      profileFacts: Array.isArray(body.profileFacts)
        ? body.profileFacts
        : current.profileFacts,
      prestigeMilestones: Array.isArray(body.prestigeMilestones)
        ? body.prestigeMilestones.map((item: any, i: number) => ({
            id: item.id || `milestone-${i + 1}`,
            title: item.title?.trim() || '',
            subtitle: item.subtitle?.trim() || '',
            icon: item.icon?.trim() || 'award',
          }))
        : (current.prestigeMilestones || []),
      compCardData: {
        ...current.compCardData,
        ...(body.compCardData || {}),
      },
    };

    await writeStore('about', updated);
    revalidatePath('/');

    return NextResponse.json({ success: true, about: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
