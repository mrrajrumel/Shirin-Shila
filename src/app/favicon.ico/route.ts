import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData } from '@/data/seo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const seo = (await readStore<SiteSeoData>('seo').catch(() => defaultSeoData)) || defaultSeoData;

    // If a custom favicon URL is configured (e.g. uploaded via Admin SEO)
    if (seo.faviconUrl && seo.faviconUrl.trim() && seo.faviconUrl !== '/favicon.ico') {
      const targetUrl = seo.faviconUrl.trim();
      const redirectUrl = targetUrl.startsWith('http')
        ? targetUrl
        : new URL(targetUrl, request.url).toString();

      return NextResponse.redirect(redirectUrl, {
        status: 302,
        headers: {
          'Cache-Control': 'no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Default fallback to public/favicon.ico or public/icon.svg
    const publicIcoPath = path.join(process.cwd(), 'public', 'favicon.ico');
    if (fs.existsSync(publicIcoPath)) {
      const buffer = await fs.promises.readFile(publicIcoPath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const publicSvgPath = path.join(process.cwd(), 'public', 'icon.svg');
    if (fs.existsSync(publicSvgPath)) {
      const svg = await fs.promises.readFile(publicSvgPath, 'utf-8');
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (err: any) {
    return new NextResponse(null, { status: 500 });
  }
}

