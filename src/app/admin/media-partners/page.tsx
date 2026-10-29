"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tv, Plus, Trash2, Edit2, Upload, RefreshCw, X, Check, ExternalLink } from 'lucide-react';
import { MediaPartner } from '@/data/media-partners';

export default function AdminMediaPartnersPage() {
  const [partners, setPartners] = useState<MediaPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaPartner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<MediaPartner>>({
    name: '',
    banglaName: '',
    logo: '/images/logos/channel-i.svg',
    website: '',
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'logos');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormData((prev) => ({ ...prev, logo: data.url }));
    } catch (err: any) {
      alert(`Logo upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      banglaName: '',
      logo: '/images/logos/channel-i.svg',
      website: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MediaPartner) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      banglaName: item.banglaName || '',
      logo: item.logo,
      website: item.website || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.logo?.trim()) {
      alert('Network / Channel name and logo are required.');
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch('/api/media-partners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_partners_updated'));
        localStorage.setItem('shirin_shila_sync_partners', Date.now().toString());
      }
      loadPartners();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete logo for ${name}?`)) return;

    try {
      const res = await fetch(`/api/media-partners?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirin_shila_partners_updated'));
        localStorage.setItem('shirin_shila_sync_partners', Date.now().toString());
      }
      loadPartners();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">Television & Media Logos Ticker</h1>
        <div className="adm-header-actions">
          <button type="button" onClick={handleOpenAddModal} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={13} />
            <span>Add Channel / Studio Logo</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <span className="adm-card-title">Live Broadcasters & Film Studios ({partners.length})</span>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                These logos automatically scroll infinitely in the auto ticker above the footer.
              </p>
            </div>
            <button type="button" onClick={loadPartners} className="adm-btn adm-btn-secondary adm-btn-sm">
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Logo Preview</th>
                  <th>Company / Channel Name</th>
                  <th>Bengali Name</th>
                  <th>Website URL</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>
                      <div
                        style={{
                          width: '140px',
                          height: '42px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#1a111a',
                          border: '1px solid #332233',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                        }}
                      >
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </td>
                    <td className="strong">{partner.name}</td>
                    <td style={{ color: 'var(--adm-text-muted)' }}>{partner.banglaName || '—'}</td>
                    <td>
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        >
                          <span>{partner.website.replace('https://', '')}</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(partner)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          title="Edit Partner"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(partner.id, partner.name)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete Logo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No logos configured yet. Click "Add Channel / Studio Logo" to add one.
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
          <div className="adm-modal" style={{ maxWidth: '560px', width: '92vw' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">
                {editingItem ? 'Edit Broadcaster / Studio Logo' : 'Add New Channel / Studio Logo'}
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
                {/* Logo Preview & Upload */}
                <div className="adm-form-group">
                  <label className="adm-label">Logo Image</label>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '140px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#1a111a',
                        border: '1px solid #332233',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: '4px',
                      }}
                    >
                      <img
                        src={formData.logo || '/images/logos/channel-i.svg'}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,.svg"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                      >
                        <Upload size={13} />
                        <span>{isUploading ? 'Uploading...' : 'Upload Logo (SVG/PNG)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Or Logo Path / URL *</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="/images/logos/... or /uploads/..."
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Company / Channel Name (English) *</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Channel i"
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Bengali Name (বাংলা নাম)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.banglaName || ''}
                    onChange={(e) => setFormData({ ...formData, banglaName: e.target.value })}
                    placeholder="e.g. চ্যানেল আই"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Website Link (Optional)</label>
                  <input
                    type="url"
                    className="adm-input"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="adm-btn adm-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {editingItem ? 'Update Logo' : 'Add Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
