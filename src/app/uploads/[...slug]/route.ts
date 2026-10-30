import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPersistentUploadsDir } from '@/lib/persistent-paths';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || !Array.isArray(slug) || slug.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Sanitize slug segments to prevent path traversal
    for (const segment of slug) {
      if (segment === '..' || segment === '.' || segment.includes('\\') || segment.includes('/')) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const relPath = path.join(...slug);
    const persistentDir = getPersistentUploadsDir();
    const targetFile = path.resolve(persistentDir, relPath);

    // Ensure within target directory
    if (!targetFile.startsWith(persistentDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Try persistent uploads first, fallback to public/uploads
    let finalPath = targetFile;
    if (!fs.existsSync(finalPath)) {
      const fallbackPath = path.resolve(process.cwd(), 'public', 'uploads', relPath);
      if (fallbackPath.startsWith(path.resolve(process.cwd(), 'public', 'uploads')) && fs.existsSync(fallbackPath)) {
        finalPath = fallbackPath;
      } else {
        return new NextResponse('Asset not found', { status: 404 });
      }
    }

    const stat = await fs.promises.stat(finalPath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 404 });
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(finalPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[UploadsRoute] Error serving asset:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

