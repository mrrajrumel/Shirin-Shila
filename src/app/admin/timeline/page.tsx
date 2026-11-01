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
  ArrowUpRight,
  FolderKanban,
  Trophy,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Save,
  Eye,
} from 'lucide-react';
import {
  JourneyItem,
  Month,
  monthOrder,
  computeTimelinePeriodLabel,
  TimelineMetaConfig,
  defaultTimelineMeta,
} from '@/data/timeline';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

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

  // Auto-populate search from query param (?q=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);
    }
  }, []);

  // Featured Intro Card & Dynamic Rotating Cover state
  const [meta, setMeta] = useState<TimelineMetaConfig>(defaultTimelineMeta);
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSavedSuccess, setMetaSavedSuccess] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [addCoverPickerOpen, setAddCoverPickerOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JourneyItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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

  // Calculate the active pool of cycling award images for live preview
  const previewCycleImages = React.useMemo(() => {
    const pool: string[] = [];

    // 1. Primary cover image
    const primary = (meta?.image && typeof meta.image === 'string' && meta.image.trim()) 
      ? meta.image.trim() 
      : '';

    if (primary && !primary.includes('placeholder') && !primary.includes('demo')) {
      pool.push(primary);
    }

    // 2. Extra showcase photos explicitly added by admin
    if (Array.isArray(meta?.images)) {
      for (const img of meta.images) {
        if (img && typeof img === 'string' && img.trim() && !img.includes('placeholder') && !img.includes('demo')) {
          if (!pool.includes(img.trim())) {
            pool.push(img.trim());
          }
        }
      }
    }

    // 3. Only include milestone photos if explicitly enabled by admin OR if pool is completely empty
    if (meta?.includeMilestonePhotos === true || pool.length === 0) {
      const fromItems = items
        .map((it) => it.image)
        .filter(
          (img): img is string =>
            Boolean(img && typeof img === 'string' && img.trim().length > 0 && !img.includes('placeholder') && !img.includes('demo'))
        );
      for (const img of fromItems) {
        if (!pool.includes(img)) {
          pool.push(img);
        }
      }
    }

    if (pool.length === 0) {
      return ['/images/award-trophy-stage.jpg', '/images/award-trophy-gala.jpg'];
    }

    return pool;
  }, [items, meta]);

  // Keep preview index in bounds
  useEffect(() => {
    if (previewIndex >= previewCycleImages.length) {
      setPreviewIndex(0);
    }
  }, [previewCycleImages.length, previewIndex]);

  // Preview cycle timer
  useEffect(() => {
    if (previewCycleImages.length <= 1) return;
    if (meta.autoRotate === false) return;
    const intervalSec = Math.max(2, meta.rotationInterval || 4);
    const t = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previewCycleImages.length);
    }, intervalSec * 1000);
    return () => clearInterval(t);
  }, [previewCycleImages.length, meta.autoRotate, meta.rotationInterval]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timeline', { cache: 'no-store' });
      const data = await res.json();
      if (data.data?.meta) {
        setMeta(data.data.meta);
      } else if (data.meta) {
        setMeta(data.meta);
      }

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

  const handleSaveMeta = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingMeta(true);
    setMetaSavedSuccess(false);

    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_meta', meta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save intro card settings');

      setMetaSavedSuccess(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_timeline_updated'));
        localStorage.setItem('shirin_shila_sync_timeline', Date.now().toString());
      }
      setTimeout(() => setMetaSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSavingMeta(false);
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
            onClick={handleSaveMeta}
            disabled={savingMeta}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ color: metaSavedSuccess ? '#22c55e' : 'var(--pink)' }}
          >
            {metaSavedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{savingMeta ? 'Saving Intro...' : metaSavedSuccess ? 'Intro Saved!' : 'Save Intro Card'}</span>
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
        {/* Featured Archive Intro Card & Dynamic Background Showcase */}
        <div className="adm-card" style={{ marginBottom: '24px', borderColor: 'rgba(255, 63, 121, 0.25)' }}>
          <div
            className="adm-card-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(255, 63, 121, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--pink)',
                }}
              >
                <Trophy size={16} />
              </div>
              <div>
                <span className="adm-card-title" style={{ fontSize: '15px' }}>
                  Awards Archive Intro Card &amp; Dynamic Background Cover
                </span>
                <span className="adm-help-text" style={{ margin: 0 }}>
                  Customize the front-facing trophy banner and configure continuous auto-cycling background cover images.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveMeta}
              disabled={savingMeta}
              className="adm-btn adm-btn-primary adm-btn-sm"
            >
              {metaSavedSuccess ? <Check size={13} /> : <Save size={13} />}
              <span>{savingMeta ? 'Saving...' : metaSavedSuccess ? 'Saved Live!' : 'Save Intro Settings'}</span>
            </button>
          </div>

          <div className="adm-card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Form Settings */}
              <div>
                {/* Section Header Controls */}
                <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--adm-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    1. Main Section Heading & Kicker
                  </div>
                  <div className="adm-grid-2fields">
                    <div className="adm-form-group">
                      <label className="adm-label">Section Kicker</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={meta.kicker || 'Career Milestones'}
                        onChange={(e) => setMeta({ ...meta, kicker: e.target.value })}
                        placeholder="e.g. Career Milestones"
                      />
                      <span className="adm-help-text">Small subtitle badge above the main title</span>
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Section Title</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={meta.title || 'Awards & Honors Archive'}
                        onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                        placeholder="e.g. Awards & Honors Archive"
                      />
                      <span className="adm-help-text">Main section heading on front-end</span>
                    </div>
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-label">Section Subtitle</label>
                    <textarea
                      className="adm-input adm-textarea"
                      rows={2}
                      value={meta.sectionSubtitle || ''}
                      onChange={(e) => setMeta({ ...meta, sectionSubtitle: e.target.value })}
                      placeholder="e.g. Chronological journey of prestigious Dhallywood awards..."
                    />
                    <span className="adm-help-text">Descriptive editorial sentence below heading</span>
                  </div>
                </div>

                {/* Intro Card Controls */}
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  2. Featured Intro Card (Recognized Excellence)
                </div>

                <div className="adm-grid-2fields">
                  <div className="adm-form-group">
                    <label className="adm-label">Intro Card Badge *</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={meta.badge || 'Dhallywood Honors'}
                      onChange={(e) => setMeta({ ...meta, badge: e.target.value })}
                      placeholder="e.g. Dhallywood Honors"
                    />
                    <span className="adm-help-text">Small uppercase tag above the card title</span>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Card Headline Title *</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={meta.cardTitle || 'Recognized Excellence'}
                      onChange={(e) => setMeta({ ...meta, cardTitle: e.target.value })}
                      placeholder="e.g. Recognized Excellence"
                    />
                    <span className="adm-help-text">Prominent card serif headline</span>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Card Accolade Description *</label>
                  <textarea
                    className="adm-input adm-textarea"
                    rows={2}
                    value={meta.cardSubtitle || ''}
                    onChange={(e) => setMeta({ ...meta, cardSubtitle: e.target.value })}
                    placeholder="e.g. Honoring a decade of memorable cinematic performances..."
                  />
                  <span className="adm-help-text">Editorial text rendered in the intro card</span>
                </div>

                {/* Primary Cover Image */}
                <div className="adm-form-group">
                  <label className="adm-label">Primary Featured Cover Image *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#09050b',
                        border: '1px solid var(--adm-border)',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meta.image || '/uploads/timeline/whatsapp-image-2026-10-28-at-4-1793518045150-j95n.jpeg'}
                        alt="Primary Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/award-trophy-stage.jpg';
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setCoverPickerOpen(true)}
                          className="adm-btn adm-btn-primary adm-btn-sm"
                        >
                          <FolderKanban size={13} />
                          <span>Choose from Media Library</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        className="adm-input"
                        value={meta.image || ''}
                        onChange={(e) => setMeta({ ...meta, image: e.target.value })}
                        placeholder="/uploads/timeline/... or /images/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Auto-Rotation Controls */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--adm-surface-raised)',
                    border: '1px solid var(--adm-border)',
                    marginTop: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--adm-text)' }}>
                        Dynamic Auto-Cycling Background Cover
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                        Smoothly crossfades between showcase award photos without any flickering or glitch
                      </div>
                    </div>

                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={meta.autoRotate !== false}
                        onChange={(e) => setMeta({ ...meta, autoRotate: e.target.checked })}
                      />
                      <span>{meta.autoRotate !== false ? 'Auto-Cycle ON' : 'Auto-Cycle OFF'}</span>
                    </label>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                      Transition Interval:
                    </span>
                    <select
                      className="adm-select"
                      style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
                      value={meta.rotationInterval || 4}
                      onChange={(e) =>
                        setMeta({ ...meta, rotationInterval: parseInt(e.target.value, 10) || 4 })
                      }
                    >
                      <option value={2}>Fast (2 seconds)</option>
                      <option value={3}>Smooth (3 seconds)</option>
                      <option value={4}>Standard (4 seconds)</option>
                      <option value={5}>Cinematic (5 seconds)</option>
                      <option value={6}>Relaxed (6 seconds)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setAddCoverPickerOpen(true)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ marginLeft: 'auto' }}
                    >
                      <Plus size={12} />
                      <span>Add Extra Showcase Photo</span>
                    </button>
                  </div>

                  {/* Include milestone items toggle */}
                  <div
                    style={{
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--adm-text-muted)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={meta.includeMilestonePhotos === true}
                        onChange={(e) => setMeta({ ...meta, includeMilestonePhotos: e.target.checked })}
                      />
                      <span>Also include all milestone timeline photos in background rotation</span>
                    </label>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', marginLeft: '22px' }}>
                      When unchecked (recommended), only your Primary Cover Photo and extra showcase photos are used.
                    </div>
                  </div>

                  {/* Extra Showcase Images Pills */}
                  {Array.isArray(meta.images) && meta.images.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {meta.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px 3px 4px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '6px',
                            border: '1px solid var(--adm-border)',
                            fontSize: '11px',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt=""
                            style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span
                            style={{
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {imgUrl.split('/').pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setMeta((prev) => ({
                                ...prev,
                                images: (prev.images || []).filter((_, idx) => idx !== i),
                              }));
                            }}
                            style={{
                              background: 'transparent',
                              border: 0,
                              color: 'var(--adm-text-muted)',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: '11px',
                      color: '#22c55e',
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Check size={12} />
                    <span>
                      Live Award Pool: {previewCycleImages.length} {previewCycleImages.length === 1 ? 'image active (single cover mode)' : 'images will cycle continuously'}.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Card Preview */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--adm-text-muted)',
                    marginBottom: '8px',
                    alignSelf: 'flex-start',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={13} color="var(--pink)" />
                  <span>Live Frontend Preview ({previewCycleImages.length} Images in Pool)</span>
                </div>

                {/* Replica of the Frontend Featured Card */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '310px',
                    minHeight: '380px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: '#140e16',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px',
                  }}
                >
                  {/* Layered Cycling Images */}
                  {previewCycleImages.map((src, idx) => {
                    const isCurrent = idx === previewIndex;
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt="Preview"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'saturate(0.9)',
                          transition: 'opacity 0.7s ease-in-out',
                          opacity: isCurrent ? 0.75 : 0,
                          willChange: 'opacity',
                          pointerEvents: 'none',
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/award-trophy-stage.jpg';
                        }}
                      />
                    );
                  })}

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, #0e0810 0%, rgba(14, 8, 16, 0.6) 60%, rgba(0,0,0,0.35) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Badge Counter */}
                  {previewCycleImages.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#d4d4d8',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--pink)',
                        }}
                      />
                      <span>
                        {String(previewIndex + 1).padStart(2, '0')} / {String(previewCycleImages.length).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(255, 63, 121, 0.2)',
                        border: '1px solid rgba(255, 63, 121, 0.4)',
                        color: 'var(--pink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Trophy size={18} />
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--pink)',
                        fontFamily: 'monospace',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {meta.badge || 'Dhallywood Honors'}
                    </span>

                    <h3
                      style={{
                        fontSize: '20px',
                        color: '#ffffff',
                        fontWeight: 600,
                        lineHeight: 1.25,
                        margin: '0 0 8px 0',
                      }}
                    >
                      {meta.cardTitle || 'Recognized Excellence'}
                    </h3>

                    <p
                      style={{
                        fontSize: '11px',
                        color: 'rgba(212, 212, 216, 0.85)',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {meta.cardSubtitle ||
                        'Honoring a decade of memorable cinematic performances across television, mainstream film, and cultural festivals.'}
                    </p>

                    {/* Dots */}
                    {previewCycleImages.length > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '14px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {previewCycleImages.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPreviewIndex(i)}
                            style={{
                              height: '4px',
                              width: i === previewIndex ? '20px' : '6px',
                              borderRadius: '4px',
                              background: i === previewIndex ? 'var(--pink)' : 'rgba(255,255,255,0.3)',
                              border: 0,
                              padding: 0,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', minWidth: '180px', flex: '1 1 220px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="adm-badge adm-badge-green"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Archive Period: {computeTimelinePeriodLabel(items)}
            </span>
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setPickerOpen(true)}
                          className="adm-btn adm-btn-primary adm-btn-sm"
                        >
                          <FolderKanban size={13} />
                          <span>Choose from Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <Upload size={13} />
                          <span>{isUploading ? 'Uploading...' : 'Direct Upload'}</span>
                        </button>
                      </div>

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

      {/* Media Picker Modal for Milestone Item */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, image: url }))}
        title="Select Award / Trophy Photo"
        currentValue={formData.image}
        targetFolder="timeline"
      />

      {/* Media Picker Modal for Primary Intro Cover Image */}
      <MediaPickerModal
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(url) => setMeta((prev) => ({ ...prev, image: url }))}
        title="Select Primary Award Cover Photo"
        currentValue={meta.image}
        targetFolder="timeline"
      />

      {/* Media Picker Modal for Additional Showcase Cover Images */}
      <MediaPickerModal
        isOpen={addCoverPickerOpen}
        onClose={() => setAddCoverPickerOpen(false)}
        onSelect={(url) => {
          setMeta((prev) => ({
            ...prev,
            images: Array.from(new Set([...(prev.images || []), url])),
          }));
        }}
        title="Add Image to Dynamic Awards Cover Showcase"
        targetFolder="timeline"
      />
    </>
  );
}
