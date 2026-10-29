import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://shirinshila.com'),
  title: {
    default: 'Shirin Shila — Official Dhallywood Film Actress & Casting Portfolio',
    template: '%s | Shirin Shila',
  },
  description:
    'Official portfolio of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter). Explore filmography, video showreels, career milestones, awards, press coverage, and talent management booking representation.',
  keywords: [
    'Shirin Shila',
    'Shirin Akter',
    'Dhallywood Actress',
    'Bangladeshi Film Actress',
    'Dhallywood Cinema',
    'Bangladeshi Cinema Star',
    'Begum Jaan Actress',
    'Hitman Shakib Khan Shirin Shila',
    'Birangona 71 Shirin Shila',
    'Shesh Baji Movie',
    'Bangladeshi Celebrity Judge',
    'Reality Show Bicharok',
    'Shirin Shila Casting Showreel',
    'Dhallywood Model',
  ],
  authors: [{ name: 'Shirin Shila', url: 'https://shirinshila.com' }],
  creator: 'Rumel Ahmed',
  publisher: 'Tune Soul Ocean',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Shirin Shila — Official Dhallywood Film Actress & Casting Portfolio',
    description:
      'Explore official filmography, awards, press archive, and casting showreels of Bangladeshi film star Shirin Shila.',
    url: 'https://shirinshila.com',
    siteName: 'Shirin Shila Official Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Shirin Shila — Dhallywood Film Actress',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shirin Shila — Official Dhallywood Film Actress Portfolio',
    description:
      'Official cinema portfolio of Bangladeshi film star Shirin Shila. Filmography, awards, press coverage, and casting showreels.',
    images: ['/images/hero.jpg'],
    creator: '@shirin_shila',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
                "https://bn.wikipedia.org/wiki/%E0%A6%B6%E0%A6%BF%E0%A6%B0%E0%A6%BF%E0%A6%A8_%E0%A6%B6%E0%A6%BF%E0%A6%B2%E0%A6%BE"
              ]
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
