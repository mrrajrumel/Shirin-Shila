"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Link2,
  Globe,
  RefreshCw,
  ExternalLink,
  X,
  Video,
  FileImage,
} from 'lucide-react';
import { PressItem, PressKind } from '@/data/press';

export default function AdminPressPage() {
  const [items, setItems] = useState<PressItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Auto-fetcher states
  const [newsLinkInput, setNewsLinkInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeNotice, setScrapeNotice] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PressItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PressItem>>({
    publication: '',
    headline: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    kind: 'News article',
    image: '/images/gallery-1.jpg',
    url: '',
    excerpt: '',
  });

  const loadPress = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/press');
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error('Error fetching press items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPress();
  }, []);

  // 1. Auto-fetch online news article metadata
  const handleAutoFetchNews = async () => {
    if (!newsLinkInput.trim()) return;
    setIsScraping(true);
    setScrapeNotice(null);

    try {
      const res = await fetch(`/api/scrape-meta?url=${encodeURIComponent(newsLinkInput.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not fetch metadata from link');
      }

      setFormData({
        kind: 'News article',
        headline: data.title || '',
        publication: data.publisher || '',
        date: data.date || '',
        image: data.image || '/images/gallery-1.jpg',
        url: data.url || newsLinkInput.trim(),
        excerpt: data.description || '',
      });

      setIsModalOpen(true);
      setScrapeNotice(`✓ Successfully imported: "${data.title}" from ${data.publisher}`);
      setNewsLinkInput('');
    } catch (err: any) {
      alert(`Auto-fetch error: ${err.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  // 2. Direct upload for newspaper clippings
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'press');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormData((prev) => ({
        ...prev,
        image: data.url,
      }));
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. YouTube video interview importer for press
  const handleYoutubeFetchForPress = async (url: string) => {
    if (!url.trim()) return;
    try {
      const res = await fetch(`/api/youtube-meta?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          headline: prev.headline || data.title,
          publication: prev.publication || data.author || 'YouTube Video Feature',
          image: data.thumbnail,
          url: data.youtubeUrl,
        }));
      }
    } catch (err) {
      console.error('YouTube fetch for press error:', err);
    }
  };

  const handleOpenAddModal = (initialKind: PressKind = 'News article') => {
    setEditingItem(null);
    setFormData({
      publication: '',
      headline: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      kind: initialKind,
      image: initialKind === 'Newspaper clipping' ? '/images/newspaper-cut-1.jpg' : '/images/gallery-1.jpg',
      url: '',
      excerpt: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PressItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline || !formData.publication) {
      alert('Headline and Publication name are required.');
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch('/api/press', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch('/api/press', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_press_updated'));
        localStorage.setItem('shirin_shila_sync_press', Date.now().toString());
      }
      loadPress();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, headline: string) => {
    if (!confirm(`Delete press item: "${headline}"?`)) return;

    try {
      const res = await fetch(`/api/press?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_press_updated'));
        localStorage.setItem('shirin_shila_sync_press', Date.now().toString());
      }
      loadPress();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true;
    return item.kind === filter;
  });

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={() => handleOpenAddModal('Newspaper clipping')}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Upload size={13} />
            <span>Upload Newspaper Clipping</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal('News article')}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            <Plus size={13} />
            <span>Add Press Item</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* Online News URL Auto-Importer Box */}
        <div className="adm-fetch-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Globe size={16} color="#3b82f6" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--adm-text-primary)' }}>
              Universal Auto-Importer (Links or Words / Keywords)
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '0 0 12px' }}>
            Paste any article URL, video link, or simply type keywords / article topic (e.g. <em>&quot;Shirin Shila Hitman&quot;</em>, <em>&quot;Shirin Shila Prothom Alo&quot;</em>). The system automatically fetches or generates the headline, publication source, date, and image.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="adm-input"
              value={newsLinkInput}
              onChange={(e) => setNewsLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAutoFetchNews();
                }
              }}
              placeholder="Paste any URL or type keywords (e.g. Shirin Shila Hitman / https://...)"
            />
            <button
              type="button"
              onClick={handleAutoFetchNews}
              disabled={isScraping || !newsLinkInput.trim()}
              className="adm-btn adm-btn-primary"
              style={{ flexShrink: 0 }}
            >
              {isScraping ? 'Auto-Fetching...' : 'Auto-Import'}
            </button>
          </div>

          {scrapeNotice && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>
              {scrapeNotice}
            </div>
          )}
        </div>

        {/* Kind Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['All', 'News article', 'Newspaper clipping', 'Interview', 'Feature'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`adm-btn adm-btn-sm ${filter === k ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Press Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">
              Press Coverage Records ({filteredItems.length})
            </span>
            <button type="button" onClick={loadPress} className="adm-btn adm-btn-secondary adm-btn-sm">
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Headline & Publication</th>
                  <th>Kind / Format</th>
                  <th>Date</th>
                  <th>Article Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: '80px' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '46px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#18181b',
                          border: '1px solid var(--adm-border)',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.headline}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td className="strong">
                      <div>{item.headline}</div>
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                        {item.publication}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          item.kind === 'Newspaper clipping'
                            ? 'adm-badge-amber'
                            : item.kind === 'Interview'
                            ? 'adm-badge-blue'
                            : 'adm-badge-neutral'
                        }`}
                      >
                        {item.kind}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500 }}
                        >
                          <span>Open Link</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          title="Edit Press Item"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.headline)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete Item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No press records in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">
                {editingItem ? 'Edit Press Record' : 'Add New Press Record'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="adm-modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {/* Kind Selector */}
                <div className="adm-form-group">
                  <label className="adm-label">Press Category / Format *</label>
                  <select
                    className="adm-select"
                    value={formData.kind || 'News article'}
                    onChange={(e) => {
                      const newKind = e.target.value as PressKind;
                      setFormData({ ...formData, kind: newKind });
                    }}
                  >
                    <option value="News article">News article (Online news publication)</option>
                    <option value="Newspaper clipping">Newspaper clipping (Scanned print clipping)</option>
                    <option value="Interview">Interview (TV / Online talk show)</option>
                    <option value="Feature">Feature (Editorial special profile)</option>
                  </select>
                </div>

                {/* Media Image / Upload Section */}
                <div className="adm-form-group">
                  <label className="adm-label">
                    {formData.kind === 'Newspaper clipping'
                      ? 'Scanned Newspaper Clipping Image (Direct Upload)'
                      : 'Article Image / Lead Photo'}
                  </label>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '70px',
                        height: '52px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        background: '#18181b',
                        border: '1px solid var(--adm-border)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={formData.image || '/images/gallery-1.jpg'}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <Upload size={13} />
                        <span>{isUploading ? 'Uploading...' : 'Upload Image from Computer'}</span>
                      </button>

                      <input
                        type="text"
                        className="adm-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Image URL or local path"
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Headline / Title *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    value={formData.headline || ''}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g. সেরা অভিনেত্রীর সম্মান পেলেন শিরীন শিলা"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Publication Name *</label>
                    <input
                      type="text"
                      required
                      className="adm-input"
                      value={formData.publication || ''}
                      onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                      placeholder="e.g. Prothom Alo / দৈনিক প্রথম আলো"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Publication Date</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. 19 January 2024"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Article / Video URL (Optional)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.url || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, url: val });
                      if (formData.kind === 'Interview' && val.includes('youtube')) {
                        handleYoutubeFetchForPress(val);
                      }
                    }}
                    placeholder="e.g. https://www.prothomalo.com/entertainment/..."
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Excerpt / Brief Quote</label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Optional summary or notable quotation from the article..."
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="adm-btn adm-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {editingItem ? 'Save Changes' : 'Add to Press Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
