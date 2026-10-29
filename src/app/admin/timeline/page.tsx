"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  Upload,
  Search,
  Check,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { JourneyItem, Month, monthOrder } from '@/data/timeline';

const monthsList: Month[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function AdminTimelinePage() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JourneyItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    year: string;
    month: Month;
    title: string;
    content: string;
    image: string;
  }>({
    year: new Date().getFullYear().toString(),
    month: 'January',
    title: '',
    content: '',
    image: '/images/award-trophy-gala.jpg',
  });

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline', { cache: 'no-store' });
      const data = await res.json();
      if (data.data && Array.isArray(data.data.items)) {
        setItems(data.data.items);
      } else if (data.data) {
        const combined = [
          ...(Array.isArray(data.data.top) ? data.data.top : []),
          ...(Array.isArray(data.data.bottom) ? data.data.bottom : []),
        ];
        // Sort oldest to newest
        combined.sort((a, b) => {
          const yA = parseInt(a.year, 10) || 0;
          const yB = parseInt(b.year, 10) || 0;
          if (yA !== yB) return yA - yB;
          return (monthOrder[a.month as Month] || 0) - (monthOrder[b.month as Month] || 0);
        });
        setItems(combined);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'awards');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      month: 'January',
      title: '',
      content: '',
      image: '/images/award-trophy-gala.jpg',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: JourneyItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      year: item.year,
      month: item.month,
      title: item.title || '',
      content: item.content,
      image: item.image || '/images/award-trophy-gala.jpg',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.content) {
      alert('Year and award description are required.');
      return;
    }

    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingItem ? editingItem.id : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      loadTimeline();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete award milestone "${label}"?`)) return;

    try {
      const res = await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      loadTimeline();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.year.includes(q) ||
      item.month.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      item.content.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadTimeline}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            <Plus size={13} />
            <span>Add Award / Honor</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* Search & Actions Bar */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '20px',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', width: '320px' }}>
            <input
              type="text"
              className="adm-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search award, year, or title..."
              style={{ paddingLeft: '34px' }}
            />
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--adm-text-muted)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="adm-badge adm-badge-blue"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Order: Oldest (1st) → Newest (Last)
            </span>
            <span
              className="adm-badge adm-badge-neutral"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Total: {items.length} Honors
            </span>
          </div>
        </div>

        {/* Unified Chronological Awards Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">
              Chronological Awards & Honors ({filteredItems.length})
            </span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th style={{ width: '90px' }}>Photo</th>
                  <th style={{ width: '140px' }}>Year & Month</th>
                  <th>Award / Honor Title & Citation</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--adm-text-muted)', fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'var(--adm-surface-raised)',
                          border: '1px solid var(--adm-border)',
                        }}
                      >
                        <img
                          src={item.image || '/images/award-trophy-gala.jpg'}
                          alt={item.title || item.year}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              '/images/award-trophy-gala.jpg';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span
                          className="adm-badge adm-badge-blue"
                          style={{ width: 'fit-content', fontWeight: 700 }}
                        >
                          {item.year}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)' }}>
                          {item.month}
                        </span>
                      </div>
                    </td>
                    <td>
                      {item.title && (
                        <strong
                          style={{
                            color: 'var(--adm-text-primary)',
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '13.5px',
                          }}
                        >
                          {item.title}
                        </strong>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'var(--adm-text-secondary)',
                          lineHeight: 1.45,
                        }}
                      >
                        {item.content}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          title="Edit Award"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item.id, item.title || `${item.year} ${item.month}`)
                          }
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete Award"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        padding: '36px',
                        color: 'var(--adm-text-muted)',
                      }}
                    >
                      No awards found matching &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Award Modal */}
      {isModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="adm-modal"
            style={{ maxWidth: '640px', width: '92vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <span className="adm-modal-title">
                {editingItem ? 'Edit Award & Honor' : 'Add Award & Honor'}
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
                {/* Award Photo Upload & Live Preview */}
                <div className="adm-form-group">
                  <label className="adm-label">Award / Trophy / Event Photo</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'var(--adm-surface-raised)',
                        border: '1.5px solid var(--adm-border)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={formData.image || '/images/award-trophy-gala.jpg'}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/images/award-trophy-gala.jpg';
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
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
                        <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      </button>
                      <input
                        type="text"
                        className="adm-input"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="/images/award-... or https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-grid-2fields">
                  <div className="adm-form-group">
                    <label className="adm-label">Award Year *</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2024"
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Month *</label>
                    <select
                      className="adm-select"
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: e.target.value as Month })
                      }
                    >
                      {monthsList.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Award / Honor Title</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Babisas Best Actress Award, DIFF Trophy..."
                  />
                  <span className="adm-help-text">
                    Short prominent headline of the laurel or prestigious ceremony
                  </span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Award Citation & Description *</label>
                  <textarea
                    className="adm-input adm-textarea"
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="e.g. Babisas Award Winner — Best Actress in a Leading Role for Begum Jaan..."
                    required
                  />
                  <span className="adm-help-text">
                    Full recognition details, category, and cinematic work cited.
                  </span>
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
                  {editingItem ? 'Save Changes' : 'Add Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
