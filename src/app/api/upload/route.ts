import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { uploadMediaAsset, MediaAsset } from '@/lib/media-service';

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
    const folder = (formData.get('folder') as string) || 'general';

    // Collect all files from formData (supports multiple fields: 'files', 'file', or array inputs)
    const rawFiles: File[] = [];
    const filesList = formData.getAll('files');
    const singleFileList = formData.getAll('file');

    for (const f of [...filesList, ...singleFileList]) {
      if (f && typeof f === 'object' && 'arrayBuffer' in f && (f as File).size > 0) {
        rawFiles.push(f as File);
      }
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    const maxSize = 25 * 1024 * 1024; // 25MB per file
    const processedFiles: Array<{
      url: string;
      asset: MediaAsset;
      isDuplicate: boolean;
      filename: string;
      size: number;
    }> = [];

    const errors: Array<{ filename: string; error: string }> = [];

    for (const file of rawFiles) {
      if (file.size > maxSize) {
        errors.push({
          filename: file.name,
          error: `File exceeds 25MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        });
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await uploadMediaAsset({
          buffer,
          originalFilename: file.name || 'image.jpg',
          folder,
        });

        processedFiles.push({
          url: uploadResult.asset.url,
          asset: uploadResult.asset,
          isDuplicate: uploadResult.isDuplicate,
          filename: file.name,
          size: file.size,
        });
      } catch (err: any) {
        errors.push({ filename: file.name, error: err.message || 'Upload processing failed' });
      }
    }

    if (processedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: errors.map((e) => `${e.filename}: ${e.error}`).join('; '),
          errors,
        },
        { status: 400 }
      );
    }

    const primary = processedFiles[0];

    return NextResponse.json({
      success: true,
      url: primary?.url,
      asset: primary?.asset,
      isDuplicate: primary?.isDuplicate,
      files: processedFiles,
      count: processedFiles.length,
      errors: errors.length > 0 ? errors : undefined,
      message:
        processedFiles.length === 1
          ? primary.isDuplicate
            ? 'Identical image found in library; reused existing asset.'
            : 'File uploaded and indexed successfully.'
          : `Successfully processed ${processedFiles.length} file(s).${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
    });
  } catch (err: any) {
    console.error('[Upload API] Error processing file:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload asset' },
      { status: 500 }
    );
  }
}
