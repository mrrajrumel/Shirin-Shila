import fs from 'fs';
import path from 'path';

// Import default seed data
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

const STORE_DIR = path.join(process.cwd(), 'src', 'data', 'store');

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

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
  | 'seo';

function getFilePath(key: StoreKey): string {
  return path.join(STORE_DIR, `${key}.json`);
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
  }
}

/**
 * Read data from local JSON store. Initializes from default code dataset if file doesn't exist.
 */
export async function readStore<T>(key: StoreKey): Promise<T> {
  ensureStoreDir();
  const filePath = getFilePath(key);

  try {
    if (fs.existsSync(filePath)) {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.error(`[ServerStore] Error reading ${key}.json:`, err);
  }

  // File doesn't exist or error reading -> seed with default data and save
  const seed = getDefaultData(key) as T;
  await writeStore(key, seed);
  return seed;
}

/**
 * Write data to local JSON store on server disk.
 */
export async function writeStore<T>(key: StoreKey, data: T): Promise<void> {
  ensureStoreDir();
  const filePath = getFilePath(key);
  const tempPath = `${filePath}.tmp.${Date.now()}`;

  try {
    const serialized = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tempPath, serialized, 'utf-8');
    await fs.promises.rename(tempPath, filePath);
  } catch (err) {
    console.error(`[ServerStore] Error writing ${key}.json:`, err);
    // Fallback direct write if atomic rename encounters file-lock on Windows
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error(`[ServerStore] Direct write failed for ${key}:`, writeErr);
      throw writeErr;
    }
  }
}
