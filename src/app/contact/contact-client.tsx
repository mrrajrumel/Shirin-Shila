"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContactInfo } from '@/data/contact';
import { ManagedPageData } from '@/data/pages';

interface ContactClientProps {
  pageConfig: ManagedPageData;
  contact: ContactInfo;
}

export default function ContactClientView({ pageConfig, contact }: ContactClientProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Film & Acting Project',
    message: '',
    website: '', // Honeypot field for bot spam trap
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMessage('Please fill in your name, email, and project brief.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          inquiryType: form.inquiryType,
          message: form.message.trim(),
          website: form.website, // honeypot
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmittedId(data.id || 'INQ-CONFIRMED');
      setForm({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'Film & Acting Project',
        message: '',
        website: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission encountered an error. Please try again or email management directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f8fafc', padding: '60px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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
            {pageConfig.navLabel || 'Contact and Book'}
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
            {pageConfig.title || 'Contact and Book'}
          </h1>
          <p style={{ fontSize: '17px', color: '#a1a1aa', lineHeight: 1.6 }}>
            {pageConfig.content && pageConfig.content.length > 20
              ? pageConfig.content
              : 'Direct point of contact for directors, producers, brand advertising agencies, and television networks.'}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          {/* Interactive Form Card */}
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '14px', border: '1px solid #27272a' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Send Talent Inquiry
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '24px' }}>
              Fill in your production details below. Submissions route directly to authorized representation.
            </p>

            {submittedId ? (
              <div style={{ background: '#064e3b', border: '1px solid #059669', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
                <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ecfdf5', marginBottom: '6px' }}>
                  Inquiry Dispatched Successfully!
                </h3>
                <p style={{ fontSize: '13px', color: '#a7f3d0', lineHeight: 1.6, marginBottom: '16px' }}>
                  Reference Token: <strong>{submittedId}</strong>. Management will review your submission and reply within 24-48 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedId(null)}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Honeypot field (hidden from genuine users) */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>

                {errorMessage && (
                  <div style={{ background: '#450a0a', border: '1px solid #b91c1c', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', color: '#fca5a5', fontSize: '13px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                    Your Name or Production Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakib Rahman / CineArt Productions"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#09090b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="producer@studio.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#09090b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 1700-000000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#09090b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                    Engagement Category
                  </label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#09090b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                    }}
                  >
                    <option value="Film & Acting Project">Silver-Screen Cinema / Feature Film</option>
                    <option value="Brand Endorsement & TVC">Commercial Brand Endorsement / TVC</option>
                    <option value="Television / Reality Show">Television Series / Reality Show Judging</option>
                    <option value="Live Event / Stage Appearance">Live Event / Stage Appearance / Award Show</option>
                    <option value="Press & Media Interview">Press / Television Interview</option>
                    <option value="Other Representation Inquiry">Other Management Inquiry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#d4d4d8', marginBottom: '6px' }}>
                    Project Brief &amp; Proposed Schedule *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide overview: synopsis, role brief, proposed shooting dates, location, and production scale."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: '#09090b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#ec4899',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Transmitting to Desk...' : 'Transmit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Representation Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#18181b', padding: '30px', borderRadius: '14px', border: '1px solid #27272a' }}>
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
                    <a href={`mailto:${contact.managementEmail || 'booking@shirinshila.com'}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                      {contact.managementEmail || 'booking@shirinshila.com'}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#27272a', padding: '10px', borderRadius: '8px', color: '#ec4899' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                      Press &amp; Media Desk
                    </span>
                    <a href={`mailto:${contact.pressEmail || 'press@shirinshila.com'}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                      {contact.pressEmail || 'press@shirinshila.com'}
                    </a>
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
                      Turnaround Guarantee
                    </span>
                    <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 500 }}>
                      All verified inquiries answered within 24-48 business hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <section style={{ background: '#13111c', padding: '24px', borderRadius: '12px', border: '1px solid #2e1065', display: 'flex', alignItems: 'center', gap: '16px' }}>
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
        </div>
      </div>
    </main>
  );
}

