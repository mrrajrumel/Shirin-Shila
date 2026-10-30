import fs from 'fs';
import path from 'path';
import { getPersistentStoreDir, getPersistentBackupsDir } from './persistent-paths';
import { getDbContent, saveDbContent, isDatabaseConfigured } from './db';

// Import default seed data from codebase
import { filmography as defaultFilmography, ProjectItem } from '../data/filmography';
import { showreelVideos as defaultShowreels, ShowreelItem } from '../data/showreel';
import { pressItems as defaultPress, PressItem } from '../data/press';
import { galleryImages as defaultGallery, GalleryImage } from '../data/gallery';
import {
  defaultTopJourneyData,
  defaultBottomJourneyData,
  careerTimeline,
  JourneyItem,
  TimelineMilestone,
} from '../data/timeline';
import {
  initialContactInfo,
  initialInquiries,
  ContactInfo,
  InquiryItem,
} from '../data/contact';
import { heroProfile as defaultHero, HeroProfile } from '../data/hero';
import { aboutData as defaultAbout } from '../data/about';
import { defaultMediaPartners, MediaPartner } from '../data/media-partners';
import { defaultSeoData, SiteSeoData } from '../data/seo';
import { defaultPagesRegistry, PagesRegistry } from '../data/pages';

export interface TimelineStoreData {
  top: JourneyItem[];
  bottom: JourneyItem[];
  milestones: TimelineMilestone[];
}

export type StoreKey =
  | 'filmography'
  | 'showreels'
  | 'press'
  | 'gallery'
  | 'timeline'
  | 'inquiries'
  | 'contactInfo'
  | 'hero'
  | 'about'
  | 'mediaPartners'
  | 'seo'
  | 'pages';

export const ALL_STORE_KEYS: StoreKey[] = [
  'hero',
  'about',
  'filmography',
  'showreels',
  'gallery',
  'timeline',
  'press',
  'contactInfo',
  'inquiries',
  'mediaPartners',
  'seo',
  'pages',
];

function getStoreFilePath(key: StoreKey): string {
  return path.join(getPersistentStoreDir(), `${key}.json`);
}

function getDefaultData(key: StoreKey): any {
  switch (key) {
    case 'filmography':
      return defaultFilmography;
    case 'showreels':
      return defaultShowreels;
    case 'press':
      return defaultPress;
    case 'gallery':
      return defaultGallery;
    case 'timeline':
      return {
        top: defaultTopJourneyData,
        bottom: defaultBottomJourneyData,
        milestones: careerTimeline,
      };
    case 'inquiries':
      return initialInquiries;
    case 'contactInfo':
      return initialContactInfo;
    case 'hero':
      return defaultHero;
    case 'about':
      return defaultAbout;
    case 'mediaPartners':
      return defaultMediaPartners;
    case 'seo':
      return defaultSeoData;
    case 'pages':
      return defaultPagesRegistry;
  }
}

/**
 * Read data from local JSON store.
 * Priority:
 * 1. Persistent file in getPersistentStoreDir() (survives Git deployments)
 * 2. If absent in persistent dir: copy from repository's src/data/store/{key}.json (first-time seed)
 * 3. Fallback: getDefaultData(key) from code
 */
export async function readStore<T>(key: StoreKey): Promise<T> {
  // 1. Primary: If database is configured, read directly from Hostinger MySQL
  if (isDatabaseConfigured()) {
    try {
      const dbData = await getDbContent<T>(key);
      if (dbData !== null && dbData !== undefined) {
        if (key === 'pages') {
          const pages = dbData as unknown as PagesRegistry;
          let modified = false;
          for (const k of ['about', 'contact', 'privacy', 'terms', 'llms'] as (keyof PagesRegistry)[]) {
            if (!pages[k]) {
              pages[k] = defaultPagesRegistry[k];
              modified = true;
            }
          }
          if (pages.llms && pages.llms.isPublished !== true) {
            pages.llms.isPublished = true;
            modified = true;
          }
          if (modified) {
            saveDbContent(key, pages, 'auto_pages_sync').catch(() => {});
          }
          return pages as unknown as T;
        }
        return dbData;
      }
    } catch (dbErr) {
      console.warn(`[ServerStore] MySQL read failed for ${key}, falling back to persistent file store:`, (dbErr as Error).message);
    }
  }

  const filePath = getStoreFilePath(key);

  // 2. Secondary: If file already exists in persistent directory, read and return it
  if (fs.existsSync(filePath)) {
    try {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as T;
      if (key === 'pages') {
        const pages = parsed as unknown as PagesRegistry;
        let modified = false;
        for (const k of ['about', 'contact', 'privacy', 'terms', 'llms'] as (keyof PagesRegistry)[]) {
          if (!pages[k]) {
            pages[k] = defaultPagesRegistry[k];
            modified = true;
          }
        }
        if (pages.llms && pages.llms.isPublished !== true) {
          pages.llms.isPublished = true;
          modified = true;
        }
        if (modified) {
          fs.promises.writeFile(filePath, JSON.stringify(pages, null, 2), 'utf-8').catch(() => {});
          if (isDatabaseConfigured()) {
            saveDbContent(key, pages, 'auto_pages_sync').catch(() => {});
          }
        }
        return pages as unknown as T;
      }
      // If DB is configured but empty for this key, seed it now
      if (isDatabaseConfigured()) {
        saveDbContent(key, parsed, 'initial_file_sync').catch(() => {});
      }
      return parsed;
    } catch (err) {
      console.error(`[ServerStore] Error reading persistent ${key}.json:`, err);
    }
  }

  // 3. First-time initialization: check if repository has a seed file
  const repoSeedPath = path.join(process.cwd(), 'src', 'data', 'store', `${key}.json`);
  let initialData: T;

  if (fs.existsSync(repoSeedPath)) {
    try {
      const raw = await fs.promises.readFile(repoSeedPath, 'utf-8');
      initialData = JSON.parse(raw) as T;
    } catch {
      initialData = getDefaultData(key) as T;
    }
  } else {
    initialData = getDefaultData(key) as T;
  }

  // Only write initial seed to persistent storage during runtime, not during static next build
  const isBuildPhase =
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_PHASE === 'phase-production-build';

  if (!isBuildPhase) {
    await writeStore(key, initialData, false).catch(() => {});
  }
  return initialData;
}

/**
 * Write data to persistent JSON store and MySQL database with atomic file renaming and rolling safety backups.
 */
export async function writeStore<T>(key: StoreKey, data: T, createBackup = true): Promise<void> {
  if (data === undefined || data === null) {
    console.warn(`[ServerStore] Attempted to write null/undefined data for ${key}, skipping`);
    return;
  }

  const filePath = getStoreFilePath(key);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
  }

  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const serialized = JSON.stringify(data, null, 2);

  // 1. Atomic write to persistent file
  try {
    await fs.promises.writeFile(tempPath, serialized, 'utf-8');
    await fs.promises.rename(tempPath, filePath);
  } catch (err) {
    console.error(`[ServerStore] Atomic rename failed for ${key}, falling back to direct write:`, err);
    try {
      await fs.promises.writeFile(filePath, serialized, 'utf-8');
    } catch (writeErr) {
      console.error(`[ServerStore] Direct write failed for ${key}:`, writeErr);
      throw writeErr;
    }
  }

  // 2. Write to MySQL database if configured
  if (isDatabaseConfigured()) {
    try {
      const dbSuccess = await saveDbContent(key, data);
      if (!dbSuccess) {
        console.error(`[ServerStore] Warning: MySQL save returned false for ${key}`);
      }
    } catch (dbErr) {
      console.error(`[ServerStore] MySQL save failed for ${key}:`, (dbErr as Error).message);
    }
  }

  // 3. Rolling backup (keeps last 5 revisions for disaster recovery)
  if (createBackup) {
    try {
      const backupsDir = path.join(getPersistentBackupsDir(), key);
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      const backupPath = path.join(backupsDir, `${key}.${Date.now()}.json`);
      await fs.promises.writeFile(backupPath, serialized, 'utf-8');

      // Prune backups older than the 5 most recent
      const files = (await fs.promises.readdir(backupsDir))
        .filter((f) => f.startsWith(`${key}.`) && f.endsWith('.json'))
        .sort();

      if (files.length > 5) {
        const toDelete = files.slice(0, files.length - 5);
        for (const file of toDelete) {
          await fs.promises.unlink(path.join(backupsDir, file)).catch(() => {});
        }
      }
    } catch (backupErr) {
      console.warn(`[ServerStore] Rolling backup warning for ${key}:`, backupErr);
    }
  }
}
