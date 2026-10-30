import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cornflowerblue-wildcat-675604.hostingersite.com';
  const customUrl = 'https://shirinshila.com';
  const currentDate = new Date().toISOString();

  const paths = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/about', priority: 0.9, freq: 'monthly' as const },
    { path: '/contact', priority: 0.9, freq: 'monthly' as const },
    { path: '/terms', priority: 0.7, freq: 'yearly' as const },
    { path: '/privacy', priority: 0.7, freq: 'yearly' as const },
    { path: '/llms.txt', priority: 0.8, freq: 'weekly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const item of paths) {
    entries.push({
      url: `${baseUrl}${item.path}`,
      lastModified: currentDate,
      changeFrequency: item.freq,
      priority: item.priority,
    });
    // Also include custom domain
    entries.push({
      url: `${customUrl}${item.path}`,
      lastModified: currentDate,
      changeFrequency: item.freq,
      priority: item.priority,
    });
  }

  return entries;
}
