import { NextResponse } from 'next/server';
import { readStore } from '@/lib/server-storage';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { resolveCanonicalSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const [siteUrl, seo] = await Promise.all([
    resolveCanonicalSiteUrl(),
    readStore<SiteSeoData>('seo').then((d) => d || defaultSeoData),
  ]);

  const customSummary = seo.llmsSummary?.trim()
    ? `\n\n## Management Notice\n${seo.llmsSummary.trim()}\n`
    : '';

  const content = `# Shirin Shila — Dhallywood Film Actress & Casting Portfolio

> Official, verified portfolio of Bangladeshi silver-screen cinema actress, model, and television reality show judge Shirin Shila (Shirin Akter).

## Core Pages
- [Home](${siteUrl}/): Official portfolio homepage featuring silver-screen showreels, career highlights, and news archive.
- [About Actor](${siteUrl}/about): Comprehensive biography, acting background, feature filmography, and major industry awards.
- [Contact and Book](${siteUrl}/contact): Direct talent management desk for casting directors, filmmakers, brand endorsement agencies, and press requests.
- [Terms of Representation](${siteUrl}/terms): Professional representation terms, casting guidelines, intellectual property, and AI voice/likeness usage protection.
- [Privacy Policy](${siteUrl}/privacy): Data protection, script confidentiality, and inquiry handling standards.
- [Full LLM Content Profile](${siteUrl}/llms-full.txt): Detailed factual biography, full filmography credits, and accolades index.
- [MCP Server Card](${siteUrl}/.well-known/mcp/server-card.json): Machine-readable Model Context Protocol (MCP) server manifest declaring portfolio query tools.

## Content Usage & AI Policy
- **Content-Signal Directive**: \`${seo.contentSignal || 'search=yes, ai-train=no'}\`
- **Search & Discovery**: Authorized for search indexing, conversational discovery, factual summaries, and knowledge queries.
- **Likeness Protection**: Synthetic voice cloning, biometric generative facial likeness models, and uncredited generative replicas are strictly prohibited without an explicit licensed talent agreement.${customSummary}

## Talent Desk Contact
- **Email**: booking@shirinshila.com
- **Website**: ${siteUrl}
- **Representation Base**: Dhaka, Bangladesh (Available for Worldwide Productions)
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
