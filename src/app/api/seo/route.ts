import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET() {
  try {
    const seo = await readStore<SiteSeoData>('seo');
    return NextResponse.json(
      { success: true, seo: seo || defaultSeoData },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
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
    const current = (await readStore<SiteSeoData>('seo')) || defaultSeoData;

    const updated: SiteSeoData = {
      ...current,
      siteTitle: body.siteTitle !== undefined ? body.siteTitle.trim() : current.siteTitle,
      tagline: body.tagline !== undefined ? body.tagline.trim() : current.tagline,
      description: body.description !== undefined ? body.description.trim() : current.description,
      keywords: body.keywords !== undefined ? body.keywords.trim() : current.keywords,
      author: body.author !== undefined ? body.author.trim() : current.author,
      siteUrl: body.siteUrl !== undefined ? body.siteUrl.trim() : current.siteUrl,
      ogTitle: body.ogTitle !== undefined ? body.ogTitle.trim() : current.ogTitle,
      ogDescription: body.ogDescription !== undefined ? body.ogDescription.trim() : current.ogDescription,
      ogImage: body.ogImage !== undefined ? body.ogImage.trim() : current.ogImage,
      twitterHandle: body.twitterHandle !== undefined ? body.twitterHandle.trim() : current.twitterHandle,
      faviconUrl: body.faviconUrl !== undefined ? body.faviconUrl.trim() : current.faviconUrl,
      appleTouchIconUrl: body.appleTouchIconUrl !== undefined ? body.appleTouchIconUrl.trim() : current.appleTouchIconUrl,
      customHeadHtml: body.customHeadHtml !== undefined ? body.customHeadHtml : current.customHeadHtml,
    };

    await writeStore('seo', updated);
    revalidatePath('/');

    return NextResponse.json({ success: true, seo: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

