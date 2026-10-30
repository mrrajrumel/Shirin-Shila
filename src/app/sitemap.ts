import { MetadataRoute } from 'next';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await resolveCanonicalSiteUrl();
  const currentDate = new Date().toISOString();

  // Distinct, genuine, crawlable public routes
  const paths = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/about', priority: 0.9, freq: 'monthly' as const },
    { path: '/contact', priority: 0.9, freq: 'monthly' as const },
    { path: '/terms', priority: 0.7, freq: 'yearly' as const },
    { path: '/privacy', priority: 0.7, freq: 'yearly' as const },
    { path: '/llms.txt', priority: 0.8, freq: 'weekly' as const },
  ];

  return paths.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: currentDate,
    changeFrequency: item.freq,
    priority: item.priority,
  }));
}
