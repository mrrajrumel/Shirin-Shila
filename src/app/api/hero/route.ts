import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { HeroProfile } from '@/data/hero';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  try {
    const hero = await readStore<HeroProfile>('hero');
    return NextResponse.json({ success: true, hero }, {
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
    const current = await readStore<HeroProfile>('hero');

    const updated: HeroProfile = {
      ...current,
      name: body.name?.trim() || current.name,
      eyebrow: body.eyebrow?.trim() || current.eyebrow,
      roles: body.roles?.trim() || current.roles,
      intro: body.intro?.trim() || current.intro,
      image: body.image?.trim() || current.image,
      imageAlt: body.imageAlt?.trim() || current.imageAlt,
      primaryCta: {
        label: body.primaryCta?.label?.trim() || current.primaryCta.label,
        href: body.primaryCta?.href?.trim() || current.primaryCta.href,
      },
      secondaryCta: {
        label: body.secondaryCta?.label?.trim() || current.secondaryCta.label,
        href: body.secondaryCta?.href?.trim() || current.secondaryCta.href,
      },
      scrollIndicatorText: body.scrollIndicatorText?.trim() || current.scrollIndicatorText,
    };

    await writeStore('hero', updated);
    revalidatePath('/');

    return NextResponse.json({ success: true, hero: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
