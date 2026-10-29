"use client";

import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Link2,
  RefreshCw,
  Play,
  X,
  Check,
} from 'lucide-react';
import { ShowreelItem } from '@/data/showreel';

export default function AdminShowreelPage() {
  const [items, setItems] = useState<ShowreelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-import form state
  const [ytUrl, setYtUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Modal / Add / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShowreelItem | null>(null);
  const [formData, setFormData] = useState<Partial<ShowreelItem>>({
    title: '',
    banglaTitle: '',
    category: 'Master Acting Reel',
    duration: '3:00',
    youtubeId: '',
    thumbnail: '',
    year: '2026',
    director: '',
    coStar: '',
    description: '',
    sceneHighlight: '',
  });

  const loadShowreels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/showreels');
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error('Error fetching showreels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowreels();
  }, []);

  // YouTube auto fetcher
  const handleYoutubeAutoImport = async () => {
    if (!ytUrl.trim()) return;
    setIsImporting(true);
    setImportNotice(null);

    try {
      const res = await fetch(`/api/youtube-meta?url=${encodeURIComponent(ytUrl.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to detect video');
      }

      setFormData({
        title: data.title || '',
        youtubeId: data.videoId,
        thumbnail: data.thumbnail || '',
        duration: '3:30',
        category: 'Cinema Performance Reel',
        year: new Date().getFullYear().toString(),
        description: `Featured performance by Shirin Shila. (${data.author})`,
        sceneHighlight: 'Dialogue delivery, emotional conflict, and dramatic presence.',
      });

      setIsModalOpen(true);
      setImportNotice(`✓ Successfully fetched details for: "${data.title}"`);
      setYtUrl('');
    } catch (err: any) {
      alert(`Auto-import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      banglaTitle: '',
      category: 'Master Acting Reel',
      duration: '3:00',
      youtubeId: '',
      thumbnail: '/images/gallery-3.jpg',
      year: new Date().getFullYear().toString(),
      director: '',
      coStar: '',
      description: '',
      sceneHighlight: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ShowreelItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtubeId) {
      alert('Video title and YouTube ID are required.');
      return;
    }

    try {
      if (editingItem) {
        // Update existing
        const res = await fetch('/api/showreels', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        // Create new
        const res = await fetch('/api/showreels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_showreels_updated'));
        localStorage.setItem('shirin_shila_sync_showreels', Date.now().toString());
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_showreels_updated'));
        localStorage.setItem('shirin_shila_sync_showreels', Date.now().toString());
      }
      loadShowreels();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete video "${title}" from showreel?`)) return;

    try {
      const res = await fetch(`/api/showreels?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_showreels_updated'));
        localStorage.setItem('shirin_shila_sync_showreels', Date.now().toString());
      }
      loadShowreels();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button type="button" onClick={handleOpenAddModal} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={13} />
            <span>Add Showreel Manually</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* YouTube Automatic Importer Box */}
        <div className="adm-fetch-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link2 size={16} color="#3b82f6" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--adm-text-primary)' }}>
              Automatic YouTube Video Importer
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--adm-text-muted)', margin: '0 0 12px' }}>
            Paste any YouTube video link (watch, share link, or shorts). System will auto-fetch the title, high-res thumbnail, and generate embed codes instantly.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="adm-input"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=81k39lq5g7M or https://youtu.be/..."
            />
            <button
              type="button"
              onClick={handleYoutubeAutoImport}
              disabled={isImporting || !ytUrl.trim()}
              className="adm-btn adm-btn-primary"
              style={{ flexShrink: 0 }}
            >
              {isImporting ? 'Fetching YouTube Info...' : 'Auto-Import Video'}
            </button>
          </div>

          {importNotice && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>
              {importNotice}
            </div>
          )}
        </div>

        {/* Showreel Videos Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">Active Showreels ({items.length})</span>
            <button type="button" onClick={loadShowreels} className="adm-btn adm-btn-secondary adm-btn-sm">
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Video Preview</th>
                  <th>Title & Info</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: '130px' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '110px',
                          height: '62px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#1f1f23',
                          border: '1px solid var(--adm-border)',
                        }}
                      >
                        <img
                          src={item.thumbnail || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : '/images/gallery-3.jpg')}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/gallery-3.jpg';
                          }}
                        />
                        <a
                          href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                          }}
                          title="Watch on YouTube"
                        >
                          <Play size={16} />
                        </a>
                      </div>
                    </td>
                    <td className="strong">
                      <div>{item.title}</div>
                      {item.banglaTitle && (
                        <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                          {item.banglaTitle}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'var(--adm-font-mono)' }}>
                        YT ID: {item.youtubeId}
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-neutral">{item.category}</span>
                    </td>
                    <td>{item.duration || '—'}</td>
                    <td>{item.year}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          title="Edit Showreel"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete Video"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No videos in showreel. Paste a YouTube URL above to import.
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
                {editingItem ? 'Edit Showreel Video' : 'Add New Showreel Video'}
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
                <div className="adm-form-group">
                  <label className="adm-label">YouTube Video ID (11 characters) *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    value={formData.youtubeId || ''}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value.trim() })}
                    placeholder="e.g. 81k39lq5g7M"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Video Title (English) *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Bangla Title (Optional)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.banglaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, banglaTitle: e.target.value })}
                  />
                </div>

                <div className="adm-grid-2fields">
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Psychological Thriller"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Duration</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 2:48"
                    />
                  </div>
                </div>

                <div className="adm-grid-2fields">
                  <div className="adm-form-group">
                    <label className="adm-label">Year</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Co-Stars / Director</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.coStar || ''}
                      onChange={(e) => setFormData({ ...formData, coStar: e.target.value })}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Description / Synopsis</label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Performance / Scene Highlights</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.sceneHighlight || ''}
                    onChange={(e) => setFormData({ ...formData, sceneHighlight: e.target.value })}
                    placeholder="e.g. Dialogue delivery, emotional climax, romantic tension"
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
                  {editingItem ? 'Save Changes' : 'Add to Showreel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
