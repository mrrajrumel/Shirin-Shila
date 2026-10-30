"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Upload,
  RefreshCw,
  Trash2,
  FolderKanban,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Edit2,
  X,
  Plus,
} from 'lucide-react';
import { MediaPartner } from '@/data/media-partners';
import { MediaPickerModal, MediaAsset } from '@/components/admin/media-picker-modal';

export default function AdminMediaPartnersPage() {
  const [partners, setPartners] = useState<MediaPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Optional quick-rename state for inline label tweak
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media-partners', { cache: 'no-store' });
      const data = await res.json();
      if (data.items) setPartners(data.items);
    } catch (err) {
      console.error('Error fetching media partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const notifyChange = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shirin_shila_partners_updated'));
      localStorage.setItem('shirin_shila_sync_partners', Date.now().toString());
    }
  };

  // Direct file upload handler (supports single & multiple files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('folder', 'logos');

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const uploadedFiles: Array<{ url: string; filename: string }> =
        uploadData.files || (uploadData.url ? [{ url: uploadData.url, filename: files[0].name }] : []);

      if (uploadedFiles.length === 0) {
        throw new Error('No files were successfully processed');
      }

      // If replacing a single partner's logo:
      if (replacingId) {
        const targetUrl = uploadedFiles[0].url;
        const res = await fetch('/api/media-partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: replacingId, logo: targetUrl }),
        });
        if (!res.ok) throw new Error('Failed to replace partner logo');
        setReplacingId(null);
        setStatusMessage({ type: 'success', text: 'Logo replaced successfully!' });
      } else {
        // Bulk append new logos
        const logosToAdd = uploadedFiles.map((f) => f.url);
        const res = await fetch('/api/media-partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logos: logosToAdd }),
        });
        if (!res.ok) throw new Error('Failed to save new media partners');
        setStatusMessage({
          type: 'success',
          text: `Added ${uploadedFiles.length} new broadcaster / studio logo(s)!`,
        });
      }

      notifyChange();
      await loadPartners();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error processing logo upload' });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handler when selecting from Media Library
  const handleSelectFromLibrary = async (url: string, asset?: MediaAsset) => {
    setPickerOpen(false);
    setStatusMessage(null);

    try {
      if (replacingId) {
        const res = await fetch('/api/media-partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: replacingId, logo: url }),
        });
        if (!res.ok) throw new Error('Failed to update logo');
        setReplacingId(null);
        setStatusMessage({ type: 'success', text: 'Logo updated from library!' });
      } else {
        const res = await fetch('/api/media-partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logo: url,
            name: asset?.originalName
              ? asset.originalName
                  .replace(/\.[^/.]+$/, '')
                  .replace(/[-_]/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : undefined,
          }),
        });
        if (!res.ok) throw new Error('Failed to add partner logo');
        setStatusMessage({ type: 'success', text: 'Added new broadcaster logo from library!' });
      }

      notifyChange();
      await loadPartners();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Action failed' });
    }
  };

  // Delete logo
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete broadcaster logo "${name}"?`)) return;

    try {
      const res = await fetch(`/api/media-partners?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete logo');

      notifyChange();
      setStatusMessage({ type: 'success', text: `Deleted "${name}" logo.` });
      await loadPartners();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  // Reorder item
  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const reordered = [...partners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setPartners(reordered);

    try {
      await fetch('/api/media-partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered }),
      });
      notifyChange();
    } catch (err) {
      console.error('Failed to persist logo reordering:', err);
      loadPartners();
    }
  };

  // Save quick name update
  const handleSaveName = async (id: string) => {
    if (!tempName.trim()) {
      setEditingNameId(null);
      return;
    }

    try {
      await fetch('/api/media-partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: tempName.trim() }),
      });
      notifyChange();
      setEditingNameId(null);
      loadPartners();
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setReplacingId(null);
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            <Upload size={13} />
            <span>{isUploading ? 'Uploading...' : 'Upload Logo(s)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReplacingId(null);
              setPickerOpen(true);
            }}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <FolderKanban size={13} />
            <span>Choose from Media Library</span>
          </button>

          <button type="button" onClick={loadPartners} className="adm-btn adm-btn-secondary adm-btn-sm">
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,.svg"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <main className="adm-content">
        {/* Status notification */}
        {statusMessage && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Drag and Drop / Fast Upload Card */}
        <div
          onClick={() => {
            setReplacingId(null);
            fileInputRef.current?.click();
          }}
          style={{
            border: '2px dashed var(--adm-border)',
            borderRadius: '12px',
            padding: '24px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--adm-surface-raised)',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#1c2434',
              color: '#38bdf8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
            }}
          >
            <Upload size={22} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--adm-text-primary)' }}>
            Click or drag &amp; drop to upload Broadcaster &amp; Studio Logos
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
            Supports single or multiple files simultaneously (SVG, PNG, WebP). Broadcaster records are created automatically.
          </p>
        </div>

        {/* Active Logos Grid */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <span className="adm-card-title">Live Broadcaster &amp; Studio Logos ({partners.length})</span>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                These logos automatically stream infinitely in the homepage broadcast ticker and footer partner strip.
              </p>
            </div>
          </div>

          <div className="adm-card-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                Loading broadcaster logos...
              </div>
            ) : partners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                No broadcaster logos found. Click &quot;Upload Logo(s)&quot; above to add logos.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                {partners.map((partner, index) => (
                  <div
                    key={partner.id}
                    style={{
                      background: 'var(--adm-surface-raised)',
                      border: '1px solid var(--adm-border)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Logo display container */}
                    <div
                      style={{
                        height: '90px',
                        background: '#120f18',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid var(--adm-border-subtle)',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        style={{
                          maxHeight: '100%',
                          maxWidth: '85%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                        }}
                        loading="lazy"
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#64748b',
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    {/* Logo information & controls */}
                    <div
                      style={{
                        padding: '12px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        {editingNameId === partner.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="adm-input"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveName(partner.id);
                                if (e.key === 'Escape') setEditingNameId(null);
                              }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveName(partner.id)}
                              className="adm-btn adm-btn-primary adm-btn-sm"
                              style={{ padding: '4px 8px' }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: '13px',
                                color: 'var(--adm-text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={partner.name}
                            >
                              {partner.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNameId(partner.id);
                                setTempName(partner.name);
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--adm-text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                              }}
                              title="Edit label"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--adm-text-muted)',
                            fontFamily: 'monospace',
                            marginTop: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={partner.logo}
                        >
                          {partner.logo}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--adm-border-subtle)',
                        }}
                      >
                        {/* Reorder arrows */}
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'left')}
                            disabled={index === 0}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ padding: '4px 6px', opacity: index === 0 ? 0.4 : 1 }}
                            title="Move Earlier"
                          >
                            <ArrowLeft size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'right')}
                            disabled={index === partners.length - 1}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ padding: '4px 6px', opacity: index === partners.length - 1 ? 0.4 : 1 }}
                            title="Move Later"
                          >
                            <ArrowRight size={11} />
                          </button>
                        </div>

                        {/* Replace & Delete buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setReplacingId(partner.id);
                              setPickerOpen(true);
                            }}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            title="Replace Logo Image"
                          >
                            <ImageIcon size={11} />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(partner.id, partner.name)}
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            style={{ padding: '4px 8px' }}
                            title="Delete Logo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setReplacingId(null);
        }}
        onSelect={handleSelectFromLibrary}
        title={replacingId ? 'Replace Logo Image' : 'Select Broadcaster / Studio Logo'}
        targetFolder="logos"
      />
    </>
  );
}
