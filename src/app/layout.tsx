import type { Metadata } from 'next';
import './globals.css';
import { readStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { CustomHeadInjector } from '@/lib/custom-head';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const seo = (await readStore<SiteSeoData>('seo')) || defaultSeoData;

  const title = seo.siteTitle || defaultSeoData.siteTitle;
  const description = seo.description || defaultSeoData.description;
  const keywords = (seo.keywords || defaultSeoData.keywords).split(',').map((k) => k.trim());
  const ogImage = seo.ogImage || '/images/hero.jpg';

  return {
    metadataBase: new URL(seo.siteUrl || 'https://shirinshila.com'),
    title: {
      default: title,
      template: `%s | ${seo.tagline || 'Shirin Shila'}`,
    },
    description,
    keywords,
    authors: [{ name: seo.author || 'Shirin Shila', url: seo.siteUrl || 'https://shirinshila.com' }],
    creator: 'Rumel Ahmed',
    publisher: 'Tune Soul Ocean',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: seo.faviconUrl || '/icon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: seo.appleTouchIconUrl || '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: seo.siteUrl || 'https://shirinshila.com',
      siteName: 'Shirin Shila Official Portfolio',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${seo.author || 'Shirin Shila'} — Official Cinema Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: [ogImage],
      creator: seo.twitterHandle || '@shirin_shila',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seo = (await readStore<SiteSeoData>('seo')) || defaultSeoData;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Custom Header Code Injection (Google Search Console Verification, Analytics, Meta Tags) */}
        {seo.customHeadHtml && <CustomHeadInjector html={seo.customHeadHtml} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Shirin Shila",
              "alternateName": ["Shirin Akter", "শিরিন শিলা"],
              "birthDate": "1996-08-26",
              "birthPlace": {
                "@type": "Place",
                "name": "Dhaka, Bangladesh"
              },
              "jobTitle": "Film Actress, Television Star & Reality Show Judge",
              "nationality": "Bangladeshi",
              "url": "https://shirinshila.com",
              "image": "https://shirinshila.com/images/hero.jpg",
              "award": [
                "Babisas Best Actress Award (2019) for Begum Jaan",
                "Meril-Prothom Alo Awards Nominee (2014) for Hitman",
                "DIFF Best Actress Trophy Presentation (2024)",
                "National Star Excellence Crest (2025)"
              ],
              "performerIn": [
                { "@type": "Movie", "name": "Hitman", "datePublished": "2014" },
                { "@type": "Movie", "name": "Begum Jaan", "datePublished": "2019" },
                { "@type": "Movie", "name": "Birangona 71", "datePublished": "2022" },
                { "@type": "Movie", "name": "Shesh Baji", "datePublished": "2024" }
              ],
              "sameAs": [
                "https://www.facebook.com/shirin.shila.5",
                "https://www.facebook.com/shirinshilaofficial",
                "https://www.instagram.com/shirin_shila",
                "https://www.youtube.com/@shirinshilaofficial",
                "https://www.tiktok.com/@shirinshilaofficial",
                "https://www.imdb.com/name/nm6897284/",
                "https://bn.wikipedia.org/wiki/%E0%A6%B6%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%A8_%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A6%BE",
                "https://share.google/t32VCGGg4i72ZQ1nq"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
