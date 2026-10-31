import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { SESSION_COOKIE_NAME, verifySessionToken, hasMinimumRole } from '@/lib/auth';
import { getPersistentStoreDir, getPersistentBackupsDir } from '@/lib/persistent-paths';
import { readStore, writeStore, StoreKey } from '@/lib/server-storage';
import { getMediaManifest, saveMediaManifest, MediaAsset } from '@/lib/media-service';

export const dynamic = 'force-dynamic';

const KNOWN_STORE_FILES = [
  'hero.json',
  'about.json',
  'filmography.json',
  'gallery.json',
  'timeline.json',
  'press.json',
  'mediaPartners.json',
  'contactInfo.json',
  'seo.json',
  'showreels.json',
  'inquiries.json',
  'media-manifest.json',
];

/**
 * GET: Export full data backup
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasMinimumRole(user, 'admin')) {
    return NextResponse.json(
      { error: 'Forbidden. Admin role required for backup export.' },
      { status: 403 }
    );
  }

  try {
    const backupBundle: Record<string, any> = {};

    for (const filename of KNOWN_STORE_FILES) {
      const key = filename.replace(/\.json$/, '');
      let content = null;
      try {
        if (key === 'media-manifest') {
          content = await getMediaManifest();
        } else {
          content = await readStore(key as StoreKey);
        }
      } catch (readErr) {
        console.error(`[Backup Export] Error reading ${key}:`, readErr);
      }
      backupBundle[key] = content;
    }

    const payload = {
      meta: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        site: 'Shirin Shila Official Portfolio',
        totalSections: Object.keys(backupBundle).length,
      },
      data: backupBundle,
    };

    const isDownload = request.nextUrl.searchParams.get('download') === 'true';
    const jsonStr = JSON.stringify(payload, null, 2);

    if (isDownload) {
      const dateTag = new Date().toISOString().slice(0, 10);
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="shirin-shila-backup-${dateTag}.json"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err: any) {
    console.error('[Backup] Export failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST: Create manual snapshot or restore from backup JSON
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasMinimumRole(user, 'admin')) {
    return NextResponse.json(
      { error: 'Forbidden. Admin role required for backup operations.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'restore';
    const storeDir = getPersistentStoreDir();
    const backupsDir = getPersistentBackupsDir();

    // 1. Create safety snapshot of current persistent store
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotName = `snapshot-${timestamp}.json`;
    const snapshotPath = path.join(backupsDir, snapshotName);

    const currentFiles = fs.existsSync(storeDir) ? await fs.promises.readdir(storeDir) : [];
    const snapshotData: Record<string, any> = {};

    for (const file of currentFiles) {
      if (file.endsWith('.json')) {
        try {
          const content = JSON.parse(await fs.promises.readFile(path.join(storeDir, file), 'utf-8'));
          snapshotData[file.replace(/\.json$/, '')] = content;
        } catch (_) {}
      }
    }

    await fs.promises.writeFile(
      snapshotPath,
      JSON.stringify(
        {
          meta: { created: new Date().toISOString(), trigger: action },
          data: snapshotData,
        },
        null,
        2
      )
    );

    if (action === 'create_snapshot') {
      return NextResponse.json({
        success: true,
        message: `Snapshot created successfully: ${snapshotName}`,
        snapshot: snapshotName,
      });
    }

    // 2. Restore action
    if (action === 'restore') {
      const dataToRestore = body.data || body.backupData;
      if (!dataToRestore || typeof dataToRestore !== 'object') {
        return NextResponse.json({ error: 'Invalid backup payload: missing data object' }, { status: 400 });
      }

      const restoredKeys: string[] = [];
      const allowedKeys = new Set(KNOWN_STORE_FILES.map((f) => f.replace(/\.json$/, '')));

      for (const [key, value] of Object.entries(dataToRestore)) {
        if (!allowedKeys.has(key)) continue;
        if (!value || typeof value !== 'object') continue;

        try {
          if (key === 'media-manifest' && Array.isArray(value)) {
            await saveMediaManifest(value as MediaAsset[]);
          } else {
            await writeStore(key as StoreKey, value, true);
          }
          restoredKeys.push(key);
        } catch (restoreErr) {
          console.error(`[Backup Restore] Error restoring section ${key}:`, restoreErr);
        }
      }

      try {
        revalidatePath('/', 'layout');
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Successfully restored ${restoredKeys.length} data section(s).`,
        safetySnapshot: snapshotName,
        restoredKeys,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Backup] POST error:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
