import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/server-storage';
import { heroProfile as defaultHero } from '@/data/hero';
import { aboutData as defaultAbout } from '@/data/about';
import { filmography as defaultFilmography } from '@/data/filmography';
import { pressItems as defaultPress } from '@/data/press';
import { initialContactInfo } from '@/data/contact';
import { defaultMediaPartners } from '@/data/media-partners';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const [baseUrl, hero, about, filmography, press, contact, mediaPartners] = await Promise.all([
    resolveCanonicalSiteUrl(),
    readStore<any>('hero').catch(() => defaultHero),
    readStore<any>('about').catch(() => defaultAbout),
    readStore<any[]>('filmography').catch(() => defaultFilmography),
    readStore<any[]>('press').catch(() => defaultPress),
    readStore<any>('contactInfo').catch(() => initialContactInfo),
    readStore<any[]>('mediaPartners').catch(() => defaultMediaPartners),
  ]);

  const md = `# ${hero?.name || 'Shirin Shila'} — Official Cinema Portfolio & Casting Desk

> ${hero?.tagline || 'Dhallywood Cinema, Television Star & Cultural Fashion Model'}

## Quick Links
- **Homepage**: ${baseUrl}/
- **About Us**: ${baseUrl}/#about
- **Contact and Book**: ${baseUrl}/#contact
- **Terms of Representation**: ${baseUrl}/terms
- **Privacy Policy**: ${baseUrl}/privacy
- **LLM Summary**: ${baseUrl}/llms.txt
- **MCP Server Card**: ${baseUrl}/.well-known/mcp/server-card.json

---

## 1. Biography & Profile
${about?.bioText || about?.storyText || 'Shirin Shila (Shirin Akter) is a celebrated Bangladeshi silver-screen film actress who debuted in 2014 in "Hitman" alongside Shakib Khan and won the Babisas Best Actress Award in 2019 for "Begum Jaan".'}

### Career Statistics
- **Feature Films**: 10+ silver-screen productions
- **Debut Year**: 2014 (Hitman)
- **Primary Awards**: Babisas Best Actress (2019), DIFF Trophy (2024), National Star Crest (2025)

---

## 2. Selected Filmography
${(filmography || defaultFilmography)
  .map(
    (f: any) =>
      `### ${f.title} (${f.year})
- **Role/Character**: ${f.role || 'Lead Actress'}
- **Director**: ${f.director || 'N/A'}
- **Co-Stars**: ${f.coStar || f.cast || 'N/A'}
- **Category**: ${f.category || 'Feature Film'}
- **Status**: ${f.status || 'Released'}`
  )
  .join('\n\n')}

---

## 3. Press Coverage & Interviews
${(press || defaultPress)
  .slice(0, 8)
  .map(
    (p: any) =>
      `- **${p.title}** (${p.source}, ${p.date}): ${p.excerpt || p.summary || ''}`
  )
  .join('\n')}

---

## 4. Television Broadcasters & Studio Partners
${(mediaPartners || defaultMediaPartners)
  .map((m: any) => `- ${m.name}`)
  .join('\n')}

---

## 5. Talent Representation & Booking Inquiries
- **Management Email**: ${contact?.managementEmail || contact?.email || 'support@trytso.com'}
- **Phone / WhatsApp**: ${contact?.phone || '+880 1711-000000'}
- **Office**: Dhaka, Bangladesh (Global Shoot Availability)
- **Inquiry Portal**: ${baseUrl}/#contact
`;

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
      'Link': '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </.well-known/mcp/server-card.json>; rel="service-desc"',
      'X-Content-Type': 'text/markdown',
    },
  });
}
