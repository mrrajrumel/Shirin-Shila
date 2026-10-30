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
  Bot,
  ListOrdered,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { SiteSeoData, defaultSeoData, defaultFooterLinks, FooterLinkItem } from '@/data/seo';
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
          footerLinks:
            data.seo.footerLinks && Array.isArray(data.seo.footerLinks) && data.seo.footerLinks.length > 0
              ? data.seo.footerLinks
              : defaultFooterLinks,
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

  // Footer link helpers
  const handleUpdateFooterLink = (id: string, updates: Partial<FooterLinkItem>) => {
    setSeo((prev) => ({
      ...prev,
      footerLinks: prev.footerLinks.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleAddFooterLink = () => {
    const newId = `link-${Date.now()}`;
    const nextOrder = (seo.footerLinks?.length || 0) + 1;
    setSeo((prev) => ({
      ...prev,
      footerLinks: [
        ...(prev.footerLinks || []),
        { id: newId, label: 'New Link', href: '/', isVisible: true, order: nextOrder },
      ],
    }));
  };

  const handleRemoveFooterLink = (id: string) => {
    setSeo((prev) => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((item) => item.id !== id),
    }));
  };

  const handleResetFooterLinks = () => {
    if (confirm('Reset footer links to the standard approved 5 items (About Actor, Contact and Book, Privacy Policy, Terms of Representation, llms.txt)?')) {
      setSeo((prev) => ({
        ...prev,
        footerLinks: defaultFooterLinks,
      }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading SEO &amp; AI Visibility settings...
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
            {/* Left Column: Core SEO, Canonical Origin & AI Visibility */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Core Search Engine Meta & Canonical URL */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Site Identity &amp; Canonical URL</span>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Canonical Site URL (Domain Agnostic)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.siteUrl}
                      onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                      placeholder="e.g. https://shirinshila.com (Leave empty to use SITE_URL or host default)"
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.45 }}>
                      When empty, the system automatically uses <code>process.env.SITE_URL</code> or the deployment host. Entering a domain here enforces it across all canonical tags, sitemaps, JSON-LD, robots.txt, and Link headers without redeploying code.
                    </span>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Site Title (Browser Tab &amp; Search Title)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.siteTitle}
                      onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                      placeholder="e.g. Shirin Shila | Official Dhallywood Film Actress & Casting Portfolio"
                      required
                    />
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
                    <label className="adm-label">Meta Description (Search Snippet)</label>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      placeholder="Brief description of the actor portfolio..."
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.keywords}
                      onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                      placeholder="Shirin Shila, Dhallywood Actress, Begum Jaan, Hitman, Bangladeshi Model"
                    />
                  </div>

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
                </div>
              </div>

              {/* 2. AI Visibility & Content-Signal Directives (Phase 4) */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">AI Visibility &amp; Machine Agent Directives</span>
                  </div>
                  <span className="adm-badge adm-badge-blue">Agent Ready</span>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Content-Signal Policy (Crawler Directive)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.contentSignal || 'search=yes, ai-train=no'}
                      onChange={(e) => setSeo({ ...seo, contentSignal: e.target.value })}
                      placeholder="search=yes, ai-train=no"
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.45 }}>
                      Published in <code>/robots.txt</code>. Tells search engines and AI agents whether content may be indexed for search (<code>search=yes</code>) and whether training generative models on the actor&apos;s likeness is prohibited (<code>ai-train=no</code>).
                    </span>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Custom llms.txt Overview Notes</label>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      value={seo.llmsSummary || ''}
                      onChange={(e) => setSeo({ ...seo, llmsSummary: e.target.value })}
                      placeholder="Optional custom biographical notes or agency instructions included in /llms.txt..."
                    />
                    <span style={{ fontSize: '11.5px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.45 }}>
                      Appended to the official <code>/llms.txt</code> summary served to LLMs and autonomous agents.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Approved Footer Links Management (Phase 3 & 4) */}
              <div className="adm-card">
                <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListOrdered size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Approved Footer Links</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResetFooterLinks}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      title="Reset to 5 approved standard links"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Standard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddFooterLink}
                      className="adm-btn adm-btn-primary adm-btn-sm"
                    >
                      <Plus size={12} />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', marginBottom: '4px', display: 'block' }}>
                    Manage visible footer navigation. Standard links: <strong>About Actor</strong> (/about), <strong>Contact and Book</strong> (/contact), <strong>Privacy Policy</strong> (/privacy), <strong>Terms of Representation</strong> (/terms), and <strong>llms.txt</strong> (/llms.txt).
                  </span>

                  {(seo.footerLinks || defaultFooterLinks).map((link, idx) => (
                    <div
                      key={link.id || idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 60px 50px 36px',
                        gap: '8px',
                        alignItems: 'center',
                        background: '#090d16',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--adm-border)',
                      }}
                    >
                      <div>
                        <input
                          type="text"
                          className="adm-input"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink(link.id, { label: e.target.value })}
                          placeholder="Label (e.g. About Actor)"
                          style={{ fontSize: '12.5px', padding: '6px 8px' }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="adm-input"
                          value={link.href}
                          onChange={(e) => handleUpdateFooterLink(link.id, { href: e.target.value })}
                          placeholder="Route (e.g. /about)"
                          style={{ fontSize: '12.5px', padding: '6px 8px' }}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="adm-input"
                          value={link.order || idx + 1}
                          onChange={(e) => handleUpdateFooterLink(link.id, { order: parseInt(e.target.value, 10) || 1 })}
                          placeholder="Order"
                          style={{ fontSize: '12px', padding: '6px 6px', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px', gap: '4px' }}>
                          <input
                            type="checkbox"
                            checked={link.isVisible !== false}
                            onChange={(e) => handleUpdateFooterLink(link.id, { isVisible: e.target.checked })}
                          />
                          <span>Show</span>
                        </label>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink(link.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Remove Link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Social Share (OG), Favicon & Custom Injection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 4. Social Media & Open Graph (OG) Sharing */}
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

              {/* 5. Favicon & Brand Icons */}
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

              {/* 6. Custom Header Code Injection Box */}
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
                      rows={6}
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
                      Injected directly into the website&apos;s HTML <code>&lt;head&gt;</code>. Ideal for Google Search Console, Google Tag Manager, and Bing Webmaster Tools.
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
