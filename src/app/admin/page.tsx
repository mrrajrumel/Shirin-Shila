"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Video,
  Newspaper,
  Image as ImageIcon,
  Clock,
  Inbox,
  ArrowRight,
  Plus,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Mail,
  LayoutTemplate,
  User,
  Tv,
  Share2,
} from 'lucide-react';
import { ProjectItem } from '@/data/filmography';
import { ShowreelItem } from '@/data/showreel';
import { PressItem } from '@/data/press';
import { GalleryImage } from '@/data/gallery';
import { InquiryItem } from '@/data/contact';
import { MediaPartner } from '@/data/media-partners';

export default function AdminOverviewPage() {
  const [works, setWorks] = useState<ProjectItem[]>([]);
  const [showreels, setShowreels] = useState<ShowreelItem[]>([]);
  const [press, setPress] = useState<PressItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [awardsCount, setAwardsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/works', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/showreels', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/press', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/gallery', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/media-partners', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/timeline', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: { top: [], bottom: [] } })),
      fetch('/api/inquiries', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
    ])
      .then(([worksData, showreelData, pressData, galleryData, mediaData, timelineData, inqData]) => {
        if (worksData.items) setWorks(worksData.items);
        if (showreelData.items) setShowreels(showreelData.items);
        if (pressData.items) setPress(pressData.items);
        if (galleryData.items) setGallery(galleryData.items);
        if (mediaData.items) setMediaPartners(mediaData.items);
        if (timelineData && timelineData.data) {
          const topLen = Array.isArray(timelineData.data.top) ? timelineData.data.top.length : 0;
          const btmLen = Array.isArray(timelineData.data.bottom) ? timelineData.data.bottom.length : 0;
          setAwardsCount(topLen + btmLen);
        }
        if (inqData.items) setInquiries(inqData.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const newInquiries = inquiries.filter((i) => i.status === 'New');

  return (
    <>
      <header className="adm-header">
        <h1 className="adm-header-title">Portfolio Overview</h1>
        <div className="adm-header-actions">
          <Link href="/" target="_blank" className="adm-btn adm-btn-secondary adm-btn-sm">
            <span>Live Portfolio</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </header>

      <main className="adm-content">
        {/* Metric Cards Grid */}
        <div className="adm-stats-grid">
          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>NOTABLE WORKS</span>
              <Film size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : works.length}</div>
            <div className="adm-stat-desc">Films, Dramas & TV Shows</div>
          </div>

          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>SHOWREEL</span>
              <Video size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : showreels.length}</div>
            <div className="adm-stat-desc">Video Embeds</div>
          </div>

          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>AWARDS & HONORS</span>
              <Clock size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : awardsCount}</div>
            <div className="adm-stat-desc">Milestone Timeline Items</div>
          </div>

          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>PRESS & MEDIA</span>
              <Newspaper size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : press.length}</div>
            <div className="adm-stat-desc">Articles & Clippings</div>
          </div>

          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>MEDIA & TV LOGOS</span>
              <Tv size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : mediaPartners.length}</div>
            <div className="adm-stat-desc">Broadcaster & Studio Logos</div>
          </div>

          <div className="adm-stat-card">
            <div className="adm-stat-top">
              <span>VISUAL GALLERY</span>
              <ImageIcon size={15} />
            </div>
            <div className="adm-stat-value">{loading ? '—' : gallery.length}</div>
            <div className="adm-stat-desc">Portfolio Images</div>
          </div>

          <div className="adm-stat-card" style={{ borderColor: newInquiries.length > 0 ? '#3b82f6' : undefined }}>
            <div className="adm-stat-top">
              <span>CRM INQUIRIES</span>
              <Inbox size={15} color={newInquiries.length > 0 ? '#3b82f6' : undefined} />
            </div>
            <div className="adm-stat-value">
              {loading ? '—' : inquiries.length}
              {newInquiries.length > 0 && (
                <span style={{ fontSize: '12px', color: '#93c5fd', marginLeft: 8, fontWeight: 500 }}>
                  ({newInquiries.length} New)
                </span>
              )}
            </div>
            <div className="adm-stat-desc">Public Form Submissions</div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <Link href="/admin/hero" className="adm-btn adm-btn-secondary">
            <LayoutTemplate size={14} />
            <span>Edit Hero Section</span>
          </Link>
          <Link href="/admin/about" className="adm-btn adm-btn-secondary">
            <User size={14} />
            <span>Edit About Us</span>
          </Link>
          <Link href="/admin/works" className="adm-btn adm-btn-primary">
            <Plus size={14} />
            <span>Add Notable Work</span>
          </Link>
          <Link href="/admin/showreel" className="adm-btn adm-btn-secondary">
            <Video size={14} />
            <span>Import Showreel</span>
          </Link>
          <Link href="/admin/media-partners" className="adm-btn adm-btn-secondary">
            <Tv size={14} />
            <span>Manage TV Logos</span>
          </Link>
          <Link href="/admin/press" className="adm-btn adm-btn-secondary">
            <Newspaper size={14} />
            <span>Import News Article</span>
          </Link>
          <Link href="/admin/gallery" className="adm-btn adm-btn-secondary">
            <ImageIcon size={14} />
            <span>Upload Gallery</span>
          </Link>
          <Link href="/admin/contact" className="adm-btn adm-btn-secondary">
            <Share2 size={14} />
            <span>Manage Contact & Socials</span>
          </Link>
        </div>

        {/* Recent Inquiries CRM Section */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <span className="adm-card-title">Recent Inquiries & Bookings</span>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                Direct submissions from the public portfolio contact form.
              </p>
            </div>
            <Link href="/admin/inquiries" className="adm-btn adm-btn-secondary adm-btn-sm">
              <span>View All CRM ({inquiries.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Inquiry Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.slice(0, 5).map((inq) => {
                  const whatsappClean = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
                  return (
                    <tr key={inq.id}>
                      <td className="strong">
                        <div>{inq.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'var(--adm-font-mono)' }}>
                          {inq.email}
                        </div>
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-neutral">{inq.inquiryType}</span>
                      </td>
                      <td>{inq.date}</td>
                      <td>
                        <span
                          className={`adm-badge ${
                            inq.status === 'New'
                              ? 'adm-badge-blue'
                              : inq.status === 'Replied'
                              ? 'adm-badge-green'
                              : 'adm-badge-neutral'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td>
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {inquiries.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                      No contact inquiries received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
