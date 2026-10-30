"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Video,
  Newspaper,
  Image as ImageIcon,
  Clock,
  Inbox,
  ArrowRight,
  Plus,
  ExternalLink,
  MessageCircle,
  Mail,
  LayoutTemplate,
  User,
  Tv,
  Share2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Download,
} from "lucide-react";
import { ProjectItem } from "@/data/filmography";
import { ShowreelItem } from "@/data/showreel";
import { PressItem } from "@/data/press";
import { GalleryImage } from "@/data/gallery";
import { InquiryItem } from "@/data/contact";
import { MediaPartner } from "@/data/media-partners";

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
      fetch("/api/works", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/showreels", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/press", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/gallery", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/media-partners", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/timeline", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ data: { top: [], bottom: [] } })),
      fetch("/api/inquiries", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
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

  const newInquiries = inquiries.filter((i) => i.status === "New");

  return (
    <main className="adm-content">
      {/* TailAdmin Welcome Banner Card */}
      <div className="adm-card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <div style={{ padding: "24px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="adm-badge adm-badge-blue" style={{ fontSize: "11px", fontWeight: 700 }}>
                TUNE SOUL OCEAN
              </span>
              <a
                href="https://trytso.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "12px", color: "var(--tail-text-body)", textDecoration: "none" }}
                className="hover:underline"
              >
                Tune Soul Ocean Management
              </a>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--tail-text-dark)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Shirin Shila Portfolio Management
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--tail-text-body)" }}>
              Manage films, showreels, high-resolution galleries, media coverage, and talent booking inquiries in real time.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/" target="_blank" className="adm-btn adm-btn-secondary">
              <ExternalLink size={14} />
              <span>Live Website</span>
            </Link>
            <Link href="/admin/works" className="adm-btn adm-btn-primary">
              <Plus size={14} />
              <span>Add Notable Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TailAdmin 4-Metric Stats Grid */}
      <div className="adm-stats-grid">
        {/* Metric 1: Notable Works */}
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ background: "#eff2f7", color: "#3c50e0" }}>
              <Film size={22} />
            </div>
            <span className="adm-badge adm-badge-blue">Filmography</span>
          </div>
          <div>
            <div className="adm-stat-value">{loading ? "—" : works.length}</div>
            <div className="adm-stat-desc">Films, Dramas &amp; Shows</div>
          </div>
        </div>

        {/* Metric 2: Video Showreels */}
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ background: "#fdf2f8", color: "#ec4899" }}>
              <Video size={22} />
            </div>
            <span className="adm-badge adm-badge-amber">YouTube HD</span>
          </div>
          <div>
            <div className="adm-stat-value">{loading ? "—" : showreels.length}</div>
            <div className="adm-stat-desc">Video Performance Reels</div>
          </div>
        </div>

        {/* Metric 3: Media & Press */}
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Newspaper size={22} />
            </div>
            <span className="adm-badge adm-badge-amber">Press Archive</span>
          </div>
          <div>
            <div className="adm-stat-value">{loading ? "—" : press.length}</div>
            <div className="adm-stat-desc">Articles &amp; Print Clippings</div>
          </div>
        </div>

        {/* Metric 4: CRM Inquiries */}
        <div className="adm-stat-card">
          <div className="adm-stat-top">
            <div className="adm-stat-icon-wrap" style={{ background: "#e1f9ee", color: "#10b981" }}>
              <Inbox size={22} />
            </div>
            {newInquiries.length > 0 ? (
              <span className="adm-badge adm-badge-green font-bold">
                {newInquiries.length} New
              </span>
            ) : (
              <span className="adm-badge adm-badge-neutral">Up to date</span>
            )}
          </div>
          <div>
            <div className="adm-stat-value">{loading ? "—" : inquiries.length}</div>
            <div className="adm-stat-desc">Public Booking Inquiries</div>
          </div>
        </div>
      </div>

      {/* Quick CMS Navigation Ribbon */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
        <Link href="/admin/hero" className="adm-btn adm-btn-secondary">
          <LayoutTemplate size={14} />
          <span>Hero Banner</span>
        </Link>
        <Link href="/admin/about" className="adm-btn adm-btn-secondary">
          <User size={14} />
          <span>About Biography</span>
        </Link>
        <Link href="/admin/works" className="adm-btn adm-btn-secondary">
          <Film size={14} />
          <span>Notable Works ({works.length})</span>
        </Link>
        <Link href="/admin/showreel" className="adm-btn adm-btn-secondary">
          <Video size={14} />
          <span>Showreels ({showreels.length})</span>
        </Link>
        <Link href="/admin/timeline" className="adm-btn adm-btn-secondary">
          <Clock size={14} />
          <span>Awards &amp; Honors ({awardsCount})</span>
        </Link>
        <Link href="/admin/press" className="adm-btn adm-btn-secondary">
          <Newspaper size={14} />
          <span>Press Coverage ({press.length})</span>
        </Link>
        <Link href="/admin/media-partners" className="adm-btn adm-btn-secondary">
          <Tv size={14} />
          <span>TV Logos ({mediaPartners.length})</span>
        </Link>
        <Link href="/admin/gallery" className="adm-btn adm-btn-secondary">
          <ImageIcon size={14} />
          <span>Photo Gallery ({gallery.length})</span>
        </Link>
        <Link href="/admin/contact" className="adm-btn adm-btn-secondary">
          <Share2 size={14} />
          <span>Contact &amp; Portals</span>
        </Link>
      </div>

      {/* Data Protection & Persistence Banner */}
      <div
        className="adm-card"
        style={{
          marginBottom: "24px",
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>
              Live Data &amp; Media Protection Shield Active
            </div>
            <div style={{ fontSize: "12px", color: "#15803d" }}>
              All CMS content edits and media files persist safely across GitHub commits, releases, and server rebuilds.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <a
            href="/api/backup?download=true"
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={13} />
            <span>Download Backup</span>
          </a>
          <Link
            href="/admin/backup"
            className="adm-btn adm-btn-primary adm-btn-sm"
          >
            <span>Manage Persistence</span>
          </Link>
        </div>
      </div>

      {/* TailAdmin Recent Inquiries Table Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <span className="adm-card-title">Recent Inquiries &amp; Booking Submissions</span>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--tail-text-body)" }}>
              Messages submitted through the public casting and booking inquiry desk.
            </p>
          </div>
          <Link href="/admin/inquiries" className="adm-btn adm-btn-secondary adm-btn-sm">
            <span>View All ({inquiries.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Client / Production</th>
                <th>Inquiry Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.slice(0, 5).map((inq) => {
                const whatsappClean = inq.phone ? inq.phone.replace(/[^0-9]/g, "") : "";
                return (
                  <tr key={inq.id}>
                    <td className="strong">
                      <div>{inq.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--tail-text-body)", fontFamily: "var(--adm-font-mono)" }}>
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
                          inq.status === "New"
                            ? "adm-badge-blue"
                            : inq.status === "Replied"
                            ? "adm-badge-green"
                            : "adm-badge-neutral"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {whatsappClean && (
                          <a
                            href={`https://wa.me/${whatsappClean}?text=Hello%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Shirin%20Shila%20Management.`}
                            target="_blank"
                            rel="noreferrer"
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} color="#10b981" />
                          </a>
                        )}
                        <a
                          href={`mailto:${inq.email}?subject=Regarding%20your%20inquiry%20to%20Shirin%20Shila`}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          title="Reply by Email"
                        >
                          <Mail size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {inquiries.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "var(--tail-text-body)" }}>
                    No contact inquiries received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
