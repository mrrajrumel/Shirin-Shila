import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send, ShieldCheck, Clock } from 'lucide-react';
import { readStore } from '@/lib/server-storage';
import { initialContactInfo } from '@/data/contact';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact & Talent Booking Desk | Shirin Shila',
  description: 'Official representation, casting inquiries, brand endorsement, and talent booking desk for Bangladeshi film actress Shirin Shila.',
  alternates: {
    canonical: '/contact',
  },
};

export default async function ContactPage() {
  const contact = (await readStore<any>('contactInfo').catch(() => initialContactInfo)) || initialContactInfo;

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
            Official Booking Desk
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
            Talent Management &amp; Casting Inquiries
          </h1>
          <p style={{ fontSize: '17px', color: '#a1a1aa', lineHeight: 1.6 }}>
            Direct point of contact for directors, producers, brand advertising agencies, and television networks.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          {/* Representation Info Card */}
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '12px', border: '1px solid #27272a' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '20px' }}>
              Management Office
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#27272a', padding: '10px', borderRadius: '8px', color: '#ec4899' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Email Representation
                  </span>
                  <a href={`mailto:${contact.email || 'booking@shirinshila.com'}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                    {contact.email || 'booking@shirinshila.com'}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#27272a', padding: '10px', borderRadius: '8px', color: '#ec4899' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Telephone / WhatsApp
                  </span>
                  <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
                    {contact.phone || '+880 1711-000000'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#27272a', padding: '10px', borderRadius: '8px', color: '#ec4899' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Representation Base
                  </span>
                  <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
                    Dhaka, Bangladesh (Available for Worldwide Shoots)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#27272a', padding: '10px', borderRadius: '8px', color: '#ec4899' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                    Turnaround Time
                  </span>
                  <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
                    All verified casting inquiries answered within 24-48 hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
                Inquiry Guidelines
              </h2>
              <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '16px' }}>
                To expedite review by the talent management desk, please specify:
              </p>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: '#d4d4d8', lineHeight: 1.8 }}>
                <li>Project title &amp; genre (Feature Film, OTT Series, TV Commercial)</li>
                <li>Production house or brand identity</li>
                <li>Tentative shooting schedule and location</li>
                <li>Character brief or campaign deliverables</li>
              </ul>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
              <Link
                href="/#contact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ec4899',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '14px',
                }}
              >
                <Send size={15} />
                <span>Open Interactive Booking Form</span>
              </Link>
            </div>
          </div>
        </div>

        <section style={{ background: '#13111c', padding: '24px 30px', borderRadius: '12px', border: '1px solid #2e1065', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldCheck size={28} color="#c084fc" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#f3e8ff', display: 'block' }}>
              Official Verification Notice
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#d8b4fe', lineHeight: 1.5 }}>
              This portal is the sole official digital booking and media representation outlet for Shirin Shila. Unsolicited intermediaries are not authorized to contract on behalf of the artist.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
