"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Save,
  RefreshCw,
  Check,
  ArrowUpRight,
  Eye,
  EyeOff,
  History,
  RotateCcw,
  ShieldCheck,
  User,
  Share2,
  Lock,
  Scale,
  Bot,
  Plus,
  Trash2,
  Upload,
  FolderKanban,
  ImageIcon,
} from 'lucide-react';
import { PagesRegistry, defaultPagesRegistry, ManagedPageData } from '@/data/pages';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

type PageKey = keyof PagesRegistry;

const PAGE_KEYS: { key: PageKey; label: string; icon: any }[] = [
  { key: 'about', label: 'About Us', icon: User },
  { key: 'contact', label: 'Contact & Book', icon: Share2 },
  { key: 'privacy', label: 'Privacy Policy', icon: Lock },
  { key: 'terms', label: 'Terms of Representation', icon: Scale },
  { key: 'llms', label: 'llms.txt Manifest', icon: Bot },
];

export default function AdminPagesManagement() {
  const [pages, setPages] = useState<PagesRegistry>(defaultPagesRegistry);
  const [activeTab, setActiveTab] = useState<PageKey>('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<number | null>(null);
  const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
  const [portraitPickerOpen, setPortraitPickerOpen] = useState(false);
  const portraitFileInputRef = useRef<HTMLInputElement>(null);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages', { cache: 'no-store' });
      const data = await res.json();
      if (data?.pages) {
        setPages({
          ...defaultPagesRegistry,
          ...data.pages,
        });
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevisions = async (pageId: string) => {
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/pages?history=true&pageId=${pageId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.revisions) {
        setRevisions(data.revisions);
      }
    } catch (err) {
      console.error('Error loading revisions:', err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    loadRevisions(activeTab);
  }, [activeTab]);

  const handleFieldChange = (field: keyof ManagedPageData, value: any) => {
    setPages((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleMetaChange = (metaKey: string, value: any) => {
    setPages((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        meta: {
          ...(prev[activeTab]?.meta || {}),
          [metaKey]: value,
        },
      },
    }));
  };

  const handleAddAccolade = () => {
    const current = pages.about?.meta?.accolades || [];
    handleMetaChange('accolades', [...current, 'New Award / Industry Honor (Year) — Description']);
  };

  const handleUpdateAccolade = (index: number, text: string) => {
    const current = [...(pages.about?.meta?.accolades || [])];
    current[index] = text;
    handleMetaChange('accolades', current);
  };

  const handleRemoveAccolade = (index: number) => {
    const current = [...(pages.about?.meta?.accolades || [])];
    current.splice(index, 1);
    handleMetaChange('accolades', current);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: activeTab,
          data: pages[activeTab],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save page');

      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_pages_updated'));
      }

      await loadRevisions(activeTab);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (revId: number) => {
    if (!confirm('Are you sure you want to rollback to this historical revision snapshot?')) {
      return;
    }

    setRollingBackId(revId);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          pageId: activeTab,
          revisionId: revId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed');

      if (data.pages) {
        setPages(data.pages);
      }

      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_pages_updated'));
      }

      await loadRevisions(activeTab);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Rollback error: ${err.message}`);
    } finally {
      setRollingBackId(null);
    }
  };

  const handleSyncFromTimeline = async () => {
    try {
      const res = await fetch('/api/timeline', { cache: 'no-store' });
      const json = await res.json();
      const items = [
        ...(Array.isArray(json?.data?.top) ? json.data.top : []),
        ...(Array.isArray(json?.data?.bottom) ? json.data.bottom : []),
      ];
      if (items.length > 0) {
        const formatted = items.map((it: any) => {
          const year = it.year ? `(${it.year})` : '';
          const title = (it.title || '').trim();
          let content = (it.content || '').trim();
          if (title && content) {
            const titleRegex = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(—|-|:)?\\s*`, 'i');
            content = content.replace(titleRegex, '');
            return `${title} ${year} — ${content}`.replace(/\s+/g, ' ').trim();
          }
          return `${title || content} ${year}`.trim();
        }).filter(Boolean);
        handleMetaChange('accolades', formatted);
      }
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    }
  };

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPortrait(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'about');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      handleMetaChange('portraitImage', data.url);
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploadingPortrait(false);
    }
  };

  const activePage = pages[activeTab] || defaultPagesRegistry[activeTab];

  if (loading) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading Page Management System...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadPages}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            title="Reload from server"
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            {savedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : `Save ${activePage.title}`}</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* Sleek Tab Navigation Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px',
            borderBottom: '1px solid var(--adm-border)',
          }}
        >
          {PAGE_KEYS.map((tab) => {
            const isSelected = activeTab === tab.key;
            const p = pages[tab.key];
            const isPub = p?.isPublished !== false;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px 8px 0 0',
                  border: isSelected ? '1px solid var(--adm-border)' : '1px solid transparent',
                  borderBottom: isSelected ? '2px solid var(--tail-primary)' : '1px solid transparent',
                  background: isSelected ? 'var(--adm-bg-card)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--adm-text-muted)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} style={{ color: isSelected ? 'var(--tail-primary)' : 'inherit' }} />
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    background: isPub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isPub ? '#34d399' : '#f87171',
                  }}
                >
                  {isPub ? 'Live' : 'Draft'}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSave}>
          <div className="adm-grid-2col">
            {/* Left Column: Form Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="adm-card">
                <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Content &amp; Page Details: {activePage.title}</span>
                  </div>
                  <a
                    href={activePage.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <span>View Live Page</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>

                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="adm-form-group">
                      <label className="adm-label">Page Title (H1 Heading)</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={activePage.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Page Title"
                        required
                      />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Navigation / Footer Label</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={activePage.navLabel || ''}
                        onChange={(e) => handleFieldChange('navLabel', e.target.value)}
                        placeholder="Footer link text"
                        required
                      />
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      {activeTab === 'about'
                        ? 'Page Subheading / Tagline Banner'
                        : 'Subheading / Kicker'}
                    </label>
                    <input
                      type="text"
                      className="adm-input"
                      value={activePage.subheading || ''}
                      onChange={(e) => handleFieldChange('subheading', e.target.value)}
                      placeholder={
                        activeTab === 'about'
                          ? 'Silver-Screen Dhallywood Actress, Television Reality Judge & Cultural Fashion Icon'
                          : 'Page subtitle or status kicker...'
                      }
                    />
                    {activeTab === 'about' && (
                      <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block' }}>
                        Controls the prominent tagline: "Silver-Screen Dhallywood Actress, Television Reality Judge & Cultural Fashion Icon" on /about.
                      </span>
                    )}
                  </div>

                  {/* Main Content Area */}
                  <div className="adm-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="adm-label" style={{ margin: 0 }}>
                        {activeTab === 'llms'
                          ? 'Plaintext Manifest Body (Markdown Format)'
                          : activeTab === 'privacy' || activeTab === 'terms'
                          ? 'Legal & Policy Terms (Markdown Formatted)'
                          : 'Main Story & Overview Body'}
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                        {(activePage.content || '').length} characters • {(activePage.content || '').split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      className="adm-textarea"
                      rows={activeTab === 'llms' || activeTab === 'privacy' || activeTab === 'terms' ? 14 : 5}
                      value={activePage.content || ''}
                      onChange={(e) => handleFieldChange('content', e.target.value)}
                      placeholder="Enter verified page content..."
                      style={{
                        fontFamily: activeTab === 'llms' ? 'monospace' : 'inherit',
                        fontSize: activeTab === 'llms' ? '12.5px' : '13.5px',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {/* Tab-Specific Rich Customization Sections */}
                  {activeTab === 'about' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px', borderTop: '1px solid var(--adm-border)' }}>
                      {/* Portrait Image Manager */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tail-primary)' }}>
                          About Page Featured Portrait Image
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '140px',
                              height: '170px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1px solid var(--adm-border)',
                              background: 'var(--adm-bg-page)',
                              position: 'relative',
                            }}
                          >
                            <img
                              src={activePage.meta?.portraitImage || '/images/hero.jpg'}
                              alt="About Portrait Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                              type="file"
                              ref={portraitFileInputRef}
                              onChange={handlePortraitUpload}
                              accept="image/*"
                              style={{ display: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => portraitFileInputRef.current?.click()}
                                disabled={isUploadingPortrait}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                              >
                                <Upload size={13} />
                                <span>{isUploadingPortrait ? 'Uploading...' : 'Upload Image'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPortraitPickerOpen(true)}
                                className="adm-btn adm-btn-secondary adm-btn-sm"
                              >
                                <FolderKanban size={13} />
                                <span>Media Library</span>
                              </button>
                            </div>
                            <div>
                              <label className="adm-label">Image URL / Path</label>
                              <input
                                type="text"
                                className="adm-input"
                                value={activePage.meta?.portraitImage || ''}
                                onChange={(e) => handleMetaChange('portraitImage', e.target.value)}
                                placeholder="/images/hero.jpg or /uploads/about/..."
                              />
                              <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginTop: '4px', display: 'block' }}>
                                Displays prominently as the main biographical portrait on /about.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tail-primary)', marginTop: '6px' }}>
                        Career Statistics (Highlights Grid)
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div>
                          <label className="adm-label">Feature Films</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={activePage.meta?.featureFilms || '10+'}
                            onChange={(e) => handleMetaChange('featureFilms', e.target.value)}
                            placeholder="10+"
                          />
                        </div>
                        <div>
                          <label className="adm-label">Babisas Award Year</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={activePage.meta?.babisasYear || '2019'}
                            onChange={(e) => handleMetaChange('babisasYear', e.target.value)}
                            placeholder="2019"
                          />
                        </div>
                        <div>
                          <label className="adm-label">DIFF Trophy Year</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={activePage.meta?.diffYear || '2024'}
                            onChange={(e) => handleMetaChange('diffYear', e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tail-primary)', display: 'block' }}>
                            Notable Accolades &amp; Honors
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                            Automatically synchronizes with your awards from Admin &gt; Awards &amp; Milestones (Timeline).
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleSyncFromTimeline}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            title="Load latest awards from Timeline"
                          >
                            <RefreshCw size={12} />
                            <span>Sync from Awards</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleAddAccolade}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            <Plus size={12} />
                            <span>Add Custom</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(activePage.meta?.accolades || []).map((accolade: string, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="adm-input"
                              value={accolade}
                              onChange={(e) => handleUpdateAccolade(idx, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAccolade(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '6px',
                              }}
                              title="Delete honor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--adm-border)' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tail-primary)' }}>
                        Management Office &amp; Booking Contacts
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label className="adm-label">Booking &amp; Casting Email</label>
                          <input
                            type="email"
                            className="adm-input"
                            value={activePage.meta?.managementEmail || 'booking@shirinshila.com'}
                            onChange={(e) => handleMetaChange('managementEmail', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="adm-label">Press &amp; Media Email</label>
                          <input
                            type="email"
                            className="adm-input"
                            value={activePage.meta?.pressEmail || 'press@shirinshila.com'}
                            onChange={(e) => handleMetaChange('pressEmail', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label className="adm-label">Telephone / WhatsApp</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={activePage.meta?.phone || '+880 1711-000000'}
                            onChange={(e) => handleMetaChange('phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="adm-label">Representation Base</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={activePage.meta?.representationBase || 'Dhaka, Bangladesh (Available for Worldwide Shoots)'}
                            onChange={(e) => handleMetaChange('representationBase', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group">
                        <label className="adm-label">Turnaround Guarantee</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={activePage.meta?.turnaroundTime || 'All verified casting inquiries answered within 24-48 business hours'}
                          onChange={(e) => handleMetaChange('turnaroundTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* SEO Meta Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--adm-border)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tail-primary)' }}>
                      Search Engine Metadata Override (Optional)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label className="adm-label">Meta Title</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={activePage.seoTitle || ''}
                          onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                          placeholder="Page custom title"
                        />
                      </div>
                      <div>
                        <label className="adm-label">Meta Description</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={activePage.seoDescription || ''}
                          onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                          placeholder="Search snippet description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Status, Live Controls & Revision History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Publication Status Card */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Publication &amp; Live Status</span>
                  </div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#090d16',
                      borderRadius: '8px',
                      border: '1px solid var(--adm-border)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#ffffff', display: 'block' }}>
                        Live Public State
                      </strong>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: activePage.isPublished ? '#34d399' : '#f87171',
                        }}
                      >
                        {activePage.isPublished ? '● Published (Active Live)' : '○ Offline (Draft / 404)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFieldChange('isPublished', !activePage.isPublished)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        background: activePage.isPublished ? '#065f46' : '#7f1d1d',
                        color: '#ffffff',
                      }}
                    >
                      {activePage.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{activePage.isPublished ? 'Turn Offline' : 'Publish Live'}</span>
                    </button>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', lineHeight: 1.5 }}>
                    {activeTab === 'llms'
                      ? 'When Published, /llms.txt serves the machine manifest to AI agents and is listed in sitemap.xml. When Offline, it returns HTTP 404.'
                      : 'Changes are written atomically to MySQL database and local persistent files with rolling backups.'}
                  </span>

                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--adm-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', display: 'block' }}>Route Slug</span>
                    <code style={{ fontSize: '12px', color: 'var(--tail-primary)' }}>{activePage.slug}</code>
                  </div>
                </div>
              </div>

              {/* Revision History & Recovery Card */}
              <div className="adm-card">
                <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={16} style={{ color: 'var(--tail-primary)' }} />
                    <span className="adm-card-title">Revision Recovery</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadRevisions(activeTab)}
                    disabled={loadingRevisions}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ padding: '4px 8px' }}
                    title="Reload revision snapshots"
                  >
                    <RefreshCw size={12} className={loadingRevisions ? 'adm-spin' : ''} />
                  </button>
                </div>
                <div className="adm-card-body">
                  {loadingRevisions ? (
                    <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                      Loading revisions...
                    </div>
                  ) : revisions.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)', textAlign: 'center', padding: '12px 0' }}>
                      No prior revisions recorded. Every save creates an automated snapshot.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {revisions.map((rev) => (
                        <div
                          key={rev.id}
                          style={{
                            background: '#090d16',
                            border: '1px solid var(--adm-border)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tail-primary)' }}>
                              Rev #{rev.revisionNum}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                              {new Date(rev.createdAt).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#71717a' }}>
                              By {rev.savedBy}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={rollingBackId === rev.id}
                            onClick={() => handleRollback(rev.id)}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }}
                            title="Rollback to this snapshot"
                          >
                            <RotateCcw size={11} className={rollingBackId === rev.id ? 'adm-spin' : ''} />
                            <span>Rollback</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <MediaPickerModal
        isOpen={portraitPickerOpen}
        onClose={() => setPortraitPickerOpen(false)}
        onSelect={(url) => {
          handleMetaChange('portraitImage', url);
          setPortraitPickerOpen(false);
        }}
        targetFolder="about"
      />
    </>
  );
}
