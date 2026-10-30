import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, Film, Star, CheckCircle } from 'lucide-react';
import { readStore } from '@/lib/server-storage';
import { aboutData as defaultAbout } from '@/data/about';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import { JourneyItem, topJourneyData, bottomJourneyData } from '@/data/timeline';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | Shirin Shila Official Biography & Honors',
  description: 'Biographical overview of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter).',
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const [about, pages, timelineData] = await Promise.all([
    readStore<any>('about').catch(() => defaultAbout),
    readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry),
    readStore<any>('timeline').catch(() => null),
  ]);

  const activeAbout = about || defaultAbout;
  const pageConfig = pages?.about || defaultPagesRegistry.about;

  // deletedIds from store — items the admin permanently removed
  const deletedIds = new Set<string>(
    Array.isArray(timelineData?.deletedIds) ? timelineData.deletedIds : []
  );

  // Only use top/bottom journey items (not milestones which are career-stage entries, not individual awards)
  // Filter out any ids the admin deleted before building the accolades list
  const allTimelineItems: Array<{ id?: string; year?: string; title?: string; content?: string; description?: string }> = [
    ...(Array.isArray(timelineData?.items)  ? timelineData.items  : []),
    ...(Array.isArray(timelineData?.top)    ? timelineData.top    : []),
    ...(Array.isArray(timelineData?.bottom) ? timelineData.bottom : []),
  ].filter((it) => !it.id || !deletedIds.has(it.id));

  // Fallback to static seed only when the store itself could not be loaded
  if (allTimelineItems.length === 0 && !timelineData) {
    allTimelineItems.push(...topJourneyData, ...bottomJourneyData);
  }

  // De-duplicate by title or content
  const seenAccolades = new Set<string>();
  const dynamicTimelineAccolades: string[] = [];

  for (const item of allTimelineItems) {
    const yearStr = item.year ? `(${item.year})` : '';
    const title = (item.title || '').trim();
    let text = (item.content || item.description || '').trim();

    if (!title && !text) continue;

    // Normalization key for de-duplication
    const normKey = (title || text).toLowerCase().slice(0, 16);
    if (seenAccolades.has(normKey)) continue;
    seenAccolades.add(normKey);

    if (title && text) {
      const titleRegex = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(—|-|:)?\\s*`, 'i');
      text = text.replace(titleRegex, '');
      dynamicTimelineAccolades.push(`${title} ${yearStr} — ${text}`.replace(/\s+/g, ' ').trim());
    } else if (title) {
      dynamicTimelineAccolades.push(`${title} ${yearStr}`.trim());
    } else {
      dynamicTimelineAccolades.push(`${text} ${yearStr}`.trim());
    }
  }

  const accoladesList =
    pageConfig.meta?.useCustomAccolades === true && Array.isArray(pageConfig.meta?.accolades) && pageConfig.meta.accolades.length > 0
      ? pageConfig.meta.accolades
      : (dynamicTimelineAccolades.length > 0
          ? dynamicTimelineAccolades
          : [
              'Babisas Best Actress Award (2019) — Awarded for leading role in "Begum Jaan"',
              'Meril-Prothom Alo Awards Nominee (2014) — Best Debut Performance for "Hitman"',
              'DIFF Best Actress Trophy (2024) — International Film Festival recognition',
              'National Star Excellence Honor (2025) — Television & Cinema Contribution Crest',
            ]);

  const babisasItem = allTimelineItems.find((it) => /babisas/i.test(it.title || '') || /babisas/i.test(it.content || '') || /babisas/i.test(it.description || ''));
  const diffItem = allTimelineItems.find((it) => /diff/i.test(it.title || '') || /dhaka international/i.test(it.content || '') || /dhaka international/i.test(it.description || ''));

  const displayedSubheading =
    pageConfig.subheading ||
    activeAbout?.subheading ||
    activeAbout?.meta?.subheading ||
    'Silver-Screen Dhallywood Actress, Television Reality Judge & Cultural Fashion Icon';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ec4899',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Official Portfolio</span>
        </Link>

        <header style={{ marginBottom: '40px', borderBottom: '1px solid #27272a', paddingBottom: '24px' }}>
          <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: '#ec4899', fontWeight: 700 }}>
            {pageConfig.navLabel || 'About Us'}
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
            {pageConfig.title || 'About Us'}
          </h1>
          <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: 1.6 }}>
            {displayedSubheading}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #27272a', maxHeight: '420px' }}>
            <img
              src={pageConfig.meta?.portraitImage || activeAbout?.meta?.portraitSrc || '/images/hero.jpg'}
              alt="Shirin Shila"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f43f5e', marginBottom: '16px' }}>
              Artistic Background &amp; Journey
            </h2>
            <p style={{ fontSize: '15px', color: '#d4d4d8', lineHeight: 1.8, marginBottom: '16px' }}>
              {pageConfig.content || activeAbout.bioText || (
                'Shirin Shila (born Shirin Akter) is a celebrated Bangladeshi film actress who captured nationwide attention with her silver-screen debut in the 2014 blockbuster hit "Hitman" alongside Shakib Khan. With classic expressive range, commanding screen presence, and dedication to challenging roles, she has built an enduring catalog across romantic dramas, action thrillers, and patriotic cinema.'
              )}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ background: '#18181b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899', display: 'block' }}>
                  {pageConfig.meta?.featureFilms || '10+'}
                </span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Feature Films</span>
              </div>
              <div style={{ background: '#18181b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899', display: 'block' }}>
                  {pageConfig.meta?.babisasYear || babisasItem?.year || '2019'}
                </span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Babisas Best Actress</span>
              </div>
              <div style={{ background: '#18181b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899', display: 'block' }}>
                  {pageConfig.meta?.diffYear || diffItem?.year || '2024'}
                </span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>DIFF Best Actress Trophy</span>
              </div>
            </div>
          </div>
        </div>

        <section style={{ background: '#18181b', padding: '30px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#ec4899" />
            <span>Notable Accolades &amp; Industry Honors</span>
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
            {accoladesList.map((item: string, idx: number) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e4e4e7' }}>
                <CheckCircle size={16} color="#10b981" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #27272a' }}>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#ec4899',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Contact Talent Management Desk
          </Link>
        </footer>
      </div>
    </main>
  );
}
