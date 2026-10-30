import { NextResponse } from 'next/server';
import { resolveCanonicalSiteUrl, getContentSignal } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const [baseUrl, contentSignal] = await Promise.all([
    resolveCanonicalSiteUrl(),
    getContentSignal(),
  ]);

  const robotsTxt = `# Robots.txt for Shirin Shila Portfolio
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Content-Signal Directive (AI & Agent Content Usage Policy)
Content-Signal: ${contentSignal}

# Sitemap Directives
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
