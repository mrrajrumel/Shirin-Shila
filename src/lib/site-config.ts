import { readStore } from './server-storage';
import { SiteSeoData, defaultSeoData, defaultFooterLinks, FooterLinkItem } from '@/data/seo';

/**
 * Documented fallback origin during temporary Hostinger staging.
 * When permanent domain (e.g. shirinshila.com) is attached or configured,
 * it is overridden automatically via environment variable or Admin Panel setting.
 */
export const DEFAULT_FALLBACK_SITE_URL = 'https://cornflowerblue-wildcat-675604.hostingersite.com';
export const DEFAULT_CONTENT_SIGNAL = 'search=yes, ai-train=no';

/**
 * Normalizes an origin URL:
 * - Strips leading/trailing whitespace
 * - Ensures https:// or http:// protocol
 * - Strips trailing slashes
 * - Removes invalid characters
 */
export function normalizeOrigin(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return DEFAULT_FALLBACK_SITE_URL;
  }

  let cleaned = rawUrl.trim();
  if (!cleaned) {
    return DEFAULT_FALLBACK_SITE_URL;
  }

  // Ensure protocol
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    // Origin only: protocol + host (removes path, query, hash, trailing slashes)
    return parsed.origin;
  } catch {
    // If URL parsing fails, strip trailing slashes manually
    return cleaned.replace(/\/+$/, '');
  }
}

/**
 * Synchronous canonical site URL getter.
 * Priority:
 * 1. process.env.SITE_URL
 * 2. process.env.APP_URL
 * 3. process.env.NEXT_PUBLIC_SITE_URL
 * 4. DEFAULT_FALLBACK_SITE_URL
 */
export function getCanonicalSiteUrl(): string {
  const envUrl =
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl && envUrl.trim()) {
    return normalizeOrigin(envUrl);
  }

  return DEFAULT_FALLBACK_SITE_URL;
}

/**
 * Asynchronous canonical site URL resolver.
 * Priority:
 * 1. Environment variable: SITE_URL / APP_URL / NEXT_PUBLIC_SITE_URL
 * 2. Persistent CMS database store (key: 'seo', field: 'siteUrl')
 * 3. DEFAULT_FALLBACK_SITE_URL
 */
export async function resolveCanonicalSiteUrl(): Promise<string> {
  const envUrl =
    process.env.SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl && envUrl.trim()) {
    return normalizeOrigin(envUrl);
  }

  try {
    const seo = await readStore<SiteSeoData>('seo');
    if (seo?.siteUrl && seo.siteUrl.trim()) {
      return normalizeOrigin(seo.siteUrl);
    }
  } catch (err) {
    // Fallback on read error
  }

  return DEFAULT_FALLBACK_SITE_URL;
}

/**
 * Converts a relative path into a fully qualified absolute URL
 * using the configured canonical origin.
 */
export function toAbsoluteUrl(pathname: string, origin?: string): string {
  const base = origin ? normalizeOrigin(origin) : getCanonicalSiteUrl();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${cleanPath}`;
}

/**
 * Resolves the active Content-Signal directive.
 * Priority:
 * 1. process.env.CONTENT_SIGNAL
 * 2. Persistent CMS database store ('seo.contentSignal')
 * 3. DEFAULT_CONTENT_SIGNAL ('search=yes, ai-train=no')
 */
export async function getContentSignal(): Promise<string> {
  if (process.env.CONTENT_SIGNAL && process.env.CONTENT_SIGNAL.trim()) {
    return process.env.CONTENT_SIGNAL.trim();
  }

  try {
    const seo = await readStore<SiteSeoData>('seo');
    if (seo?.contentSignal && seo.contentSignal.trim()) {
      return seo.contentSignal.trim();
    }
  } catch {}

  return DEFAULT_CONTENT_SIGNAL;
}

/**
 * Resolves the active footer links configured in Admin Panel.
 * Falls back to default approved 5 links:
 * - About Actor (/about)
 * - Contact and Book (/contact)
 * - Privacy Policy (/privacy)
 * - Terms of Representation (/terms)
 * - llms.txt (/llms.txt)
 */
export async function getEffectiveFooterLinks(): Promise<FooterLinkItem[]> {
  try {
    const seo = await readStore<SiteSeoData>('seo');
    if (seo?.footerLinks && Array.isArray(seo.footerLinks) && seo.footerLinks.length > 0) {
      return seo.footerLinks
        .filter((l) => l.isVisible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch {}

  return defaultFooterLinks;
}

