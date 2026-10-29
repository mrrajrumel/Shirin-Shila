"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Upload, Save, RefreshCw, Check, Plus, Trash2 } from 'lucide-react';

export default function AdminAboutPage() {
  const [about, setAbout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/about', { cache: 'no-store' });
      const data = await res.json();
      if (data.about) setAbout(data.about);
    } catch (err) {
      console.error('Error fetching about data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbout();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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

      setAbout((prev: any) => ({
        ...prev,
        meta: { ...prev.meta, portraitSrc: data.url },
      }));
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(about),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddParagraph = () => {
    setAbout((prev: any) => ({
      ...prev,
      biography: {
        ...prev.biography,
        paragraphs: [...prev.biography.paragraphs, 'New biographical paragraph text...'],
      },
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    setAbout((prev: any) => ({
      ...prev,
      biography: {
        ...prev.biography,
        paragraphs: prev.biography.paragraphs.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const handleParagraphChange = (index: number, val: string) => {
    const updated = [...about.biography.paragraphs];
    updated[index] = val;
    setAbout((prev: any) => ({
      ...prev,
      biography: { ...prev.biography, paragraphs: updated },
    }));
  };

  if (loading || !about) {
    return (
      <div style={{ padding: '40px', color: 'var(--adm-text-muted)' }}>
        Loading About Section settings...
      </div>
    );
  }

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">About Section Settings</h1>
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadAbout}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            {savedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* Left: Biography Headings & Story Paragraphs */}
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">Biographical Story & Headings</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Section Title</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={about.meta.sectionTitle}
                    onChange={(e) =>
                      setAbout({
                        ...about,
                        meta: { ...about.meta, sectionTitle: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Title Highlight (Pink)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={about.meta.sectionHighlight}
                    onChange={(e) =>
                      setAbout({
                        ...about,
                        meta: { ...about.meta, sectionHighlight: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Biography Story Heading</label>
                <input
                  type="text"
                  className="adm-input"
                  value={about.biography.heading}
                  onChange={(e) =>
                    setAbout({
                      ...about,
                      biography: { ...about.biography, heading: e.target.value },
                    })
                  }
                  required
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="adm-label" style={{ margin: 0 }}>Story Paragraphs ({about.biography.paragraphs.length})</label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                  >
                    <Plus size={12} />
                    <span>Add Paragraph</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {about.biography.paragraphs.map((p: string, idx: number) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <textarea
                        className="adm-textarea"
                        rows={3}
                        value={p}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        placeholder={`Paragraph ${idx + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: 'none',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                        }}
                        title="Remove paragraph"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: About Portrait Photo & Profile Facts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="adm-card">
                <div className="adm-card-header">
                  <span className="adm-card-title">About Section Portrait Photo</span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '200px',
                      height: '250px',
                      margin: '0 auto 16px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#1a111a',
                      border: '2px solid rgba(255, 63, 121, 0.4)',
                    }}
                  >
                    <img
                      src={about.meta.portraitSrc}
                      alt={about.meta.portraitAlt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

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
                    className="adm-btn adm-btn-secondary"
                    style={{ margin: '0 auto', display: 'inline-flex' }}
                  >
                    <Upload size={14} />
                    <span>{isUploading ? 'Uploading Portrait...' : 'Upload New Photo'}</span>
                  </button>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Image Path / URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={about.meta.portraitSrc}
                    onChange={(e) =>
                      setAbout({
                        ...about,
                        meta: { ...about.meta, portraitSrc: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-header">
                  <span className="adm-card-title">Comp Card (PDF) Download</span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Comp Card Download URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={about.compCardData.downloadUrl}
                    onChange={(e) =>
                      setAbout({
                        ...about,
                        compCardData: { ...about.compCardData, downloadUrl: e.target.value },
                      })
                    }
                    placeholder="/documents/Shirin_Shila_Comp_Card_2026.pdf"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
