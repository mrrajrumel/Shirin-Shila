import { MetadataRoute } from 'next';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';
import { readStore } from '@/lib/server-storage';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [baseUrl, pages] = await Promise.all([
    resolveCanonicalSiteUrl(),
    readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry),
  ]);

  const currentDate = new Date().toISOString();

  // Distinct, genuine, crawlable public routes
  const paths: Array<{ path: string; priority: number; freq: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/terms', priority: 0.7, freq: 'yearly' },
    { path: '/privacy', priority: 0.7, freq: 'yearly' },
  ];

  // Include /llms.txt in sitemap
  if (pages?.llms?.isPublished !== false) {
    paths.push({ path: '/llms.txt', priority: 0.8, freq: 'weekly' });
  }

  return paths.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: currentDate,
    changeFrequency: item.freq,
    priority: item.priority,
  }));
}
