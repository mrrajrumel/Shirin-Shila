import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, Scale } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Representation & Booking | Shirin Shila',
  description: 'Official talent booking terms, media appearance policies, intellectual property, and representation guidelines for Bangladeshi film actress Shirin Shila.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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
            Legal &amp; Representation Guidelines
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0 10px', color: '#ffffff' }}>
            Terms of Representation &amp; Booking
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
            Last updated: October 2026 • Effective for all film productions, commercial advertising &amp; live engagements
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '15px', color: '#d4d4d8', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              1. Scope &amp; Official Representation
            </h2>
            <p>
              This website serves as the sole official digital portfolio and primary contact desk for Bangladeshi silver-screen actress and model Shirin Shila. All casting inquiries, commercial endorsements, event appearances, and television reality show appointments must be confirmed in writing by authorized management representatives.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              2. Talent Booking &amp; Contractual Commitments
            </h2>
            <p>
              Preliminary inquiries submitted through this website do not constitute a binding engagement until formal contracts specifying production schedules, remuneration, travel logistics, and credit billing are mutually executed. A standard booking retainer is required to lock production dates on the artist&apos;s schedule.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              3. Intellectual Property &amp; Media Usage Rights
            </h2>
            <p>
              All promotional photography, showreels, movie posters, press clippings, and brand marks displayed on this portfolio are the exclusive intellectual property of Shirin Shila, production houses, and respective copyright holders. Reproduction, scraping, or commercial exploitation without prior written consent is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              4. Artificial Intelligence &amp; Digital Likeness
            </h2>
            <p>
              In alignment with international creative rights standards and our declared <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: '4px', color: '#f43f5e' }}>Content-Signal: search=yes, ai-train=no</code> policy: the voice, biometric face likeness, performance recordings, and video showreels of Shirin Shila may not be ingested or trained upon for synthetic generative voice/video models (deepfakes or uncredited generative AI clones) without explicit licensed contract.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              5. Governing Law
            </h2>
            <p>
              All professional representation agreements and digital operations of this portfolio are governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh.
            </p>
          </section>
        </div>

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
