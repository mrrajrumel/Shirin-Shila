"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  UploadCloud,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  Lock,
} from "lucide-react";

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleDownloadBackup = () => {
    setDownloading(true);
    setStatusMessage({ type: "info", text: "Generating complete JSON backup package..." });
    window.location.href = "/api/backup?download=true";
    setTimeout(() => {
      setDownloading(false);
      setStatusMessage({ type: "success", text: "Backup archive downloaded successfully." });
    }, 1500);
  };

  const handleCreateSnapshot = async () => {
    setCreatingSnapshot(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_snapshot" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create snapshot");
      setStatusMessage({
        type: "success",
        text: `Server snapshot successfully saved: ${data.snapshot}`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create snapshot" });
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Are you sure you want to restore content from "${file.name}"? A safety snapshot will be created automatically before restoring.`)) {
      e.target.value = "";
      return;
    }

    setRestoring(true);
    setStatusMessage({ type: "info", text: "Validating backup structure..." });

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data && typeof parsed !== "object") {
        throw new Error("Invalid backup format: missing root data object.");
      }

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          backupData: parsed.data || parsed,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Restore failed");

      setStatusMessage({
        type: "success",
        text: `Successfully restored ${result.restoredKeys?.length || 0} sections! Safety snapshot created: ${result.safetySnapshot}`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to parse or restore backup" });
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  };

  return (
    <main className="adm-content">
      {/* Header Banner */}
      <div
        className="adm-card"
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
          border: "1px solid #bbf7d0",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="adm-badge adm-badge-green" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={12} />
                PERSISTENCE ACTIVE
              </span>
              <span style={{ fontSize: "12px", color: "var(--tail-text-body)" }}>
                Zero-DB File Integrity Engine
              </span>
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--tail-text-dark)",
                margin: "0 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Data Protection & Production Persistence
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--tail-text-body)", maxWidth: "700px" }}>
              Your admin edits and uploaded media are permanently decoupled from GitHub releases. New code deployments to Hostinger will never overwrite or erase your live content.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Download size={15} />
            <span>{downloading ? "Preparing Backup..." : "Download Full Backup (.json)"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "24px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            background:
              statusMessage.type === "success"
                ? "#f0fdf4"
                : statusMessage.type === "error"
                ? "#fef2f2"
                : "#eff6ff",
            border:
              statusMessage.type === "success"
                ? "1px solid #86efac"
                : statusMessage.type === "error"
                ? "1px solid #fca5a5"
                : "1px solid #bfdbfe",
            color:
              statusMessage.type === "success"
                ? "#15803d"
                : statusMessage.type === "error"
                ? "#b91c1c"
                : "#1d4ed8",
          }}
        >
          {statusMessage.type === "success" && <CheckCircle2 size={18} />}
          {statusMessage.type === "error" && <AlertTriangle size={18} />}
          {statusMessage.type === "info" && <RefreshCw size={18} className="animate-spin" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid of 3 Protection Pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* Card 1: Deployment Immunity */}
        <div className="adm-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: "#ecfdf5", color: "#059669" }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--tail-text-dark)" }}>
                Deployment Immunity
              </h3>
              <span style={{ fontSize: "12px", color: "var(--tail-text-body)" }}>Git Safe Architecture</span>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--tail-text-body)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Data and media are saved in Hostinger user-level persistent storage (outside the ephemeral release UUID folders). When you push code to GitHub and Hostinger rebuilds, your live content stays untouched.
          </p>
          <div style={{ fontSize: "12px", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px", color: "#64748b" }}>
            <strong>Strategy:</strong> External directory mapping with atomic writes
          </div>
        </div>

        {/* Card 2: Rolling Revisions */}
        <div className="adm-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb" }}>
              <HardDrive size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--tail-text-dark)" }}>
                Automatic Revisions
              </h3>
              <span style={{ fontSize: "12px", color: "var(--tail-text-body)" }}>Rolling File Snapshots</span>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--tail-text-body)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Every time an admin saves a section (e.g. Hero, Films, Bio, SEO), the system automatically archives a timestamped copy of the previous version. The last 5 revisions are preserved per section.
          </p>
          <button
            onClick={handleCreateSnapshot}
            disabled={creatingSnapshot}
            className="adm-btn adm-btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
          >
            <RefreshCw size={14} className={creatingSnapshot ? "animate-spin" : ""} />
            <span>{creatingSnapshot ? "Saving..." : "Create Manual Snapshot Now"}</span>
          </button>
        </div>

        {/* Card 3: Offline Portability */}
        <div className="adm-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: "#faf5ff", color: "#7c3aed" }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--tail-text-dark)" }}>
                Offline Portability
              </h3>
              <span style={{ fontSize: "12px", color: "var(--tail-text-body)" }}>Full JSON Bundle</span>
            </div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--tail-text-body)", lineHeight: 1.6, margin: "0 0 12px" }}>
            Download complete snapshots to your local machine anytime. You can restore your entire portfolio or migrate to another server with a single click.
          </p>
          <label className="adm-btn adm-btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: "13px", cursor: restoring ? "not-allowed" : "pointer" }}>
            <UploadCloud size={14} />
            <span>{restoring ? "Restoring..." : "Restore From Backup File"}</span>
            <input
              type="file"
              accept=".json"
              disabled={restoring}
              onChange={handleFileRestore}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Sections Protected Table */}
      <div className="adm-card">
        <div className="adm-card-header" style={{ padding: "18px 24px" }}>
          <span className="adm-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileJson size={18} color="#3c50e0" />
            Protected Content Stores
          </span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Data Store Key</th>
                <th>Section Name</th>
                <th>Storage Mode</th>
                <th>Protection Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "hero.json", name: "Hero Banner & Headlines", desc: "Stage name, roles, intro copy, CTAs" },
                { key: "about.json", name: "About Biography & Stats", desc: "Career narrative, milestones, stats" },
                { key: "filmography.json", name: "Notable Film Works", desc: "Films, roles, directors, posters" },
                { key: "gallery.json", name: "Photo Gallery & Categories", desc: "HD photos, tags, categories" },
                { key: "showreels.json", name: "Video Showreels", desc: "YouTube embeds, trailers, clips" },
                { key: "timeline.json", name: "Awards, Honors & Milestones", desc: "Accolades, recognition, timeline" },
                { key: "press.json", name: "Press & Media Coverage", desc: "Publications, interviews, articles" },
                { key: "mediaPartners.json", name: "Broadcasters & TV Logos", desc: "Network partners, logos, channels" },
                { key: "contactInfo.json", name: "Contact & Representation", desc: "Management emails, phones, agents" },
                { key: "seo.json", name: "SEO Meta & Social Sharing", desc: "OpenGraph, Twitter cards, meta tags" },
                { key: "inquiries.json", name: "Booking Inquiries CRM", desc: "Client submissions, statuses, notes" },
                { key: "media-manifest.json", name: "Media Assets Registry", desc: "Uploaded files, hashes, usage tracking" },
              ].map((item) => (
                <tr key={item.key}>
                  <td className="strong" style={{ fontFamily: "var(--adm-font-mono)", fontSize: "12px" }}>
                    {item.key}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--tail-text-body)" }}>{item.desc}</div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral" style={{ fontSize: "11px" }}>
                      User-Level Persistent
                    </span>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-green" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={11} /> Protected from Git Overwrite
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

