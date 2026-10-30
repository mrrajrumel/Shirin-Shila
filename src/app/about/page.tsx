import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, Film, Star, CheckCircle } from 'lucide-react';
import { readStore } from '@/lib/server-storage';
import { aboutData as defaultAbout } from '@/data/about';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | Shirin Shila Official Biography & Honors',
  description: 'Biographical overview of Bangladeshi silver-screen film actress, television reality show judge, and model Shirin Shila (Shirin Akter).',
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const [about, pages] = await Promise.all([
    readStore<any>('about').catch(() => defaultAbout),
    readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry),
  ]);

  const activeAbout = about || defaultAbout;
  const pageConfig = pages?.about || defaultPagesRegistry.about;

  const accoladesList =
    Array.isArray(pageConfig.meta?.accolades) && pageConfig.meta.accolades.length > 0
      ? pageConfig.meta.accolades
      : [
          'Babisas Best Actress Award (2019) — Awarded for leading role in "Begum Jaan"',
          'Meril-Prothom Alo Awards Nominee (2014) — Best Debut Performance for "Hitman"',
          'DIFF Best Actress Trophy (2024) — International Film Festival recognition',
          'National Star Excellence Honor (2025) — Television & Cinema Contribution Crest',
        ];

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
            {pageConfig.subheading || activeAbout.subheading || 'Silver-Screen Dhallywood Actress, Television Reality Judge & Cultural Fashion Icon'}
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
                  {pageConfig.meta?.babisasYear || '2019'}
                </span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Babisas Best Actress</span>
              </div>
              <div style={{ background: '#18181b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #27272a' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899', display: 'block' }}>
                  {pageConfig.meta?.diffYear || '2024'}
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
