import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { uploadMediaAsset } from '@/lib/media-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Session verification
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit size: 15MB
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 15MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadMediaAsset({
      buffer,
      originalFilename: file.name || 'image.jpg',
      folder,
    });

    return NextResponse.json({
      success: true,
      url: result.asset.url,
      asset: result.asset,
      isDuplicate: result.isDuplicate,
      message: result.isDuplicate
        ? 'Identical image found in library; reused existing asset.'
        : 'File uploaded and indexed successfully.',
    });
  } catch (err: any) {
    console.error('[Upload API] Error processing file:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload asset' },
      { status: 500 }
    );
  }
}
