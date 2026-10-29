"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, Upload, Save, RefreshCw, Check, ArrowUpRight } from 'lucide-react';
import { HeroProfile } from '@/data/hero';

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHero = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero', { cache: 'no-store' });
      const data = await res.json();
      if (data.hero) setHero(data.hero);
    } catch (err) {
      console.error('Error fetching hero data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHero();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'hero');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setHero((prev) => (prev ? { ...prev, image: data.url } : null));
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !hero) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading Hero Section settings...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">Hero Section Settings</h1>
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadHero}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            title="Reload from server"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Left: Text & CTA Form */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Headlines & Copy</span>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Celebrity Stage Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={hero.name}
                  onChange={(e) => setHero({ ...hero, name: e.target.value })}
                  placeholder="e.g. SHIRIN SHILA"
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Eyebrow / Sub-kicker</label>
                <input
                  type="text"
                  className="adm-input"
                  value={hero.eyebrow}
                  onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                  placeholder="e.g. Dhallywood Cinema & Fashion"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Roles & Titles Banner</label>
                <input
                  type="text"
                  className="adm-input"
                  value={hero.roles}
                  onChange={(e) => setHero({ ...hero, roles: e.target.value })}
                  placeholder="e.g. Film Actress • Television Star & Reality Judge • Fashion Model"
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Introduction Summary</label>
                <textarea
                  className="adm-textarea"
                  rows={3}
                  value={hero.intro}
                  onChange={(e) => setHero({ ...hero, intro: e.target.value })}
                  placeholder="Cinematic introductory bio sentence..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Primary Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={hero.primaryCta.label}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        primaryCta: { ...hero.primaryCta, label: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Primary Target (#anchor)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={hero.primaryCta.href}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        primaryCta: { ...hero.primaryCta, href: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Secondary Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={hero.secondaryCta.label}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        secondaryCta: { ...hero.secondaryCta, label: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Secondary Target (#anchor)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={hero.secondaryCta.href}
                    onChange={(e) =>
                      setHero({
                        ...hero,
                        secondaryCta: { ...hero.secondaryCta, href: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right: Portrait Image Upload & Live Preview */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Hero Portrait Photo</span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '220px',
                    height: '280px',
                    margin: '0 auto 16px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1a111a',
                    border: '2px solid rgba(255, 63, 121, 0.4)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,63,121,0.2)',
                  }}
                >
                  <img
                    src={hero.image}
                    alt={hero.imageAlt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="adm-btn adm-btn-secondary"
                  style={{ margin: '0 auto', display: 'inline-flex' }}
                >
                  <Upload size={14} />
                  <span>{isUploading ? 'Uploading Portrait...' : 'Upload New Portrait Photo'}</span>
                </button>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Or Image Path / URL</label>
                <input
                  type="text"
                  className="adm-input"
                  value={hero.image}
                  onChange={(e) => setHero({ ...hero, image: e.target.value })}
                  placeholder="/images/shirin-akter.png or /uploads/..."
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Image Alt Description</label>
                <input
                  type="text"
                  className="adm-input"
                  value={hero.imageAlt}
                  onChange={(e) => setHero({ ...hero, imageAlt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
