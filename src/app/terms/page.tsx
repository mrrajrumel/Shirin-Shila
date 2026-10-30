import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { readStore } from '@/lib/server-storage';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Representation & Booking | Shirin Shila',
  description: 'Official talent booking terms, media appearance policies, intellectual property, and representation guidelines for Bangladeshi film actress Shirin Shila.',
  alternates: {
    canonical: '/terms',
  },
};

export default async function TermsPage() {
  const pages = (await readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry)) || defaultPagesRegistry;
  const pageConfig = pages.terms || defaultPagesRegistry.terms;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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

        <header style={{ marginBottom: '36px', borderBottom: '1px solid #27272a', paddingBottom: '20px' }}>
          <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: '#ec4899', fontWeight: 700 }}>
            {pageConfig.navLabel || 'Terms of Representation'}
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0 10px', color: '#ffffff' }}>
            {pageConfig.title || 'Terms of Representation & Booking'}
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
            Official Legal &amp; Representation Guidelines for Film Productions, Endorsements &amp; Live Engagements
          </p>
        </header>

        <MarkdownRenderer content={pageConfig.content} />

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Questions regarding representation terms? Contact <a href="mailto:booking@shirinshila.com" style={{ color: '#ec4899', textDecoration: 'none' }}>booking@shirinshila.com</a>
          </div>
          <Link href="/privacy" style={{ fontSize: '13px', color: '#ec4899', textDecoration: 'underline' }}>
            View Privacy Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}
