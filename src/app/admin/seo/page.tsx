"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Save, RefreshCw, Check, Upload, Code2, Share2, Image as ImageIcon, FolderKanban } from 'lucide-react';
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
        setSeo(data.seo);
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
        Loading SEO &amp; Meta settings...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
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
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved Changes!' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <form onSubmit={handleSave}>
          <div className="adm-grid-2col">
            {/* Left Column: Core SEO & Social OG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Core Search Engine Meta */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Search Engine Optimization (SEO) Meta</span>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Site Title (Page Title)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.siteTitle}
                      onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                      placeholder="e.g. Shirin Shila — Official Dhallywood Film Actress & Casting Portfolio"
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block' }}>
                      Main title displayed in browser tabs and Google Search result headers.
                    </span>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Tagline (Title Suffix)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.tagline}
                      onChange={(e) => setSeo({ ...seo, tagline: e.target.value })}
                      placeholder="e.g. Dhallywood Cinema, Television Star & Fashion Model"
                    />
                  </div>

                  <div className="adm-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="adm-label">Meta Description</label>
                      <span style={{ fontSize: '11px', color: seo.description.length > 165 ? '#ef4444' : 'var(--adm-text-muted)' }}>
                        {seo.description.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      placeholder="Concise summary for Google Search snippet results (150-160 characters ideal)..."
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Meta Keywords</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.keywords}
                      onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                      placeholder="Shirin Shila, Dhallywood Actress, Begum Jaan, Shakib Khan, Birangona 71..."
                    />
                    <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block' }}>
                      Comma-separated keywords for search engine indexing.
                    </span>
                  </div>

                  <div className="adm-grid-2fields">
                    <div className="adm-form-group">
                      <label className="adm-label">Author / Artist Name</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={seo.author}
                        onChange={(e) => setSeo({ ...seo, author: e.target.value })}
                        placeholder="Shirin Shila"
                      />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Canonical Site URL</label>
                      <input
                        type="url"
                        className="adm-input"
                        value={seo.siteUrl}
                        onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                        placeholder="https://shirinshila.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                      placeholder="Title preview when link is pasted in Facebook, Twitter, WhatsApp..."
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Social Share Description</label>
                    <textarea
                      className="adm-textarea"
                      rows={2}
                      value={seo.ogDescription}
                      onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                      placeholder="Short teaser description for social feeds..."
                    />
                  </div>

                  {/* Social Share Image (OG Image) */}
                  <div className="adm-form-group">
                    <label className="adm-label">Social Media Share Image (OG Image — Recommended: 1200x630)</label>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: '180px',
                          height: '95px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0b080c',
                          border: '1.5px solid var(--adm-border)',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        <img
                          src={seo.ogImage || '/images/hero.jpg'}
                          alt="Social Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/hero.jpg';
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '180px' }}>
                        <input
                          type="file"
                          ref={ogInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadImage(f, 'seo', setIsUploadingOg, 'ogImage');
                          }}
                          style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setOgPickerOpen(true)}
                            className="adm-btn adm-btn-primary adm-btn-sm"
                          >
                            <FolderKanban size={13} />
                            <span>Choose from Library</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => ogInputRef.current?.click()}
                            disabled={isUploadingOg}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            <Upload size={13} />
                            <span>{isUploadingOg ? 'Uploading Image...' : 'Direct Upload'}</span>
                          </button>
                        </div>

                        <MediaPickerModal
                          isOpen={ogPickerOpen}
                          onClose={() => setOgPickerOpen(false)}
                          onSelect={(url) => setSeo((prev) => ({ ...prev, ogImage: url }))}
                          title="Select Social Share Image (OG Image)"
                          currentValue={seo.ogImage}
                          targetFolder="seo"
                        />

                        <input
                          type="text"
                          className="adm-input"
                          value={seo.ogImage}
                          onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                          placeholder="/images/hero.jpg or https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Twitter / X Creator Handle</label>
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
            </div>

            {/* Right Column: Favicon & Custom Code Injection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: '#0b080c',
                          border: '1.5px solid var(--adm-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          flexShrink: 0,
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

                      <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="file"
                          ref={faviconInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadImage(f, 'icons', setIsUploadingFavicon, 'faviconUrl');
                          }}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={isUploadingFavicon}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ flexShrink: 0 }}
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
                      placeholder="/apple-touch-icon.png"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Custom Header Code Injection Box */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code2 size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Custom &lt;head&gt; Code Injection</span>
                  </div>
                  <span className="adm-badge adm-badge-blue">Live Injection</span>
                </div>
                <div className="adm-card-body">
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-label">
                      Google Verification, Analytics, Pixel &amp; Custom Meta Tags
                    </label>
                    <textarea
                      className="adm-textarea"
                      rows={9}
                      value={seo.customHeadHtml}
                      onChange={(e) => setSeo({ ...seo, customHeadHtml: e.target.value })}
                      style={{
                        fontFamily: 'var(--adm-font-mono)',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        background: '#0f172a',
                        color: '#38bdf8',
                        border: '1.5px solid #1e293b',
                      }}
                      placeholder={`<!-- Example: Google Search Console Verification -->\n<meta name="google-site-verification" content="YOUR_CODE_HERE" />\n\n<!-- Example: Google Analytics (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXX');\n</script>`}
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', marginTop: '8px', display: 'block', lineHeight: 1.45 }}>
                      Anything pasted here is directly injected into the website&apos;s HTML <code>&lt;head&gt;</code>. Ideal for Google Search Console verification codes, Google Tag Manager, Bing Webmaster Tools, and tracking scripts.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

