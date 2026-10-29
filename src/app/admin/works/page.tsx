"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  RefreshCw,
  Star,
  Check,
  X,
  ImageIcon,
  Play,
  Tv,
  ExternalLink,
} from 'lucide-react';
import { ProjectItem, filmographyCategories } from '@/data/filmography';

export default function AdminWorksPage() {
  const [works, setWorks] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fetch state for Works
  const [autoFetchQuery, setAutoFetchQuery] = useState('');
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [autoFetchNotice, setAutoFetchNotice] = useState<string | null>(null);

  const handleExtractYoutubeThumbnail = (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    let ytId: string | null = null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      ytId = trimmed;
    } else {
      const match = trimmed.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
      );
      if (match && match[1]) ytId = match[1];
    }
    if (ytId) {
      const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      setFormData((prev) => ({
        ...prev,
        image: thumb,
        youtubeId: ytId || undefined,
        videoUrl: prev.videoUrl || `https://www.youtube.com/watch?v=${ytId}`,
      }));
      return thumb;
    }
    return null;
  };

  const handleAutoFetchWork = async () => {
    if (!autoFetchQuery.trim()) return;
    setIsAutoFetching(true);
    setAutoFetchNotice(null);
    try {
      const res = await fetch(`/api/scrape-work?query=${encodeURIComponent(autoFetchQuery.trim())}`);
      const result = await res.json();
      if (!res.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to auto-fetch project details');
      }
      const d = result.data;
      setFormData((prev) => ({
        ...prev,
        title: d.title || prev.title,
        banglaTitle: d.banglaTitle || prev.banglaTitle,
        category: d.category || prev.category,
        year: d.year || prev.year,
        director: d.director || prev.director,
        coStar: d.coStar || prev.coStar,
        productionHouse: d.productionHouse || prev.productionHouse,
        role: d.role || prev.role,
        description: d.description || prev.description,
        image: d.image || prev.image,
        awards: d.awards || prev.awards,
        videoUrl: d.videoUrl || prev.videoUrl,
        youtubeId: d.youtubeId || prev.youtubeId,
        imdbUrl: d.imdbUrl || prev.imdbUrl,
      }));

      if (result.source === 'youtube') {
        setAutoFetchNotice(`✓ YouTube Video Auto-Imported: "${d.title}" (${d.category}) with HD Thumbnail!`);
      } else if (result.source === 'imdb' || result.source === 'imdb-search') {
        setAutoFetchNotice(`✓ IMDb Title Auto-Imported: "${d.title}" (${d.year}) with Poster!`);
      } else if (result.source === 'catalogue') {
        setAutoFetchNotice(`✓ Loaded from Database: "${d.title}" (${d.category})`);
      } else {
        setAutoFetchNotice(`✓ Auto-imported: "${d.title}" (${d.category})`);
      }
    } catch (err: any) {
      alert(`Auto-fetch error: ${err.message}`);
    } finally {
      setIsAutoFetching(false);
    }
  };

  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    title: '',
    banglaTitle: '',
    category: 'Film',
    year: '2026',
    director: '',
    coStar: '',
    productionHouse: '',
    role: '',
    description: '',
    image: '/images/poster-begum-jaan.jpg',
    featured: false,
    awards: '',
    status: 'Released',
    videoUrl: '',
    youtubeId: '',
    imdbUrl: '',
  });

  const loadWorks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/works');
      const data = await res.json();
      if (data.items) setWorks(data.items);
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, []);

  // Handle direct image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'works');

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
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setAutoFetchQuery('');
    setAutoFetchNotice(null);
    setFormData({
      title: '',
      banglaTitle: '',
      category: 'Film',
      year: new Date().getFullYear().toString(),
      director: '',
      coStar: '',
      productionHouse: '',
      role: '',
      description: '',
      image: '/images/poster-begum-jaan.jpg',
      featured: false,
      awards: '',
      status: 'Released',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProjectItem) => {
    setEditingItem(item);
    setAutoFetchQuery(item.title);
    setAutoFetchNotice(null);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Project Title is required.');
      return;
    }

    try {
      if (editingItem) {
        // Update
        const res = await fetch('/api/works', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingItem.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        // Create
        const res = await fetch('/api/works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setIsModalOpen(false);
      loadWorks();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;

    try {
      const res = await fetch(`/api/works?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      loadWorks();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredWorks = works.filter((w) => {
    const matchesCategory = filter === 'All' || w.category === filter;
    const matchesSearch =
      !searchQuery.trim() ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.banglaTitle && w.banglaTitle.includes(searchQuery)) ||
      (w.director && w.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.coStar && w.coStar.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">Notable Works & Filmography</h1>
        <div className="adm-header-actions">
          <button type="button" onClick={handleOpenAddModal} className="adm-btn adm-btn-primary adm-btn-sm">
            <Plus size={13} />
            <span>Add Notable Work</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* Filter bar & Search */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1 }}>
            {filmographyCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`adm-btn adm-btn-sm ${filter === cat ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ width: '260px', position: 'relative' }}>
            <input
              type="text"
              className="adm-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, director, costar..."
              style={{ paddingLeft: '32px' }}
            />
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
            />
          </div>

          <button type="button" onClick={loadWorks} className="adm-btn adm-btn-secondary adm-btn-sm">
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Works Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">
              Works Archive ({filteredWorks.length}{filter !== 'All' ? ` in ${filter}` : ''})
            </span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Title & Role</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorks.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: '60px' }}>
                      <div
                        style={{
                          width: '45px',
                          height: '64px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#18181b',
                          border: '1px solid var(--adm-border)',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td className="strong">
                      <div>{item.title}</div>
                      {item.banglaTitle && (
                        <div style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                          {item.banglaTitle}
                        </div>
                      )}
                      {item.role && (
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                          Role: {item.role}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-neutral">{item.category}</span>
                    </td>
                    <td>{item.year}</td>
                    <td>
                      {item.director && <div style={{ fontSize: '11px' }}>Dir: {item.director}</div>}
                      {item.coStar && (
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>
                          With: {item.coStar}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          item.status === 'Released'
                            ? 'adm-badge-green'
                            : item.status === 'Upcoming'
                            ? 'adm-badge-blue'
                            : 'adm-badge-amber'
                        }`}
                      >
                        {item.status || 'Released'}
                      </span>
                    </td>
                    <td>
                      {item.featured ? (
                        <span className="adm-badge adm-badge-amber" title="Showcased on homepage">
                          ★ Featured
                        </span>
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
                          title="Edit Work"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          title="Delete Project"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWorks.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No works found. Click "Add Notable Work" above.
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
                {editingItem ? `Edit: ${editingItem.title}` : 'Add New Notable Work'}
              </span>
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
                {/* Auto-Fetch Film / TV Show Details */}
                <div
                  style={{
                    background: 'rgba(255, 63, 121, 0.08)',
                    border: '1px solid rgba(255, 63, 121, 0.28)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Search size={14} color="var(--pink)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                      Auto-Fetch Project Details & Thumbnail (YouTube Link, IMDb URL, or Title)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="adm-input"
                      value={autoFetchQuery}
                      onChange={(e) => setAutoFetchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAutoFetchWork();
                        }
                      }}
                      placeholder="Paste YouTube Video URL, IMDb Title Link, or Film Name..."
                      style={{ fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAutoFetchWork}
                      disabled={isAutoFetching || !autoFetchQuery.trim()}
                      className="adm-btn adm-btn-primary adm-btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      {isAutoFetching ? 'Fetching...' : 'Auto-Fetch'}
                    </button>
                  </div>
                  {autoFetchNotice && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#86efac', fontWeight: 500 }}>
                      {autoFetchNotice}
                    </div>
                  )}
                </div>

                {/* Direct Image Upload Field */}
                <div className="adm-form-group">
                  <label className="adm-label">
                    Visual Poster / Video Thumbnail / Promotional Still
                    <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '6px' }}>
                      (Supports Portrait Posters & 16:9 Landscape YouTube Video Thumbnails)
                    </span>
                  </label>
                  
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '84px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#140c16',
                        border: '1px solid rgba(255, 63, 121, 0.35)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={formData.image || '/images/poster-begum-jaan.jpg'}
                        alt="Poster Preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/poster-begum-jaan.jpg';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                        >
                          <Upload size={13} />
                          <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                        </button>

                        {formData.videoUrl && (
                          <button
                            type="button"
                            onClick={() => handleExtractYoutubeThumbnail(formData.videoUrl || '')}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            title="Extract YouTube Thumbnail from the video link"
                          >
                            <Play size={12} />
                            <span>Use YouTube Thumbnail</span>
                          </button>
                        )}
                      </div>
                      
                      <input
                        type="text"
                        className="adm-input"
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Image URL or local path (/images/... or https://img.youtube.com/...)"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">English Title *</label>
                    <input
                      type="text"
                      required
                      className="adm-input"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Begum Jaan"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Bangla Title (বাংলা শিরোনাম)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.banglaTitle || ''}
                      onChange={(e) => setFormData({ ...formData, banglaTitle: e.target.value })}
                      placeholder="e.g. বেগম জান"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select
                      className="adm-select"
                      value={formData.category || 'Film'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="Film">Film</option>
                      <option value="Television Drama">Television Drama</option>
                      <option value="TV Show Judge">TV Show Judge (টিভি শো বিচারক)</option>
                      <option value="Music Video">Music Video</option>
                      <option value="Commercial & Modelling">Commercial & Modelling</option>
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Release Year</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Director</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.director || ''}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      placeholder="e.g. Mohammad Aslam"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Co-Stars / Cast</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.coStar || ''}
                      onChange={(e) => setFormData({ ...formData, coStar: e.target.value })}
                      placeholder="e.g. Shakib Khan, Emon"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Character / Role Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Begum Jaan (Title Role)"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Release Status</label>
                    <select
                      className="adm-select"
                      value={formData.status || 'Released'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Released">Released</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="In Production">In Production</option>
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Production House / Banner</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.productionHouse || ''}
                    onChange={(e) => setFormData({ ...formData, productionHouse: e.target.value })}
                    placeholder="e.g. Fatman Films"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Description / Synopsis</label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write a brief synopsis or release summary..."
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Awards / Recognition</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.awards || ''}
                    onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                    placeholder="e.g. Babisas Award Winner (Best Actress)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Video / YouTube URL (Optional)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.videoUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: val,
                        }));
                      }}
                      onBlur={(e) => {
                        if (e.target.value && (!formData.image || formData.image === '/images/poster-begum-jaan.jpg')) {
                          handleExtractYoutubeThumbnail(e.target.value);
                        }
                      }}
                      placeholder="e.g. https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">IMDb URL / Title Link (Optional)</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.imdbUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imdbUrl: e.target.value })}
                      placeholder="e.g. https://www.imdb.com/title/tt4049876/"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="featuredSwitch"
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="featuredSwitch" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--adm-text-primary)' }}>
                    Feature on Homepage Carousel
                  </label>
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
                  {editingItem ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
