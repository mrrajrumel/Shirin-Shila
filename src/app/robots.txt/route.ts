import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'cornflowerblue-wildcat-675604.hostingersite.com';
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  const robotsTxt = `# Robots.txt for Shirin Shila Portfolio
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Content-Signal Directive (AI & Agent Content Usage Policy)
Content-Signal: search=yes, ai-train=no

# Sitemap Directives
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: https://cornflowerblue-wildcat-675604.hostingersite.com/sitemap.xml
Sitemap: https://shirinshila.com/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
