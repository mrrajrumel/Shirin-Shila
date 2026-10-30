import { NextResponse } from 'next/server';
import { readStore } from '@/lib/server-storage';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic route responds immediately to CMS publication status toggle

export async function GET() {
  const pages = (await readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry)) || defaultPagesRegistry;

  const llmsPage = pages.llms || defaultPagesRegistry.llms;
  const siteUrl = await resolveCanonicalSiteUrl();

  // If approved content exists in CMS, dynamically inject the verified siteUrl if placeholders or template tokens exist
  let content = (llmsPage && llmsPage.content) ? llmsPage.content : defaultPagesRegistry.llms.content;
  if (content.includes('{siteUrl}')) {
    content = content.replace(/\{siteUrl\}/g, siteUrl);
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
    },
  });
}
