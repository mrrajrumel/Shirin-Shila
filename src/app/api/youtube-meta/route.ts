import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { downloadAndRegisterMedia } from '@/lib/media-service';

export const dynamic = 'force-dynamic';

function extractYoutubeId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (paths[0] === 'embed' || paths[0] === 'v' || paths[0] === 'shorts') {
        return paths[1] || null;
      }
    } else if (parsed.hostname === 'youtu.be') {
      const paths = parsed.pathname.split('/').filter(Boolean);
      return paths[0] || null;
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) return match[1];
  }

  return null;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') || searchParams.get('id');

  if (!input) {
    return NextResponse.json({ error: 'URL or Video ID parameter is required' }, { status: 400 });
  }

  const videoId = extractYoutubeId(input);
  if (!videoId) {
    return NextResponse.json({ error: 'Could not detect a valid YouTube video ID from the provided link' }, { status: 400 });
  }

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const res = await fetch(oembedUrl, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShirinShilaPortfolio/1.0)',
      },
    });

    let title = 'YouTube Performance Video';
    let author = 'Dhallywood Media';

    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      author = data.author_name || author;
    }

    const maxresThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const hqThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Automatically download and register in Central Media Library & Asset Registry
    let registeredThumb = await downloadAndRegisterMedia({
      url: maxresThumbnail,
      fallbackName: `youtube-${videoId}-cover`,
      folder: 'showreels',
    });

    // If maxres was not available on YouTube (returned external url unchanged or failed), try HQ thumbnail
    if (registeredThumb === maxresThumbnail) {
      registeredThumb = await downloadAndRegisterMedia({
        url: hqThumbnail,
        fallbackName: `youtube-${videoId}-cover`,
        folder: 'showreels',
      });
    }

    return NextResponse.json({
      success: true,
      videoId,
      title,
      author,
      thumbnail: registeredThumb,
      fallbackThumbnail: registeredThumb,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      youtubeUrl: targetUrl,
    });
  } catch (err: any) {
    const fallbackThumb = await downloadAndRegisterMedia({
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      fallbackName: `youtube-${videoId}-cover`,
      folder: 'showreels',
    });

    return NextResponse.json({
      success: true,
      videoId,
      title: 'YouTube Video Reel',
      author: 'Dhallywood Media',
      thumbnail: fallbackThumb,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      youtubeUrl: targetUrl,
    });
  }
}
