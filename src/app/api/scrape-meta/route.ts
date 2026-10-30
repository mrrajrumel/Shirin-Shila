import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function cleanHtmlText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaTag(html: string, property: string): string | null {
  // Try property="..." content="..."
  const propRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["'](?:og:|twitter:|article:)?${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  let match = html.match(propRegex);
  if (match && match[1]) return match[1];

  // Try content="..." property="..."
  const contentFirstRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:|article:)?${property}["']`,
    'i'
  );
  match = html.match(contentFirstRegex);
  if (match && match[1]) return match[1];

  return null;
}

// Convert slug like 'shirin-shila-wins-award-at-dhaka-fest' into Title Case
function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawInput = searchParams.get('url') || searchParams.get('q');

  if (!rawInput || !rawInput.trim()) {
    return NextResponse.json({ error: 'Search keyword or news URL is required' }, { status: 400 });
  }

  const input = rawInput.trim();

  // Check if input is a direct URL or keyword search
  const isUrl =
    /^(https?:\/\/)/i.test(input) ||
    (!/\s/.test(input) && /\.[a-z]{2,}(\/.*)?$/i.test(input));

  // Case 1: KEYWORD SEARCH (user typed a word, phrase, topic, etc.)
  if (!isUrl) {
    try {
      const googleRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        input
      )}&hl=en-BD&gl=BD&ceid=BD:en`;

      const rssRes = await fetch(googleRssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(7000),
      });

      if (rssRes.ok) {
        const xml = await rssRes.text();
        const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);

        if (itemMatch && itemMatch[1]) {
          const itemXml = itemMatch[1];
          const rawTitle = (itemXml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || input;
          const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
          const pubDate = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1];
          const rawSource = (itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1];

          let cleanTitle = cleanHtmlText(rawTitle);
          let publisher = rawSource ? cleanHtmlText(rawSource) : 'News Media';

          // If title contains " - Publisher", trim it
          if (cleanTitle.includes(' - ')) {
            const parts = cleanTitle.split(' - ');
            const lastPart = parts.pop()?.trim();
            cleanTitle = parts.join(' - ').trim();
            if (!rawSource && lastPart) publisher = lastPart;
          }

          let formattedDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });

          if (pubDate) {
            try {
              const d = new Date(pubDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
              }
            } catch {}
          }

          return NextResponse.json(
            {
              success: true,
              title: cleanTitle,
              publisher,
              image: '/images/gallery-1.jpg',
              date: formattedDate,
              description: `News coverage regarding ${input}.`,
              url: link || `https://news.google.com/search?q=${encodeURIComponent(input)}`,
            },
            {
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
              },
            }
          );
        }
      }
    } catch (searchErr) {
      console.warn('[Scrape API] RSS keyword search failed, using fallback:', searchErr);
    }

    // Graceful fallback for keyword search
    return NextResponse.json(
      {
        success: true,
        title: slugToTitle(input),
        publisher: 'Daily Media',
        image: '/images/gallery-1.jpg',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        description: `Featured media story regarding ${input}.`,
        url: '',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  // Case 2: DIRECT URL INPUT (news portals, blogs, youtube, etc.)
  try {
    const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
    const host = urlObj.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return NextResponse.json({ error: 'Requests to private network addresses are prohibited' }, { status: 400 });
    }

    // If it's a YouTube link pasted into Press
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(urlObj.toString())}&format=json`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const ytData = await oembedRes.json();
          return NextResponse.json(
            {
              success: true,
              title: ytData.title || 'YouTube Media Coverage',
              publisher: ytData.author_name || 'YouTube Video',
              image: ytData.thumbnail_url || '/images/gallery-1.jpg',
              date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
              description: `Video feature and interview covering Shirin Shila.`,
              url: urlObj.toString(),
            },
            {
              headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
            }
          );
        }
      } catch {}
    }

    // Regular news website scrape
    let res: Response | null = null;
    try {
      res = await fetch(urlObj.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (fetchErr) {
      console.warn('[Scrape API] Direct fetch aborted or failed:', fetchErr);
    }

    if (!res || !res.ok) {
      // Derive clean title from URL pathname slug
      const slugParts = urlObj.pathname.split('/').filter(Boolean);
      const lastSlug = slugParts.length > 0 ? slugParts[slugParts.length - 1] : 'News Article';
      const cleanSlug = lastSlug.replace(/\.(html?|php|asp)$/i, '');

      const host = urlObj.hostname.replace(/^www\./, '');
      const domainName = host.split('.')[0];
      const publisher = domainName.charAt(0).toUpperCase() + domainName.slice(1);

      return NextResponse.json(
        {
          success: true,
          title: slugToTitle(cleanSlug),
          publisher,
          image: '/images/gallery-1.jpg',
          date: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          description: `Article published on ${publisher}.`,
          url: urlObj.toString(),
        },
        {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        }
      );
    }

    const html = await res.text();

    // 1. Title
    let title = extractMetaTag(html, 'title');
    if (!title) {
      const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleTag && titleTag[1]) {
        title = titleTag[1];
      }
    }
    if (title) title = cleanHtmlText(title);

    // 2. Publisher / Site Name
    let publisher = extractMetaTag(html, 'site_name');
    if (!publisher) {
      const host = urlObj.hostname.replace(/^www\./, '');
      const domainParts = host.split('.')[0];
      publisher = domainParts.charAt(0).toUpperCase() + domainParts.slice(1);
    } else {
      publisher = cleanHtmlText(publisher);
    }

    // 3. Image
    let image =
      extractMetaTag(html, 'image') ||
      extractMetaTag(html, 'twitter:image') ||
      extractMetaTag(html, 'thumbnail');

    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, urlObj.origin).toString();
      } catch {
        image = '/images/gallery-1.jpg';
      }
    }

    // 4. Date
    let date =
      extractMetaTag(html, 'published_time') ||
      extractMetaTag(html, 'date') ||
      extractMetaTag(html, 'pubdate');

    if (!date) {
      const timeTag = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
      if (timeTag && timeTag[1]) {
        date = timeTag[1];
      }
    }

    if (date) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
        }
      } catch {}
    } else {
      date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }

    // 5. Description
    let description = extractMetaTag(html, 'description');
    if (description) description = cleanHtmlText(description);

    return NextResponse.json(
      {
        success: true,
        title: title || 'News Article Headline',
        publisher: publisher || 'News Media',
        image: image || '/images/gallery-1.jpg',
        date,
        description: description || '',
        url: urlObj.toString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('[Scrape API] Error scraping metadata:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to auto-fetch article metadata' },
      { status: 500 }
    );
  }
}
