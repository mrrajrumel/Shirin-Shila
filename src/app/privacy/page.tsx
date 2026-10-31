import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { readStore } from '@/lib/server-storage';
import { PagesRegistry, defaultPagesRegistry } from '@/data/pages';
import { MarkdownRenderer } from '@/components/markdown-renderer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | Shirin Shila Official Portfolio',
  description: 'Data protection and confidentiality policy for casting inquiries, talent management desk, and website communications for Shirin Shila.',
  alternates: {
    canonical: '/privacy',
  },
};

export default async function PrivacyPage() {
  const pages = (await readStore<PagesRegistry>('pages').catch(() => defaultPagesRegistry)) || defaultPagesRegistry;
  const pageConfig = pages.privacy || defaultPagesRegistry.privacy;

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
            {pageConfig.navLabel || 'Privacy Policy'}
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0 10px', color: '#ffffff' }}>
            {pageConfig.title || 'Privacy Policy'}
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
            Official Data Protection &amp; Talent Desk Confidentiality Policy
          </p>
        </header>

        <MarkdownRenderer content={pageConfig.content} />

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/terms" style={{ fontSize: '13px', color: '#ec4899', textDecoration: 'underline' }}>
            View Terms of Representation
          </Link>
        </footer>
      </div>
    </main>
  );
}
