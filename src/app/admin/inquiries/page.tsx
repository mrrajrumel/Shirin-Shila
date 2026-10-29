"use client";

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  MessageCircle,
  Mail,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Phone,
  FileText,
  X,
} from 'lucide-react';
import { InquiryItem, InquiryType } from '@/data/contact';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail / Notes modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.items) setInquiries(data.items);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'New' | 'Read' | 'Replied') => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedInquiry.id, notes: notesInput }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) =>
            i.id === selectedInquiry.id ? { ...i, notes: notesInput } : i
          )
        );
        setSelectedInquiry((prev) => (prev ? { ...prev, notes: notesInput } : null));
      }
    } catch (err) {
      console.error('Notes save failed:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently remove inquiry from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (err) {
      console.error('Delete inquiry failed:', err);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.phone && inq.phone.includes(searchQuery)) ||
      inq.inquiryType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newCount = inquiries.filter((i) => i.status === 'New').length;

  return (
    <>
      <header className="adm-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="adm-header-title">Contact Inquiries & CRM Table</h1>
          {newCount > 0 && (
            <span className="adm-badge adm-badge-blue">
              {newCount} New Submissions
            </span>
          )}
        </div>
        <div className="adm-header-actions">
          <button type="button" onClick={loadInquiries} className="adm-btn adm-btn-secondary adm-btn-sm">
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {/* Status filters and Search Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'New', 'Read', 'Replied'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`adm-btn adm-btn-sm ${filterStatus === st ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
              >
                {st}
                {st === 'New' && newCount > 0 && (
                  <span style={{ marginLeft: 4, opacity: 0.8 }}>({newCount})</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ width: '280px', position: 'relative', marginLeft: 'auto' }}>
            <input
              type="text"
              className="adm-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, email, message..."
              style={{ paddingLeft: '32px' }}
            />
            <Search
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
            />
          </div>
        </div>

        {/* Inquiries CRM Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <span className="adm-card-title">
              Inquiries Inbox ({filteredInquiries.length})
            </span>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Client / Contact</th>
                  <th>Inquiry Type</th>
                  <th>Message Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>One-Click Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq) => {
                  const whatsappClean = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
                  return (
                    <tr
                      key={inq.id}
                      style={{ cursor: 'pointer', background: inq.status === 'New' ? 'rgba(59, 130, 246, 0.04)' : undefined }}
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setNotesInput(inq.notes || '');
                        if (inq.status === 'New') {
                          handleUpdateStatus(inq.id, 'Read');
                        }
                      }}
                    >
                      <td className="strong" style={{ width: '200px' }}>
                        <div>{inq.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'var(--adm-font-mono)' }}>
                          {inq.email}
                        </div>
                        {inq.phone && (
                          <div style={{ fontSize: '11px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={10} />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ width: '160px' }}>
                        <span className="adm-badge adm-badge-neutral">{inq.inquiryType}</span>
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: '320px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '12px',
                          }}
                        >
                          {inq.message}
                        </div>
                        {inq.notes && (
                          <div style={{ fontSize: '11px', color: '#fcd34d', marginTop: '2px' }}>
                            Note: {inq.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ width: '110px', fontSize: '12px' }}>{inq.date}</td>
                      <td style={{ width: '120px' }} onClick={(e) => e.stopPropagation()}>
                        <select
                          className="adm-select"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value as any)}
                        >
                          <option value="New">● New</option>
                          <option value="Read">✓ Read</option>
                          <option value="Replied">✓✓ Replied</option>
                        </select>
                      </td>
                      <td style={{ width: '140px' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {whatsappClean && (
                            <a
                              href={`https://wa.me/${whatsappClean}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Shirin%20Shila%20Management.`}
                              target="_blank"
                              rel="noreferrer"
                              className="adm-btn adm-btn-secondary adm-btn-sm"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={12} color="#22c55e" />
                            </a>
                          )}
                          <a
                            href={`mailto:${inq.email}?subject=Regarding%20your%20inquiry%20to%20Shirin%20Shila`}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            title="Reply by Email"
                          >
                            <Mail size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(inq.id, inq.name)}
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredInquiries.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No inquiries match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Inquiry Detail & Staff Notes Modal */}
      {selectedInquiry && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div className="adm-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-title">Inquiry Details</span>
                <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginLeft: 8, fontFamily: 'var(--adm-font-mono)' }}>
                  {selectedInquiry.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="adm-btn adm-btn-secondary adm-btn-sm"
              >
                <X size={14} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>NAME</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedInquiry.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>DATE</div>
                  <div style={{ fontSize: '14px' }}>{selectedInquiry.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>EMAIL</div>
                  <a href={`mailto:${selectedInquiry.email}`} style={{ color: '#93c5fd', fontSize: '13px' }}>
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)' }}>PHONE / WHATSAPP</div>
                  <div style={{ fontSize: '13px' }}>{selectedInquiry.phone || 'Not provided'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginBottom: '4px' }}>CATEGORY</div>
                <span className="adm-badge adm-badge-blue">{selectedInquiry.inquiryType}</span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', marginBottom: '6px' }}>MESSAGE CONTENT</div>
                <div
                  style={{
                    background: 'var(--adm-surface-raised)',
                    border: '1px solid var(--adm-border)',
                    borderRadius: '6px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="adm-form-group">
                <label className="adm-label">Talent Management Private Notes</label>
                <textarea
                  className="adm-input adm-textarea"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record negotiation progress, rate card quotations, shooting availability dates..."
                  style={{ minHeight: '70px' }}
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '6px' }}
                >
                  <FileText size={12} />
                  <span>{isSavingNotes ? 'Saving Notes...' : 'Save Private Notes'}</span>
                </button>
              </div>
            </div>

            <div className="adm-modal-footer">
              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedInquiry.name)},%20this%20is%20Shirin%20Shila%20management.`}
                  target="_blank"
                  rel="noreferrer"
                  className="adm-btn adm-btn-secondary"
                >
                  <MessageCircle size={14} color="#22c55e" />
                  <span>WhatsApp Chat</span>
                </a>
              )}
              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding%20your%20inquiry%20to%20Shirin%20Shila`}
                className="adm-btn adm-btn-primary"
              >
                <Mail size={14} />
                <span>Send Email Reply</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
