import type { Metadata } from 'next';
import './globals.css';
import { readStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { CustomHeadInjector } from '@/lib/custom-head';
import { WebMcpProvider } from '@/components/webmcp-provider';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [seo, siteUrl] = await Promise.all([
    readStore<SiteSeoData>('seo').then((d) => d || defaultSeoData),
    resolveCanonicalSiteUrl(),
  ]);

  const title = seo.siteTitle || defaultSeoData.siteTitle;
  const description = seo.description || defaultSeoData.description;
  const keywords = (seo.keywords || defaultSeoData.keywords).split(',').map((k) => k.trim());
  const ogImage = seo.ogImage || '/images/hero.jpg';

  const customFavicon = seo.faviconUrl && seo.faviconUrl.trim() ? seo.faviconUrl.trim() : null;
  const customApple = seo.appleTouchIconUrl && seo.appleTouchIconUrl.trim() ? seo.appleTouchIconUrl.trim() : null;

  const iconList = customFavicon
    ? [{ url: customFavicon }]
    : [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ];

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/',
        'bn-BD': '/',
      },
    },
    title: {
      default: title,
      template: `%s | ${seo.tagline || 'Shirin Shila'}`,
    },
    description,
    keywords,
    authors: [{ name: seo.author || 'Shirin Shila', url: siteUrl }],
    creator: 'Rumel Ahmed',
    publisher: 'Shirin Shila Official Management Desk',
    icons: {
      icon: iconList,
      shortcut: customFavicon || '/favicon.ico',
      apple: [
        { url: customApple || '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: siteUrl,
      siteName: 'Shirin Shila Official Cinema Portfolio',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`,
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
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`],
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
  const [seo, contact, siteUrl] = await Promise.all([
    readStore<SiteSeoData>('seo').then((d) => d || defaultSeoData),
    readStore<any>('contactInfo').then((d) => d || {}),
    resolveCanonicalSiteUrl(),
  ]);

  const managementEmail = contact.email || 'booking@shirinshila.com';
  const managementPhone = contact.phone || '';

  // Truthful, accurate Schema.org JSON-LD describing Shirin Shila's official actor portfolio
  const structuredDataGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Shirin Shila Official Cinema Portfolio",
        "description": "Official casting and film portfolio of Bangladeshi silver-screen actress Shirin Shila.",
        "publisher": { "@id": `${siteUrl}/#organization` },
        "inLanguage": ["en", "bn"]
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Shirin Shila Talent Management Desk",
        "alternateName": ["Shirin Shila Management", "Shirin Shila Official Agency", "Shirin Shila Production & Booking Desk"],
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/images/hero.jpg`,
          "caption": "Shirin Shila Official Logo"
        },
        "image": `${siteUrl}/images/hero.jpg`,
        "description": "Official talent representation, casting coordination, and brand endorsement management agency for Bangladeshi film actress Shirin Shila (Shirin Akter).",
        "email": managementEmail,
        ...(managementPhone ? { "telephone": managementPhone } : {}),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Dhaka",
          "addressRegion": "Dhaka Division",
          "addressCountry": "BD"
        },
        "founder": {
          "@id": `${siteUrl}/#person`
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "@id": `${siteUrl}/#booking-desk`,
            "contactType": "Talent Booking & Management Desk",
            "email": managementEmail,
            ...(managementPhone ? { "telephone": managementPhone } : {}),
            "url": `${siteUrl}/contact`,
            "availableLanguage": ["English", "Bengali"]
          }
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
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        "url": siteUrl,
        "name": "Shirin Shila Official Portfolio & Casting Profile",
        "mainEntity": { "@id": `${siteUrl}/#person` }
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        "name": "Shirin Shila",
        "alternateName": ["Shirin Akter", "শিরিন শিলা"],
        "birthDate": "1996-08-26",
        "birthPlace": {
          "@type": "Place",
          "name": "Dhaka, Bangladesh"
        },
        "gender": "Female",
        "jobTitle": "Dhallywood Film Actress, Television Star & Cultural Fashion Model",
        "worksFor": { "@id": `${siteUrl}/#organization` },
        "nationality": {
          "@type": "Country",
          "name": "Bangladesh"
        },
        "url": siteUrl,
        "image": `${siteUrl}/images/hero.jpg`,
        "award": [
          "Babisas Best Actress Award (2019) for Begum Jaan",
          "Meril-Prothom Alo Awards Nominee (2014) for Hitman",
          "DIFF Best Actress Trophy Presentation (2024)",
          "National Star Excellence Crest (2025)"
        ],
        "performerIn": [
          {
            "@type": "Movie",
            "name": "Hitman",
            "datePublished": "2014",
            "director": { "@type": "Person", "name": "Wazed Ali Sumon" },
            "actor": [{ "@type": "Person", "name": "Shakib Khan" }, { "@type": "Person", "name": "Shirin Shila" }]
          },
          {
            "@type": "Movie",
            "name": "Begum Jaan",
            "datePublished": "2019",
            "director": { "@type": "Person", "name": "Mohammad Aslam" },
            "award": "Babisas Best Actress Award (2019)"
          },
          {
            "@type": "Movie",
            "name": "Birangona 71",
            "datePublished": "2022",
            "director": { "@type": "Person", "name": "M. Sakhawat Hossain" }
          },
          {
            "@type": "Movie",
            "name": "Shesh Baji",
            "datePublished": "2024",
            "director": { "@type": "Person", "name": "Mehedi Hasan" }
          }
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
      },
      {
        "@type": "ContactPoint",
        "@id": `${siteUrl}/#booking-desk`,
        "contactType": "Talent Booking & Management Desk",
        "email": managementEmail,
        ...(managementPhone ? { "telephone": managementPhone } : {}),
        "url": `${siteUrl}/contact`,
        "availableLanguage": ["English", "Bengali"]
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who represents actress Shirin Shila for professional bookings?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Shirin Shila is officially represented through her talent booking desk. Professional casting, endorsement, and appearance inquiries can be submitted directly via the booking portal on this website or by emailing ${managementEmail}.`
            }
          },
          {
            "@type": "Question",
            "name": "What was Shirin Shila's breakthrough movie?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Shirin Shila debuted in 2014 in the blockbuster Dhallywood action film 'Hitman' alongside Shakib Khan, followed by her critically acclaimed lead role in 'Begum Jaan' (2019) for which she won the Babisas Best Actress Award."
            }
          },
          {
            "@type": "Question",
            "name": "How can filmmakers and casting directors request showreels and schedule casting sessions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Full 4K casting showreels, high-resolution comp cards, and scheduling requests are available via the contact portal or by emailing ${managementEmail}.`
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={siteUrl} />
        {/* Dynamic Verified Favicon & Browser Icons */}
        <link rel="icon" href={seo.faviconUrl || '/icon.svg'} />
        <link rel="shortcut icon" href={seo.faviconUrl || '/favicon.ico'} />
        <link rel="apple-touch-icon" href={seo.appleTouchIconUrl || '/apple-icon.png'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Custom Header Code Injection */}
        {seo.customHeadHtml && <CustomHeadInjector html={seo.customHeadHtml} />}

        {/* Truthful Multi-Schema JSON-LD Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataGraph),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <WebMcpProvider />
        {children}
      </body>
    </html>
  );
}
