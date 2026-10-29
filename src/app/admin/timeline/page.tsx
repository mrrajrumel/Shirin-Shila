"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Edit2, RefreshCw, X, ArrowUpRight, Upload } from 'lucide-react';
import { JourneyItem, Month, monthOrder } from '@/data/timeline';

export default function AdminTimelinePage() {
  const [topItems, setTopItems] = useState<JourneyItem[]>([]);
  const [bottomItems, setBottomItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: JourneyItem; track: 'top' | 'bottom' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    id?: string;
    year: string;
    month: Month;
    title?: string;
    content: string;
    image?: string;
    track: 'top' | 'bottom';
  }>({
    year: new Date().getFullYear().toString(),
    month: 'January',
    title: '',
    content: '',
    image: '/images/award-trophy-gala.jpg',
    track: 'top',
  });

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline', { cache: 'no-store' });
      const data = await res.json();
      if (data.data) {
        setTopItems(data.data.top || []);
        setBottomItems(data.data.bottom || []);
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

  const handleOpenAddModal = (track: 'top' | 'bottom' = 'top') => {
    setEditingItem(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      month: 'January',
      title: '',
      content: '',
      image: '/images/award-trophy-gala.jpg',
      track,
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
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      loadTimeline();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, year: string) => {
    if (!confirm(`Delete award milestone for ${year}?`)) return;

    try {
      const res = await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      loadTimeline();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const renderMilestoneList = (items: JourneyItem[], trackName: 'top' | 'bottom') => (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Award Photo</th>
            <th style={{ width: '150px' }}>Year & Month</th>
            <th>Award / Recognition Description</th>
            <th style={{ width: '80px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#1a111a',
                    border: '1px solid rgba(255, 63, 121, 0.3)',
                  }}
                >
                  <img
                    src={item.image || '/images/award-trophy-gala.jpg'}
                    alt={item.title || item.year}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </td>
              <td className="strong">
                <span className="adm-badge adm-badge-blue" style={{ marginRight: '6px' }}>
                  {item.year}
                </span>
                <span>{item.month}</span>
              </td>
              <td>
                {item.title && (
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                    {item.title}
                  </strong>
                )}
                <span>{item.content}</span>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.year)}
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  title="Delete Milestone"
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--adm-text-muted)' }}>
                No milestones in this track.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">Awards & Honors Timeline</h1>
        <div className="adm-header-actions">
          <button type="button" onClick={() => handleOpenAddModal('top')} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={13} />
            <span>Add Award / Honor</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Top Track (Serials & Acclaimed Features) */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <span className="adm-card-title">Top Timeline Track ({topItems.length})</span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                  Television serial breakthroughs, critical acting acclaim, and festival stages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddModal('top')}
                className="adm-btn adm-btn-secondary adm-btn-sm"
              >
                <Plus size={12} />
                <span>Add to Top Track</span>
              </button>
            </div>
            {renderMilestoneList(topItems, 'top')}
          </div>

          {/* Bottom Track (Blockbusters & Awards) */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div>
                <span className="adm-card-title">Bottom Timeline Track ({bottomItems.length})</span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                  Silver screen debut, Babisas Best Actress Award, and theatrical commercial milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddModal('bottom')}
                className="adm-btn adm-btn-secondary adm-btn-sm"
              >
                <Plus size={12} />
                <span>Add to Bottom Track</span>
              </button>
            </div>
            {renderMilestoneList(bottomItems, 'bottom')}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="adm-modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Add Award & Honor Milestone</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="adm-btn adm-btn-secondary adm-btn-sm"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {/* Award Photo Upload & Preview */}
                <div className="adm-form-group">
                  <label className="adm-label">Award / Trophy / Event Photo</label>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#1a111a',
                        border: '1px solid rgba(255, 63, 121, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={formData.image || '/images/award-trophy-gala.jpg'}
                        alt="Award Preview"
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
                        <span>{isUploading ? 'Uploading Image...' : 'Upload Award Photo'}</span>
                      </button>

                      <input
                        type="text"
                        className="adm-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Or path (/images/award-trophy-gala.jpg)"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Year *</label>
                    <input
                      type="text"
                      required
                      className="adm-input"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2024"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Month *</label>
                    <select
                      className="adm-select"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value as Month })}
                    >
                      {Object.keys(monthOrder).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Award Title (e.g. DIFF Best Actress Trophy)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Short Title / Name of the Award"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Track Position</label>
                  <select
                    className="adm-select"
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value as 'top' | 'bottom' })}
                  >
                    <option value="top">Top Track (DIFF, Babisas & Festival Trophies)</option>
                    <option value="bottom">Bottom Track (National Crests, Guild & Box Office)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Award Description / Milestone Citation *</label>
                  <textarea
                    required
                    className="adm-input adm-textarea"
                    rows={3}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="e.g. Won the prestigious Babisas Best Actress Award for titular performance in Begum Jaan"
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
                  Save Award Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
