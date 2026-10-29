import { filmography as defaultFilmography, ProjectItem } from './projects';
import { pressItems as defaultPressItems, PressItem } from './press';
import {
  initialContactInfo,
  initialInquiries,
  ContactInfo,
  InquiryItem,
} from './contact';

const KEYS = {
  WORKS: 'shirin_shila_works',
  PRESS: 'shirin_shila_press',
  INQUIRIES: 'shirin_shila_inquiries',
  CONTACT_INFO: 'shirin_shila_contact_info',
};

// Check if running in browser
const isClient = typeof window !== 'undefined';

/**
 * NOTABLE WORKS / FILMOGRAPHY
 */
export function getStoredWorks(): ProjectItem[] {
  if (!isClient) return defaultFilmography;
  try {
    const raw = localStorage.getItem(KEYS.WORKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: ProjectItem) => {
          const def = defaultFilmography.find((d) => d.id === item.id || d.title === item.title);
          if (def) {
            return {
              ...def,
              ...item,
              banglaTitle: item.banglaTitle || def.banglaTitle,
              coStar: item.coStar || def.coStar,
              productionHouse: item.productionHouse || def.productionHouse,
              description: item.description || def.description,
              image: item.image || def.image,
              featured: item.featured !== undefined ? item.featured : def.featured,
              awards: item.awards !== undefined ? item.awards : def.awards,
              status: item.status || def.status,
            };
          }
          return item;
        });
      }
    }
  } catch (err) {
    console.error('Error reading works from storage:', err);
  }
  return defaultFilmography;
}

export function saveStoredWorks(items: ProjectItem[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(KEYS.WORKS, JSON.stringify(items));
    window.dispatchEvent(new Event('shirin_shila_works_updated'));
  } catch (err) {
    console.error('Error saving works to storage:', err);
  }
}

/**
 * PRESS & MEDIA
 */
export function getStoredPress(): PressItem[] {
  if (!isClient) return defaultPressItems;
  try {
    const raw = localStorage.getItem(KEYS.PRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading press from storage:', err);
  }
  return defaultPressItems;
}

export function saveStoredPress(items: PressItem[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(KEYS.PRESS, JSON.stringify(items));
    window.dispatchEvent(new Event('shirin_shila_press_updated'));
  } catch (err) {
    console.error('Error saving press to storage:', err);
  }
}

/**
 * CONTACT INQUIRIES
 */
export function getStoredInquiries(): InquiryItem[] {
  if (!isClient) return initialInquiries;
  try {
    const raw = localStorage.getItem(KEYS.INQUIRIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading inquiries from storage:', err);
  }
  return initialInquiries;
}

export function saveStoredInquiries(items: InquiryItem[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(items));
    window.dispatchEvent(new Event('shirin_shila_inquiries_updated'));
  } catch (err) {
    console.error('Error saving inquiries to storage:', err);
  }
}

/**
 * CONTACT & REPRESENTATION INFO
 */
export function getStoredContactInfo(): ContactInfo {
  if (!isClient) return initialContactInfo;
  try {
    const raw = localStorage.getItem(KEYS.CONTACT_INFO);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { ...initialContactInfo, ...parsed, socials: { ...initialContactInfo.socials, ...(parsed.socials || {}) } };
    }
  } catch (err) {
    console.error('Error reading contact info from storage:', err);
  }
  return initialContactInfo;
}

export function saveStoredContactInfo(info: ContactInfo): void {
  if (!isClient) return;
  try {
    localStorage.setItem(KEYS.CONTACT_INFO, JSON.stringify(info));
    window.dispatchEvent(new Event('shirin_shila_contact_info_updated'));
  } catch (err) {
    console.error('Error saving contact info to storage:', err);
  }
}

/**
 * RESET ALL DATA TO DEFAULTS
 */
export function resetAllStorage(): void {
  if (!isClient) return;
  try {
    localStorage.removeItem(KEYS.WORKS);
    localStorage.removeItem(KEYS.PRESS);
    localStorage.removeItem(KEYS.INQUIRIES);
    localStorage.removeItem(KEYS.CONTACT_INFO);
    window.dispatchEvent(new Event('shirin_shila_reset'));
  } catch (err) {
    console.error('Error resetting storage:', err);
  }
}
