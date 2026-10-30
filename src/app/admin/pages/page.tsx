"use client";

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RefreshCw,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Lock,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PagesRegistry, defaultPagesRegistry, ManagedPageData } from '@/data/pages';

type PageKey = keyof PagesRegistry;

const PAGE_KEYS: PageKey[] = ['about', 'contact', 'privacy', 'terms', 'llms'];

const PAGE_DESCRIPTIONS: Record<PageKey, string> = {
  about: 'Public biography, screen credentials, and silver-screen awards profile.',
  contact: 'Official representation desk, booking inquiry intake, and agent channels.',
  privacy: 'Data protection, script confidentiality, and inquiry retention terms.',
  terms: 'Talent representation scope, booking retainers, and AI likeness protections.',
  llms: 'Factual plain-text context manifest for AI crawlers and LLM search agents.',
};

export default function AdminPagesManagement() {
  const [pages, setPages] = useState<PagesRegistry>(defaultPagesRegistry);
  const [activeTab, setActiveTab] = useState<PageKey>('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<number | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save page');
      }

      setSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_pages_updated'));
      }

      // Reload revisions after save
      await loadRevisions(activeTab);

      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (revId: number) => {
    if (!confirm('Are you sure you want to rollback to this historical revision? Current edits will be superseded.')) {
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
      if (!res.ok) {
        throw new Error(data.error || 'Rollback failed');
      }

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

  const activePage = pages[activeTab] || defaultPagesRegistry[activeTab];

  if (loading) {
    return (
      <div className="adm-page-loading">
        <RefreshCw className="adm-spin" size={32} />
        <span>Loading Page Management System...</span>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <div className="adm-breadcrumbs">
            <span>Admin</span> / <span>CMS</span> / <span>Pages Management</span>
          </div>
          <h1 className="adm-title">Pages &amp; Policy Management</h1>
          <p className="adm-subtitle">
            Centralized control for official public pages, representation terms, booking intake, privacy disclosures, and AI agent manifests.
          </p>
        </div>

        <div className="adm-actions">
          <button
            type="button"
            onClick={loadPages}
            className="adm-btn adm-btn-secondary"
            title="Refresh from server"
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="adm-btn adm-btn-primary"
          >
            {saving ? (
              <>
                <RefreshCw className="adm-spin" size={15} />
                <span>Saving to MySQL...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check size={15} color="#10b981" />
                <span>Saved &amp; Published!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save {activePage.title}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pages Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {PAGE_KEYS.map((key) => {
          const p = pages[key];
          const isSelected = activeTab === key;
          const isPub = p?.isPublished !== false;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={{
                background: isSelected ? '#1e1b4b' : '#18181b',
                border: isSelected ? '2px solid #8b5cf6' : '1px solid #27272a',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#ffffff' : '#e4e4e7' }}>
                  {p?.title || key}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: isPub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isPub ? '#34d399' : '#f87171',
                  }}
                >
                  {isPub ? 'Published' : 'Draft / Off'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                {p?.slug}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        {/* Editor Column */}
        <form onSubmit={handleSave} className="adm-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #27272a' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#ec4899" />
                <span>Editing: {activePage.title}</span>
              </h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0' }}>
                {PAGE_DESCRIPTIONS[activeTab]}
              </p>
            </div>

            <a
              href={activePage.slug}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#ec4899',
                textDecoration: 'none',
                background: 'rgba(236, 72, 153, 0.1)',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              <span>View Live</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* llms.txt Specific Notice Banner */}
          {activeTab === 'llms' && (
            <div style={{ background: '#1c1917', border: '1px solid #f97316', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="#fb923c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#fdba74', display: 'block' }}>
                  Default Publication Policy: OFF (Strict 404)
                </strong>
                <p style={{ fontSize: '13px', color: '#fed7aa', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Per non-negotiable security requirements, when publication is <strong>OFF</strong>, requests to <code>/llms.txt</code> return a strict 404 response, and the manifest is completely hidden from the footer navigation and <code>sitemap.xml</code>. When set to <strong>ON</strong>, the approved manifest text below is served.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="adm-label">Page Title (Header H1 &amp; Display)</label>
              <input
                type="text"
                className="adm-input"
                value={activePage.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Page Title"
                required
              />
            </div>

            <div>
              <label className="adm-label">Navigation / Footer Label</label>
              <input
                type="text"
                className="adm-input"
                value={activePage.navLabel || ''}
                onChange={(e) => handleFieldChange('navLabel', e.target.value)}
                placeholder="Footer Link Text"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="adm-label" style={{ margin: 0 }}>
                {activeTab === 'llms' ? 'Manifest Content (Plain Text / Markdown)' : 'Page Body Content (Markdown Supported)'}
              </label>
              <span style={{ fontSize: '12px', color: '#71717a' }}>
                {(activePage.content || '').length} characters • {(activePage.content || '').split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              className="adm-input"
              rows={activeTab === 'llms' || activeTab === 'privacy' || activeTab === 'terms' ? 18 : 6}
              value={activePage.content || ''}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder="Enter approved page content..."
              style={{
                fontFamily: activeTab === 'llms' ? 'monospace' : 'inherit',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label className="adm-label">SEO Meta Title (Optional)</label>
              <input
                type="text"
                className="adm-input"
                value={activePage.seoTitle || ''}
                onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                placeholder="Custom title tag for search engines"
              />
            </div>

            <div>
              <label className="adm-label">SEO Meta Description (Optional)</label>
              <input
                type="text"
                className="adm-input"
                value={activePage.seoDescription || ''}
                onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                placeholder="Custom description tag"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
            <div style={{ fontSize: '12px', color: '#71717a' }}>
              Last synchronized: {activePage.updatedAt ? new Date(activePage.updatedAt).toLocaleString() : 'System Default'}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="adm-btn adm-btn-primary"
            >
              {saving ? (
                <>
                  <RefreshCw className="adm-spin" size={15} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save &amp; Persist Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sidebar Settings & Revisions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Publication Control Card */}
          <div className="adm-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#ec4899" />
              <span>Publication Control</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#09090b', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block' }}>
                    Public State
                  </strong>
                  <span style={{ fontSize: '12px', color: activePage.isPublished ? '#34d399' : '#f87171' }}>
                    {activePage.isPublished ? '● Published (Active)' : '○ Offline / Draft'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleFieldChange('isPublished', !activePage.isPublished)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: activePage.isPublished ? '#065f46' : '#7f1d1d',
                    color: '#ffffff',
                  }}
                >
                  {activePage.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{activePage.isPublished ? 'Live' : 'Hidden'}</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5 }}>
                {activeTab === 'llms' ? (
                  <span>
                    When <strong>Hidden</strong>, <code>/llms.txt</code> returns HTTP 404, preventing crawling or premature indexing.
                  </span>
                ) : (
                  <span>
                    Changes are automatically backed up to MySQL revision tables and local persistent disks.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Historical Revisions & Rollback Card */}
          <div className="adm-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="#ec4899" />
                <span>Revision Recovery</span>
              </h3>
              <button
                type="button"
                onClick={() => loadRevisions(activeTab)}
                disabled={loadingRevisions}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0 }}
                title="Reload history"
              >
                <RefreshCw size={13} className={loadingRevisions ? 'adm-spin' : ''} />
              </button>
            </div>

            {loadingRevisions ? (
              <div style={{ fontSize: '13px', color: '#71717a', textAlign: 'center', padding: '16px 0' }}>
                Loading revisions...
              </div>
            ) : revisions.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#71717a', textAlign: 'center', padding: '16px 0' }}>
                No revisions logged yet. Save changes to create revision checkpoints.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f43f5e' }}>
                        Rev #{rev.revisionNum}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#71717a' }}>
                        By {rev.savedBy}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={rollingBackId === rev.id}
                      onClick={() => handleRollback(rev.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(236, 72, 153, 0.1)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: '#ec4899',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Rollback to this snapshot"
                    >
                      <RotateCcw size={12} className={rollingBackId === rev.id ? 'adm-spin' : ''} />
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
  );
}

