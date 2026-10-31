"use client";

import React, { useEffect, useState } from "react";
import { Shield, User2 } from "lucide-react";

interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "manager";
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((r) => {
        if (r.status === 403) throw new Error("Access denied. Administrator role required.");
        if (!r.ok) throw new Error("Failed to load users.");
        return r.json();
      })
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const roleLabel = (role: string) =>
    role === "admin" ? "Administrator" : "Manager";

  const roleBadgeStyle = (role: string): React.CSSProperties =>
    role === "admin"
      ? { background: "#1e3a5f", color: "#60a5fa", border: "1px solid #2563eb" }
      : { background: "#1a3a2a", color: "#4ade80", border: "1px solid #16a34a" };

  return (
    <div className="adm-page-container">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Users &amp; Roles</h2>
          <p className="adm-page-subtitle">
            Authorized administrator accounts and their access levels.
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ color: "#94a3b8", padding: "24px 0" }}>Loading users…</div>
      )}

      {error && (
        <div
          style={{
            background: "#2d1a1a",
            border: "1px solid #dc2626",
            borderRadius: 8,
            padding: "16px 20px",
            color: "#fca5a5",
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                background: "#1e2533",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    {user.displayName}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: 20,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      ...roleBadgeStyle(user.role),
                    }}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 2,
                    fontFamily: "monospace",
                  }}
                >
                  @{user.username}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  {user.role === "admin"
                    ? "Full system access — content, settings, users, backup & security"
                    : "Content management access — edit content, view inquiries, manage media"}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {user.role === "admin" ? (
                  <Shield size={20} color="#60a5fa" />
                ) : (
                  <User2 size={20} color="#4ade80" />
                )}
              </div>
            </div>
          ))}

          <div
            style={{
              background: "#161d2b",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 10,
              padding: "14px 20px",
              marginTop: 8,
            }}
          >
            <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#64748b" }}>Role Permissions:</strong>
              <br />
              <strong style={{ color: "#60a5fa" }}>Administrator</strong> — Full access: content editing, SEO settings, backup &amp; restore, security configuration, and user management.
              <br />
              <strong style={{ color: "#4ade80" }}>Manager</strong> — Content access: hero, about, works, gallery, showreel, press, media partners, timeline, contact portals, inquiries, page management, and profile settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
