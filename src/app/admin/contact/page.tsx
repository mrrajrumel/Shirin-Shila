"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Save, RefreshCw, Check, Globe, Facebook, Instagram, Youtube, Film, ExternalLink } from 'lucide-react';
import { ContactInfo } from '@/data/contact';

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadContact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.info) setContact(data.info);
    } catch (err) {
      console.error('Error fetching contact info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContact();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_contact_info_updated'));
        localStorage.setItem('shirin_shila_sync_contact', Date.now().toString());
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !contact) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading Contact & Social Channels settings...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadContact}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            {savedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <form onSubmit={handleSave}>
          <div className="adm-grid-2col-equal">
            {/* Left: Official Emails & Representation */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Official Inquiries & Management Desks</span>
              </div>
              <div className="adm-card-body">
                <div className="adm-form-group">
                  <label className="adm-label">Talent Management Email *</label>
                  <input
                    type="email"
                    className="adm-input"
                    value={contact.managementEmail}
                    onChange={(e) => setContact({ ...contact, managementEmail: e.target.value })}
                    placeholder="e.g. support@trytso.com"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Press & Media Desk Email *</label>
                  <input
                    type="email"
                    className="adm-input"
                    value={contact.pressEmail}
                    onChange={(e) => setContact({ ...contact, pressEmail: e.target.value })}
                    placeholder="e.g. press@shirinshila.com"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Talent Desk / Agency Title</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={contact.agencyName || ''}
                    onChange={(e) => setContact({ ...contact, agencyName: e.target.value })}
                    placeholder="e.g. Shirin Shila Talent & Media Desk"
                  />
                </div>

                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                  <label className="adm-label">Representation & Submission Protocol</label>
                  <textarea
                    className="adm-textarea"
                    rows={4}
                    value={contact.representationNotes}
                    onChange={(e) => setContact({ ...contact, representationNotes: e.target.value })}
                    placeholder="Instructions for film producers, casting calls, and commercial campaigns..."
                  />
                </div>
              </div>
            </div>

            {/* Right: 7 Official Social Portals */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Official Channels & Social Portals</span>
              </div>
              <div className="adm-card-body">

              <div className="adm-form-group">
                <label className="adm-label">Facebook Profile (ID)</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.facebookProfile || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, facebookProfile: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Facebook Official Page</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.facebookPage || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, facebookPage: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Instagram Profile</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.instagram || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">YouTube Official Channel</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.youtube || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">TikTok Official Profile</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.tiktok || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, tiktok: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/@..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">IMDb Filmography Profile</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.imdb || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, imdb: e.target.value },
                    })
                  }
                  placeholder="https://www.imdb.com/name/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Wikipedia Biography Article</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.wikipedia || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, wikipedia: e.target.value },
                    })
                  }
                  placeholder="https://bn.wikipedia.org/wiki/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Google Knowledge Panel</label>
                <input
                  type="url"
                  className="adm-input"
                  value={contact.socials?.googleKnowledgePanel || ''}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      socials: { ...contact.socials, googleKnowledgePanel: e.target.value },
                    })
                  }
                  placeholder="https://share.google/... or https://google.com/search?kgmid=..."
                />
              </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
