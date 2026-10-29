import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Guard with session
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Limit size: 12MB
    const maxSize = 12 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum image size is 12MB.' },
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe file name
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName) || '.jpg';
    const rawName = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const filename = `${rawName || 'upload'}-${Date.now()}${ext.toLowerCase()}`;
    const targetPath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(targetPath, buffer);

    const publicUrl = `/uploads/${sanitizedFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (err: any) {
    console.error('[Upload API] Error saving file:', err);
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
