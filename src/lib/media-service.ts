import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getPersistentStoreDir, getPersistentUploadsDir } from './persistent-paths';
import { getDbContent, saveDbContent, isDatabaseConfigured } from './db';

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  hash: string;
  folder: string;
  uploadedAt: string;
  width?: number;
  height?: number;
}

export interface MediaUsageReference {
  section: string;
  identifier: string;
  label: string;
  field: string;
}

export function getManifestPath(): string {
  return path.join(getPersistentStoreDir(), 'media-manifest.json');
}

export function getUploadsDir(): string {
  return getPersistentUploadsDir();
}

const IMAGES_ROOT = path.join(process.cwd(), 'public', 'images');

function ensureDirectories() {
  const storeDir = getPersistentStoreDir();
  const uploadsDir = getPersistentUploadsDir();
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

/**
 * Validates file buffer by checking file magic byte signatures.
 * Rejects executables, scripts, or disguised malicious files.
 */
export function validateFileSignature(
  buffer: Buffer,
  filename: string
): { valid: boolean; mimeType: string; error?: string } {
  const ext = path.extname(filename).toLowerCase();

  // Need at least 12 bytes to inspect magic numbers
  if (buffer.length < 12) {
    return { valid: false, mimeType: '', error: 'File is empty or too small' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png' };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, mimeType: 'image/gif' };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  // SVG: Check text XML / svg and scan for dangerous tags
  if (ext === '.svg') {
    const text = buffer.toString('utf-8').toLowerCase();
    if (text.includes('<svg') || text.includes('<?xml')) {
      // Disallow executable scripts or event handlers in SVG
      if (
        text.includes('<script') ||
        text.includes('javascript:') ||
        text.includes('onload=') ||
        text.includes('onerror=')
      ) {
        return {
          valid: false,
          mimeType: 'image/svg+xml',
          error: 'SVG contains disallowed executable scripts or event handlers',
        };
      }
      return { valid: true, mimeType: 'image/svg+xml' };
    }
  }

  // Allowed extensions if magic check had fallback
  if (['.jpg', '.jpeg'].includes(ext) && buffer.length > 50) {
    return { valid: true, mimeType: 'image/jpeg' };
  }
  if (ext === '.png' && buffer.length > 50) {
    return { valid: true, mimeType: 'image/png' };
  }
  if (ext === '.webp' && buffer.length > 50) {
    return { valid: true, mimeType: 'image/webp' };
  }

  return {
    valid: false,
    mimeType: 'application/octet-stream',
    error: 'Unsupported or invalid file signature. Allowed: JPEG, PNG, WebP, GIF, safe SVG.',
  };
}

/**
 * Reads canonical media manifest. If empty or absent, auto-indexes existing media assets.
 */
export async function getMediaManifest(): Promise<MediaAsset[]> {
  ensureDirectories();

  // 1. Primary: Hostinger MySQL check if configured
  if (isDatabaseConfigured()) {
    try {
      const dbManifest = await getDbContent<MediaAsset[]>('media-manifest');
      if (Array.isArray(dbManifest) && dbManifest.length > 0) {
        return dbManifest;
      }
    } catch (e) {
      console.warn('[MediaService] DB manifest fetch failed, falling back to disk:', (e as Error).message);
    }
  }

  const manifestPath = getManifestPath();

  if (fs.existsSync(manifestPath)) {
    try {
      const raw = await fs.promises.readFile(manifestPath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        if (isDatabaseConfigured()) {
          saveDbContent('media-manifest', data, 'initial_file_sync').catch(() => {});
        }
        return data;
      }
    } catch (err) {
      console.error('[MediaService] Error reading manifest:', err);
    }
  }

  // Check if repository seed manifest exists
  const seedManifest = path.join(process.cwd(), 'src', 'data', 'store', 'media-manifest.json');
  if (fs.existsSync(seedManifest)) {
    try {
      const raw = await fs.promises.readFile(seedManifest, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        await saveMediaManifest(data);
        return data;
      }
    } catch {}
  }

  // First-time or empty manifest -> auto-index existing files
  return await scanAndIndexExistingMedia();
}

/**
 * Saves media manifest atomically to disk and Hostinger MySQL database.
 */
export async function saveMediaManifest(manifest: MediaAsset[]): Promise<void> {
  ensureDirectories();
  const manifestPath = getManifestPath();
  const tempPath = `${manifestPath}.tmp.${Date.now()}`;
  const serialized = JSON.stringify(manifest, null, 2);

  try {
    await fs.promises.writeFile(tempPath, serialized, 'utf-8');
    await fs.promises.rename(tempPath, manifestPath);
  } catch (err) {
    console.error('[MediaService] Temp rename failed, direct write fallback:', err);
    await fs.promises.writeFile(manifestPath, serialized, 'utf-8');
  }

  // Persist to Hostinger MySQL
  if (isDatabaseConfigured()) {
    try {
      await saveDbContent('media-manifest', manifest, 'media_manifest_update');
    } catch (dbErr) {
      console.error('[MediaService] MySQL save manifest error:', (dbErr as Error).message);
    }
  }
}

/**
 * Scans uploads and public/images to build an initial canonical manifest.
 */
export async function scanAndIndexExistingMedia(): Promise<MediaAsset[]> {
  ensureDirectories();
  const assets: MediaAsset[] = [];
  const seenHashes = new Set<string>();
  const uploadsRoot = getUploadsDir();

  const scanDir = (dir: string, baseFolder: string, urlPrefix: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, entry.name, `${urlPrefix}/${entry.name}`);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
          try {
            const buf = fs.readFileSync(fullPath);
            const hash = crypto.createHash('sha256').update(buf).digest('hex');
            const relUrl = `${urlPrefix}/${entry.name}`.replace(/\\/g, '/');

            // Even if same hash exists across folders, index the first canonical record
            if (!seenHashes.has(hash)) {
              seenHashes.add(hash);
              let mime = 'image/jpeg';
              if (ext === '.png') mime = 'image/png';
              else if (ext === '.webp') mime = 'image/webp';
              else if (ext === '.gif') mime = 'image/gif';
              else if (ext === '.svg') mime = 'image/svg+xml';

              assets.push({
                id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                filename: entry.name,
                originalName: entry.name,
                url: relUrl,
                mimeType: mime,
                size: buf.length,
                hash,
                folder: baseFolder,
                uploadedAt: new Date(fs.statSync(fullPath).mtime).toISOString(),
              });
            }
          } catch (err) {
            console.error(`[MediaService] Error indexing ${fullPath}:`, err);
          }
        }
      }
    }
  };

  scanDir(uploadsRoot, 'uploads', '/uploads');
  scanDir(IMAGES_ROOT, 'images', '/images');

  await saveMediaManifest(assets);
  return assets;
}

/**
 * Handles file upload with cryptographic SHA-256 duplicate detection.
 * If identical content exists, reuses existing asset and skips writing duplicate file.
 */
export async function uploadMediaAsset({
  buffer,
  originalFilename,
  folder = 'general',
}: {
  buffer: Buffer;
  originalFilename: string;
  folder?: string;
}): Promise<{ asset: MediaAsset; isDuplicate: boolean }> {
  ensureDirectories();

  // 1. Signature validation
  const validation = validateFileSignature(buffer, originalFilename);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file format');
  }

  // 2. Cryptographic SHA-256 duplicate check
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const manifest = await getMediaManifest();

  const existing = manifest.find((item) => item.hash === hash);
  if (existing) {
    return { asset: existing, isDuplicate: true };
  }

  // 3. New file: create collision-resistant name in appropriate folder
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
  const uploadsRoot = getUploadsDir();
  const targetDir = path.join(uploadsRoot, sanitizedFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const rawBase = path
    .basename(originalFilename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 30);
  const uniqueName = `${rawBase || 'asset'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
  const targetPath = path.join(targetDir, uniqueName);

  await fs.promises.writeFile(targetPath, buffer);

  const publicUrl = `/uploads/${sanitizedFolder}/${uniqueName}`;
  const newAsset: MediaAsset = {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: uniqueName,
    originalName: originalFilename,
    url: publicUrl,
    mimeType: validation.mimeType,
    size: buffer.length,
    hash,
    folder: sanitizedFolder,
    uploadedAt: new Date().toISOString(),
  };

  manifest.unshift(newAsset);
  await saveMediaManifest(manifest);

  return { asset: newAsset, isDuplicate: false };
}

/**
 * Scans all store JSON files to find where a media asset is actively referenced.
 */
export async function checkMediaUsage(assetUrl: string): Promise<MediaUsageReference[]> {
  ensureDirectories();
  const references: MediaUsageReference[] = [];
  const cleanUrl = assetUrl.trim();
  const filename = path.basename(cleanUrl);

  const isMatch = (val: any): boolean => {
    if (typeof val === 'string') {
      return val.includes(cleanUrl) || (filename.length > 5 && val.includes(filename));
    }
    return false;
  };

  const storeFiles = [
    { file: 'hero.json', section: 'Hero Banner' },
    { file: 'about.json', section: 'About Biography' },
    { file: 'filmography.json', section: 'Notable Works' },
    { file: 'gallery.json', section: 'Photo Gallery' },
    { file: 'timeline.json', section: 'Career Timeline' },
    { file: 'press.json', section: 'Press & Media' },
    { file: 'mediaPartners.json', section: 'Media Partners' },
    { file: 'contactInfo.json', section: 'Contact Portals' },
    { file: 'seo.json', section: 'SEO & Metadata' },
  ];

  const storeDir = getPersistentStoreDir();
  for (const { file, section } of storeFiles) {
    const filePath = path.join(storeDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const raw = await fs.promises.readFile(filePath, 'utf-8');
        const data = JSON.parse(raw);

        // Recursive walker
        const walk = (node: any, pathTrace: string) => {
          if (!node) return;
          if (Array.isArray(node)) {
            node.forEach((item, idx) => walk(item, `${pathTrace}[${idx}]`));
          } else if (typeof node === 'object') {
            for (const [key, val] of Object.entries(node)) {
              if (isMatch(val)) {
                references.push({
                  section,
                  identifier: node.title || node.name || node.year || pathTrace,
                  label: `${section} -> ${key}`,
                  field: key,
                });
              } else if (typeof val === 'object') {
                walk(val, `${pathTrace}.${key}`);
              }
            }
          }
        };

        walk(data, file);
      } catch (err) {
        console.error(`[MediaService] Usage scan error on ${file}:`, err);
      }
    }
  }

  return references;
}

/**
 * Deletes media asset safely. Blocks deletion if asset is actively referenced unless force=true.
 * Only allows deletion inside public/uploads to prevent arbitrary file deletion.
 */
export async function deleteMediaAsset(
  id: string,
  force: boolean = false
): Promise<{
  success: boolean;
  inUse?: boolean;
  references?: MediaUsageReference[];
  error?: string;
}> {
  ensureDirectories();
  const manifest = await getMediaManifest();
  const index = manifest.findIndex((a) => a.id === id);

  if (index === -1) {
    return { success: false, error: 'Asset not found in media manifest' };
  }

  const asset = manifest[index];

  // Check references
  const references = await checkMediaUsage(asset.url);
  if (references.length > 0 && !force) {
    return {
      success: false,
      inUse: true,
      references,
      error: `Asset is actively referenced in ${references.length} place(s).`,
    };
  }

  // Safe file removal: only delete if path resolves within uploads root
  if (asset.url.startsWith('/uploads/')) {
    const rel = asset.url.replace(/^\/uploads\//, '');
    const uploadsRoot = getUploadsDir();
    const absolutePath = path.resolve(uploadsRoot, rel);

    // Prevent path traversal outside uploadsRoot
    if (absolutePath.startsWith(uploadsRoot)) {
      if (fs.existsSync(absolutePath)) {
        try {
          await fs.promises.unlink(absolutePath);
        } catch (unlinkErr) {
          console.error(`[MediaService] Unlink failed for ${absolutePath}:`, unlinkErr);
        }
      }
    }
  }

  // Remove from manifest
  manifest.splice(index, 1);
  await saveMediaManifest(manifest);

  return { success: true, references };
}

