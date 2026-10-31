import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData, defaultFooterLinks, FooterLinkItem } from '@/data/seo';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { normalizeOrigin } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET() {
  try {
    const seo = await readStore<SiteSeoData>('seo');
    const rawLinks =
      seo?.footerLinks && Array.isArray(seo.footerLinks) && seo.footerLinks.length > 0
        ? seo.footerLinks
        : defaultFooterLinks;

    // Filter out obsolete About and Contact links from footer
    const cleanFooterLinks = rawLinks.filter(
      (l: any) =>
        l.id !== 'about' &&
        l.id !== 'contact' &&
        l.href !== '/about' &&
        l.href !== '/contact' &&
        l.href !== '/#about' &&
        l.href !== '/#contact'
    );

    const merged: SiteSeoData = {
      ...defaultSeoData,
      ...(seo || {}),
      footerLinks: cleanFooterLinks,
    };

    return NextResponse.json(
      { success: true, seo: merged },
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

    // Validate and sanitize footer links if provided
    let updatedFooterLinks: FooterLinkItem[] = current.footerLinks || defaultFooterLinks;
    if (body.footerLinks && Array.isArray(body.footerLinks)) {
      updatedFooterLinks = body.footerLinks
        .filter((link: any) => link && typeof link.label === 'string' && typeof link.href === 'string')
        .filter(
          (l: any) =>
            l.id !== 'about' &&
            l.id !== 'contact' &&
            l.href !== '/about' &&
            l.href !== '/contact' &&
            l.href !== '/#about' &&
            l.href !== '/#contact'
        )
        .map((link: any, index: number) => ({
          id: String(link.id || `link-${index}`),
          label: String(link.label).trim(),
          href: String(link.href).trim(),
          isVisible: link.isVisible !== false,
          order: typeof link.order === 'number' ? link.order : index + 1,
        }));
    }

    const updated: SiteSeoData = {
      ...current,
      siteTitle: body.siteTitle !== undefined ? body.siteTitle.trim() : current.siteTitle,
      tagline: body.tagline !== undefined ? body.tagline.trim() : current.tagline,
      description: body.description !== undefined ? body.description.trim() : current.description,
      keywords: body.keywords !== undefined ? body.keywords.trim() : current.keywords,
      author: body.author !== undefined ? body.author.trim() : current.author,
      siteUrl:
        body.siteUrl !== undefined && body.siteUrl.trim()
          ? normalizeOrigin(body.siteUrl.trim())
          : current.siteUrl || '',
      ogTitle: body.ogTitle !== undefined ? body.ogTitle.trim() : current.ogTitle,
      ogDescription: body.ogDescription !== undefined ? body.ogDescription.trim() : current.ogDescription,
      ogImage: body.ogImage !== undefined ? body.ogImage.trim() : current.ogImage,
      twitterHandle: body.twitterHandle !== undefined ? body.twitterHandle.trim() : current.twitterHandle,
      faviconUrl: body.faviconUrl !== undefined ? body.faviconUrl.trim() : current.faviconUrl,
      appleTouchIconUrl: body.appleTouchIconUrl !== undefined ? body.appleTouchIconUrl.trim() : current.appleTouchIconUrl,
      customHeadHtml: body.customHeadHtml !== undefined ? body.customHeadHtml : current.customHeadHtml,
      contentSignal:
        body.contentSignal !== undefined && body.contentSignal.trim()
          ? body.contentSignal.trim()
          : current.contentSignal || 'search=yes, ai-train=no',
      llmsSummary:
        body.llmsSummary !== undefined ? body.llmsSummary.trim() : current.llmsSummary || '',
      footerLinks: updatedFooterLinks,
    };

    await writeStore('seo', updated);

    // Revalidate paths affected by SEO and metadata updates
    revalidatePath('/');
    revalidatePath('/terms');
    revalidatePath('/privacy');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
    revalidatePath('/llms.txt');

    return NextResponse.json({ success: true, seo: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
