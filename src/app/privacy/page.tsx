import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | Shirin Shila Official Portfolio',
  description: 'Data protection and confidentiality policy for casting inquiries, talent management desk, and website communications for Shirin Shila.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
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
            Data Protection &amp; Confidentiality
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0 10px', color: '#ffffff' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
            Last updated: October 2026 • Strict confidentiality for talent representation &amp; casting submissions
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '15px', color: '#d4d4d8', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              1. Information We Collect
            </h2>
            <p>
              When casting agents, producers, or corporate representatives submit an inquiry through our booking desk, we collect contact information (name, email address, phone number, production organization, and project details). This information is used strictly to evaluate casting offers and coordinate professional appointments.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              2. Confidentiality of Scripts &amp; Treatments
            </h2>
            <p>
              We treat all artistic treatments, screenplays, concept pitches, and commercial storyboards transmitted through this portal with non-disclosure confidentiality. Unreleased creative materials are never shared beyond authorized talent representation personnel.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              3. Data Security &amp; Storage
            </h2>
            <p>
              Inquiry submissions are securely stored in encrypted database repositories protected by parameterized queries, strict access controls, and rate-limiting safeguards. We do not sell, rent, or lease contact databases to third parties.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              4. Machine Agent Interactions
            </h2>
            <p>
              Autonomous search crawlers and AI agents interacting with this site are granted access to public biographical indices, structured schema representations, and our <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: '4px', color: '#f43f5e' }}>/llms.txt</code> manifest. Submissions via automated forms must include legitimate production identity.
            </p>
          </section>
        </div>

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Data inquiries: <a href="mailto:privacy@shirinshila.com" style={{ color: '#ec4899', textDecoration: 'none' }}>privacy@shirinshila.com</a>
          </div>
          <Link href="/terms" style={{ fontSize: '13px', color: '#ec4899', textDecoration: 'underline' }}>
            View Terms of Representation
          </Link>
        </footer>
      </div>
    </main>
  );
}
