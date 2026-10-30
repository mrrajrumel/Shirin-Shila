"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Save,
  RefreshCw,
  Check,
  Upload,
  Code2,
  Share2,
  Image as ImageIcon,
  FolderKanban,
} from 'lucide-react';
import { SiteSeoData, defaultSeoData } from '@/data/seo';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<SiteSeoData>(defaultSeoData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  const ogInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const loadSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo', { cache: 'no-store' });
      const data = await res.json();
      if (data.seo) {
        setSeo({
          ...defaultSeoData,
          ...data.seo,
        });
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeoData();
  }, []);

  const handleUploadImage = async (
    file: File,
    folder: string,
    setLoadingState: (val: boolean) => void,
    field: keyof SiteSeoData
  ) => {
    setLoadingState(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSeo((prev) => ({ ...prev, [field]: data.url }));
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_seo_updated'));
        localStorage.setItem('shirin_shila_sync_seo', Date.now().toString());
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading SEO &amp; Meta Settings...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-left">
          <div className="adm-breadcrumbs">
            <span>Admin</span> / <span>Settings</span> / <span>SEO &amp; Social</span>
          </div>
          <h1 className="adm-title">Search Engine Optimization (SEO) &amp; Social Sharing</h1>
          <p className="adm-subtitle">
            Configure global website metadata, canonical domain URL, OpenGraph social sharing previews, and browser tab favicons.
          </p>
        </div>
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadSeoData}
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
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <form onSubmit={handleSave}>
          <div className="adm-grid-2col">
            {/* Left Column: Core Search Engine Meta & Canonical Origin */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Core Search Engine Meta & Canonical URL */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Search Engine Metadata &amp; Canonical URL</span>
                  </div>
                  <span className="adm-badge adm-badge-green">Global</span>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Canonical Production Site URL</label>
                    <input
                      type="url"
                      className="adm-input"
                      value={seo.siteUrl}
                      onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                      placeholder="https://shirinshila.com"
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.45 }}>
                      The definitive canonical origin for Google search indexing, structured JSON-LD data, and sitemaps.
                    </span>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Global Site Title (Browser Tab &amp; Google Result)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.siteTitle}
                      onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                      placeholder="Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio"
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Header Sub-Tagline</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.tagline}
                      onChange={(e) => setSeo({ ...seo, tagline: e.target.value })}
                      placeholder="Dhallywood Cinema, Television Star & Cultural Fashion Model"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Meta Description</label>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      placeholder="Concise overview summarizing Shirin Shila's film career and booking representation..."
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Keywords (Comma-separated)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.keywords}
                      onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                      placeholder="Shirin Shila, Shirin Akter, Dhallywood Actress, Begum Jaan Actress, Hitman..."
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Primary Author / Artist Identity</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.author}
                      onChange={(e) => setSeo({ ...seo, author: e.target.value })}
                      placeholder="Shirin Shila"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Social Share (OG), Favicon & Custom Injection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 2. Social Media & Open Graph (OG) Sharing */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Social Media Preview &amp; Open Graph (Facebook / WhatsApp / X)</span>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Social Share Title (OG Title)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.ogTitle}
                      onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                      placeholder="Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Social Share Description</label>
                    <textarea
                      className="adm-textarea"
                      rows={2}
                      value={seo.ogDescription}
                      onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                      placeholder="Explore official filmography, awards, press archive, and casting showreels..."
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Social Share Banner Image (1200x630 recommended)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '42px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#090d16',
                          border: '1px solid var(--adm-border)',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={seo.ogImage || '/images/hero.jpg'}
                          alt="OG Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/hero.jpg';
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          ref={ogInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadImage(f, 'seo', setIsUploadingOg, 'ogImage');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => ogInputRef.current?.click()}
                          disabled={isUploadingOg}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <Upload size={13} />
                          <span>{isUploadingOg ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOgPickerOpen(true)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <FolderKanban size={13} />
                          <span>Choose Asset</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">X / Twitter Handle</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.twitterHandle}
                      onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                      placeholder="@shirin_shila"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Favicon & Brand Icons */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Favicon &amp; Browser Icons</span>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Browser Tab Favicon (SVG / ICO / PNG)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#090d16',
                          border: '1px solid var(--adm-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          padding: '4px',
                        }}
                      >
                        <img
                          src={seo.faviconUrl || '/icon.svg'}
                          alt="Favicon"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <input
                          type="file"
                          ref={faviconInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadImage(f, 'icons', setIsUploadingFavicon, 'faviconUrl');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={isUploadingFavicon}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <Upload size={13} />
                          <span>{isUploadingFavicon ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <input
                          type="text"
                          className="adm-input"
                          value={seo.faviconUrl}
                          onChange={(e) => setSeo({ ...seo, faviconUrl: e.target.value })}
                          placeholder="/icon.svg or /favicon.ico"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Apple Touch Icon (iOS Home Screen)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.appleTouchIconUrl}
                      onChange={(e) => setSeo({ ...seo, appleTouchIconUrl: e.target.value })}
                      placeholder="/apple-icon.png"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Custom Head Code Injection */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code2 size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Custom &lt;head&gt; Code Injection</span>
                  </div>
                </div>
                <div className="adm-card-body">
                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-label">Custom HTML / Script Tags</label>
                    <textarea
                      className="adm-textarea"
                      rows={4}
                      value={seo.customHeadHtml || ''}
                      onChange={(e) => setSeo({ ...seo, customHeadHtml: e.target.value })}
                      placeholder="<!-- Google Analytics, Facebook Pixel, or verification meta tags -->"
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Media Picker Modal for OG Image */}
      <MediaPickerModal
        isOpen={ogPickerOpen}
        onClose={() => setOgPickerOpen(false)}
        onSelect={(url) => setSeo((prev) => ({ ...prev, ogImage: url }))}
        title="Select Social Share Banner (OG Image)"
      />
    </>
  );
}
