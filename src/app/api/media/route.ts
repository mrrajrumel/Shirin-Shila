import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import {
  getMediaManifest,
  uploadMediaAsset,
  checkMediaUsage,
  deleteMediaAsset,
  scanAndIndexExistingMedia,
} from '@/lib/media-service';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q')?.toLowerCase() || '';
    const folder = searchParams.get('folder') || '';

    let assets = await getMediaManifest();

    if (folder && folder !== 'all') {
      assets = assets.filter((a) => a.folder.toLowerCase() === folder.toLowerCase());
    }

    if (search) {
      assets = assets.filter(
        (a) =>
          a.filename.toLowerCase().includes(search) ||
          a.originalName.toLowerCase().includes(search) ||
          a.url.toLowerCase().includes(search)
      );
    }

    // Extract unique folders
    const allAssets = await getMediaManifest();
    const folders = Array.from(new Set(allAssets.map((a) => a.folder))).filter(Boolean);

    return NextResponse.json({
      success: true,
      assets,
      total: assets.length,
      folders: ['all', ...folders],
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
    const contentType = request.headers.get('content-type') || '';

    // Multipart upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'general';

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadMediaAsset({
        buffer,
        originalFilename: file.name,
        folder,
      });

      return NextResponse.json({
        success: true,
        asset: result.asset,
        isDuplicate: result.isDuplicate,
      });
    }

    // JSON action requests (check-usage, delete, reindex)
    const body = await request.json();
    const action = body.action;

    if (action === 'check-usage') {
      const { url } = body;
      if (!url) {
        return NextResponse.json({ error: 'Missing asset url' }, { status: 400 });
      }
      const references = await checkMediaUsage(url);
      return NextResponse.json({
        success: true,
        url,
        inUse: references.length > 0,
        references,
      });
    }

    if (action === 'delete') {
      const { id, force } = body;
      if (!id) {
        return NextResponse.json({ error: 'Missing media asset ID' }, { status: 400 });
      }
      const result = await deleteMediaAsset(id, Boolean(force));
      if (!result.success) {
        return NextResponse.json(result, { status: 409 });
      }
      return NextResponse.json(result);
    }

    if (action === 'reindex') {
      const assets = await scanAndIndexExistingMedia();
      return NextResponse.json({ success: true, count: assets.length });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

