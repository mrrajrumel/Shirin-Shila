import { NextResponse } from 'next/server';
import { readStore } from '@/lib/server-storage';
import { filmography as defaultFilmography } from '@/data/filmography';
import { aboutData as defaultAbout } from '@/data/about';
import { initialContactInfo } from '@/data/contact';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const pages = (await readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry)) || defaultPagesRegistry;

  const [siteUrl, about, filmography, contact, seo] = await Promise.all([
    resolveCanonicalSiteUrl(),
    readStore<any>('about').catch(() => defaultAbout),
    readStore<any[]>('filmography').catch(() => defaultFilmography),
    readStore<any>('contactInfo').catch(() => initialContactInfo),
    readStore<SiteSeoData>('seo').catch(() => defaultSeoData),
  ]);

  const films = filmography || defaultFilmography;
  const filmLines = films
    .map(
      (f: any) =>
        `- **${f.title}** (${f.year || 'Released'}) | Role: ${f.role || 'Lead Actress'} | Director: ${f.director || 'N/A'}${f.coStar ? ` | Co-Star: ${f.coStar}` : ''}`
    )
    .join('\n');

  const content = `# Shirin Shila — Full Profile & Portfolio Context for AI Agents

> Comprehensive factual reference document for LLMs, automated agents, casting research systems, and conversational AI.

## Identity & Professional Overview
- **Name**: Shirin Shila
- **Alternate Legal Name**: Shirin Akter
- **Bengali Name**: শিরিন শিলা
- **Profession**: Bangladeshi Silver-Screen Film Actress, Fashion Model & Television Reality Show Judge
- **Industry**: Dhallywood Cinema (Bangladesh Film Industry)
- **Active Since**: 2014 – Present
- **Birthplace**: Dhaka, Bangladesh
- **Official Website**: ${siteUrl}

## Verified Accolades & Awards
- **Babisas Best Actress Award (2019)**: Awarded by Bangladesh Binodon Sangbadik Samity for lead role in "Begum Jaan".
- **Meril-Prothom Alo Awards Nominee (2014)**: Nominated for Best Debut Performance in "Hitman".
- **Dhaka International Film Festival (DIFF) Honor (2024)**: Trophy presentation recognizing contribution to cinema.
- **National Star Excellence Crest (2025)**: Honored for artistic excellence across cinema and television.

## Verified Filmography
${filmLines}

## Key Site Links
- Homepage: ${siteUrl}/
- About Us: ${siteUrl}/#about
- Contact & Booking Desk: ${siteUrl}/#contact
- Terms of Representation: ${siteUrl}/terms
- Privacy Policy: ${siteUrl}/privacy
- llms.txt Summary: ${siteUrl}/llms.txt
- MCP Server Card: ${siteUrl}/.well-known/mcp/server-card.json

## Machine Agent Usage Policy
- **Content-Signal**: ${seo?.contentSignal || 'search=yes, ai-train=no'}
- Factual summarization and conversational query answering are permitted.
- Commercial synthetic replicas (deepfakes, voice clones) are strictly prohibited without written consent.

## Talent Management Contact
- Email: ${contact?.email || 'booking@shirinshila.com'}
- Phone: ${contact?.phone || '+880 1711-000000'}
- Base: Dhaka, Bangladesh
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
    },
  });
}
