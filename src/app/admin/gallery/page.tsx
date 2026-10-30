"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  RefreshCw,
  X,
  Award,
  FolderKanban,
  Check,
  Layers,
} from 'lucide-react';
import { GalleryImage } from '@/data/gallery';
import { MediaPickerModal, MediaAsset } from '@/components/admin/media-picker-modal';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    src: '/images/award-diff-stage.jpg',
    label: '',
    category: 'Awards & Honors',
    year: new Date().getFullYear().toString(),
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.items) setImages(data.items);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Direct single image upload in the Add/Edit modal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'images');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const derivedLabel = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      setFormData((prev) => ({
        ...prev,
        src: data.url,
        label: prev.label?.trim() ? prev.label : derivedLabel,
      }));
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Batch multi-image upload from main gallery page
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBatchUploading(true);
    const body = new FormData();
    for (let i = 0; i < files.length; i++) {
      body.append('files', files[i]);
    }
    body.append('folder', 'images');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch upload failed');

      const uploadedFiles = data.files || (data.url ? [{ url: data.url, filename: files[0].name }] : []);
      const currentYear = new Date().getFullYear().toString();

      // Add each uploaded file to gallery
      for (const item of uploadedFiles) {
        const cleanName = (item.filename || 'Photo')
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());

        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            src: item.url,
            label: cleanName,
            category: 'Awards & Honors',
            year: currentYear,
          }),
        });
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_gallery_updated'));
        localStorage.setItem('shirin_shila_sync_gallery', Date.now().toString());
      }
      await loadGallery();
      alert(`Successfully added ${uploadedFiles.length} photo(s) to the Parallax Gallery!`);
    } catch (err: any) {
      alert(`Batch upload failed: ${err.message}`);
    } finally {
      setIsBatchUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setFormData({
      src: images[0]?.src || '/images/award-diff-stage.jpg',
      label: '',
      category: 'Awards & Honors',
      year: new Date().getFullYear().toString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryImage, idx: number) => {
    setEditingIndex(idx);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSelectFromPicker = (url: string, asset?: MediaAsset) => {
    const derivedLabel = asset?.originalName
      ? asset.originalName
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : '';

    setFormData((prev) => ({
      ...prev,
      src: url,
      label: prev.label?.trim() ? prev.label : derivedLabel,
    }));
    setPickerOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label?.trim() || !formData.src?.trim()) {
      alert('Label and Image source are required.');
      return;
    }

    try {
      if (editingIndex !== null) {
        const res = await fetch('/api/gallery', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: editingIndex, item: formData }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_gallery_updated'));
        localStorage.setItem('shirin_shila_sync_gallery', Date.now().toString());
      }
      loadGallery();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (index: number, label: string) => {
    if (!confirm(`Remove image "${label}" from Parallax Gallery?`)) return;

    try {
      const res = await fetch(`/api/gallery?index=${index}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_gallery_updated'));
        localStorage.setItem('shirin_shila_sync_gallery', Date.now().toString());
      }
      loadGallery();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => batchFileInputRef.current?.click()}
            disabled={isBatchUploading}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Layers size={13} />
            <span>{isBatchUploading ? 'Uploading Batch...' : 'Upload Multiple Photos'}</span>
          </button>
          <input
            type="file"
            ref={batchFileInputRef}
            multiple
            accept="image/*"
            onChange={handleBatchUpload}
            style={{ display: 'none' }}
          />

          <button type="button" onClick={handleOpenAddModal} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={13} />
            <span>Add Single Gallery Image</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <span className="adm-card-title">Parallax Matrix Photos ({images.length})</span>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                These high-resolution photos power the interactive 3D perspective gallery matrix on the homepage.
              </p>
            </div>
            <button type="button" onClick={loadGallery} className="adm-btn adm-btn-secondary adm-btn-sm">
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="adm-card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {images.map((img, i) => (
                <div
                  key={`${img.src}-${i}`}
                  style={{
                    background: 'var(--adm-surface-raised)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '180px', overflow: 'hidden', background: '#09090b', position: 'relative' }}>
                    <img
                      src={img.src}
                      alt={img.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span
                      className="adm-badge adm-badge-neutral"
                      style={{ position: 'absolute', top: 10, right: 10, backdropFilter: 'blur(4px)' }}
                    >
                      {img.year}
                    </span>
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <span className="adm-badge adm-badge-blue" style={{ marginBottom: '6px' }}>
                        {img.category}
                      </span>
                      <div style={{ fontWeight: 600, color: 'var(--adm-text-primary)', fontSize: '13px' }}>
                        {img.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'monospace', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {img.src}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--adm-border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(img, i)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        title="Edit Info"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(i, img.label)}
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        title="Delete Image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                No gallery photos added yet. Click &quot;Add Single Gallery Image&quot; or &quot;Upload Multiple Photos&quot; above.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">
                {editingIndex !== null ? 'Edit Award Image' : 'Add New Gallery Photo'}
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
                {/* Image Selection / Preview */}
                <div className="adm-form-group">
                  <label className="adm-label">Award / Event Photo *</label>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#18181b',
                        border: '1px solid var(--adm-border)',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      {formData.src ? (
                        <img
                          src={formData.src}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setPickerOpen(true)}
                          className="adm-btn adm-btn-primary adm-btn-sm"
                        >
                          <FolderKanban size={13} />
                          <span>Choose from Media Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                        >
                          <Upload size={13} />
                          <span>{isUploading ? 'Uploading...' : 'Direct Upload New File'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        className="adm-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                        value={formData.src || ''}
                        onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                        placeholder="Image URL or local path (e.g. /images/... or /uploads/...)"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Honor Title / Label *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Babisas Best Actress Trophy & Honor"
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
                      placeholder="e.g. Awards & Honors"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Year</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2024"
                    />
                  </div>
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
                  {editingIndex !== null ? 'Save Changes' : 'Add to Parallax Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal rendered at root level with high z-index */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectFromPicker}
        title="Select Gallery / Award Photo"
        currentValue={formData.src}
        targetFolder="images"
      />
    </>
  );
}
