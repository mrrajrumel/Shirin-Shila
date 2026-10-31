"use client";

import React, { useEffect, useState } from "react";
import {
  Shield,
  User2,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Create User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager">("manager");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "manager">("manager");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  // In-flight role update state (for inline role changer)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
      if (res.status === 403) throw new Error("Access denied. Administrator role required.");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load users.");
      }
      const data = await res.json();
      setUsers(data.users || []);
      if (data.currentUserId) setCurrentUserId(data.currentUserId);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter]);

  const showTempSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Password generator helper
  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setShowPassword(true);
  };

  // Add User submit handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError(null);
    setIsSubmittingNew(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          displayName: newDisplayName.trim(),
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setIsAddModalOpen(false);
      setNewUsername("");
      setNewDisplayName("");
      setNewPassword("");
      setNewRole("manager");
      showTempSuccess(`User @${data.user.username} created successfully.`);
      fetchUsers();
    } catch (err: any) {
      setAddModalError(err.message || "Failed to create user");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Open Edit User modal
  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
    setEditRole(user.role);
    setEditModalError(null);
  };

  // Edit User submit handler
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError(null);
    setIsSubmittingEdit(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          displayName: editDisplayName.trim(),
          role: editRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user.");
      }

      setEditingUser(null);
      showTempSuccess(`User @${editingUser.username} updated successfully.`);
      fetchUsers();
    } catch (err: any) {
      setEditModalError(err.message || "Failed to update user");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Quick inline role change handler directly from user table
  const handleQuickRoleChange = async (user: UserRecord, targetRole: "admin" | "manager") => {
    if (user.role === targetRole) return;
    setError(null);
    setSuccessNotice(null);
    setUpdatingUserId(user.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          displayName: user.displayName,
          role: targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user role.");
      }

      showTempSuccess(`Role for @${user.username} successfully updated to ${roleLabel(targetRole)}.`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Delete User submit handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteModalError(null);
    setIsSubmittingDelete(true);

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(deletingUser.id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setDeletingUser(null);
      showTempSuccess(`User @${deletingUser.username} deleted.`);
      fetchUsers();
    } catch (err: any) {
      setDeleteModalError(err.message || "Failed to delete user");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const roleLabel = (role: string) => (role === "admin" ? "Administrator" : "Manager");

  return (
    <div className="adm-content">
      {/* Page Header */}
      <div className="adm-header" style={{ padding: "0 0 16px 0", marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <h2 className="adm-header-title" style={{ fontSize: 20 }}>
            User &amp; Role Management
          </h2>
          <p className="adm-help-text" style={{ marginTop: 4 }}>
            Control system access levels, add team administrators, and manage permissions.
          </p>
        </div>
        <div className="adm-header-actions">
          <button
            type="button"
            className="adm-btn adm-btn-secondary adm-btn-sm"
            onClick={fetchUsers}
            disabled={loading}
            title="Reload list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => {
              setAddModalError(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #10b981",
            borderRadius: 8,
            padding: "12px 18px",
            color: "#065f46",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#feebeb",
            border: "1px solid #eb5757",
            borderRadius: 8,
            padding: "12px 18px",
            color: "#b91c1c",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
          }}
        >
          <AlertTriangle size={18} color="#eb5757" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="adm-card" style={{ marginBottom: 24, padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          {/* Search Field */}
          <div style={{ position: "relative", minWidth: 260, flex: "1 1 300px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              className="adm-input"
              style={{ paddingLeft: 36, paddingRight: searchQuery ? 36 : 14 }}
              placeholder="Search by name, username, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: 4,
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Role Filter & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Filter Role:</span>
            <select
              className="adm-select"
              style={{ width: "auto", minWidth: 140, padding: "8px 12px", height: 38 }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="manager">Managers</option>
            </select>

            {(searchQuery || roleFilter !== "all") && (
              <button
                type="button"
                className="adm-btn adm-btn-secondary adm-btn-sm"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}

            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                background: "#f1f5f9",
                padding: "6px 12px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {users.length} {users.length === 1 ? "user" : "users"}
            </div>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">System Accounts</div>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Active credentials authorized for the management console
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-tail-primary" />
            <p>Loading user accounts…</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <User2 size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1c2434", marginBottom: 6 }}>
              No users found
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 400, margin: "0 auto 16px" }}>
              {searchQuery || roleFilter !== "all"
                ? "No authorized accounts matched your filter criteria."
                : "No authorized accounts configured in the system."}
            </p>
            {(searchQuery || roleFilter !== "all") && (
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>User</th>
                  <th style={{ width: "22%" }}>Role &amp; Permissions</th>
                  <th style={{ width: "24%" }}>Created / Updated</th>
                  <th style={{ width: "22%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  const isFounder = user.username.toLowerCase() === "shirin";

                  return (
                    <tr key={user.id}>
                      {/* User Column */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background:
                                user.role === "admin"
                                  ? "linear-gradient(135deg, #3c50e0 0%, #6366f1 100%)"
                                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 14,
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
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 600, color: "#1c2434" }}>
                                {user.displayName}
                              </span>
                              {isCurrent && (
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    padding: "1px 7px",
                                    borderRadius: 10,
                                    background: "#e0e7ff",
                                    color: "#4338ca",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                fontFamily: "monospace",
                                display: "block",
                                marginTop: 2,
                              }}
                            >
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <select
                              className="adm-select"
                              style={{
                                fontSize: 12,
                                padding: "4px 10px",
                                height: 32,
                                width: "auto",
                                minWidth: 140,
                                borderRadius: 6,
                                borderColor: user.role === "admin" ? "#93c5fd" : "#a7f3d0",
                                background: user.role === "admin" ? "#eff6ff" : "#ecfdf5",
                                color: user.role === "admin" ? "#1d4ed8" : "#065f46",
                                fontWeight: 700,
                                cursor: isFounder ? "not-allowed" : "pointer",
                              }}
                              value={user.role}
                              disabled={updatingUserId === user.id || isFounder}
                              onChange={(e) => handleQuickRoleChange(user, e.target.value as "admin" | "manager")}
                              title={
                                isFounder
                                  ? "Primary founder account role is permanent Administrator"
                                  : "Click to change system role"
                              }
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Manager</option>
                            </select>

                            {updatingUserId === user.id && (
                              <RefreshCw size={14} className="animate-spin text-tail-primary" />
                            )}
                          </div>

                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "#64748b",
                              marginTop: 4,
                            }}
                          >
                            {user.role === "admin"
                              ? "Full access (CMS, Users, Backups, SEO)"
                              : "Content management & inquiries CRM"}
                          </span>
                        </div>
                      </td>

                      {/* Dates Column */}
                      <td>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          <div>
                            <span style={{ color: "#94a3b8" }}>Added: </span>
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          {user.updatedAt && user.updatedAt !== user.createdAt && (
                            <div style={{ marginTop: 2, fontSize: 11, color: "#94a3b8" }}>
                              Updated:{" "}
                              {new Date(user.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            onClick={() => openEditModal(user)}
                            title="Edit user details and role"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            onClick={() => {
                              setDeleteModalError(null);
                              setDeletingUser(user);
                            }}
                            disabled={isCurrent || isFounder}
                            title={
                              isCurrent
                                ? "Cannot delete yourself"
                                : isFounder
                                ? "Primary founder account cannot be deleted"
                                : "Delete user account"
                            }
                            style={{
                              opacity: isCurrent || isFounder ? 0.4 : 1,
                              cursor: isCurrent || isFounder ? "not-allowed" : "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Explanation Card */}
      <div
        className="adm-card"
        style={{
          marginTop: 20,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          padding: "18px 24px",
        }}
      >
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1c2434", marginBottom: 8 }}>
          Role-Based Access Control (RBAC) Architecture
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Shield size={14} color="#3c50e0" />
              <strong style={{ fontSize: 13, color: "#3c50e0" }}>Administrator</strong>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Full administrative privileges. Capable of creating, modifying, and deleting user
              accounts; modifying system security settings; triggering automated backups; running
              restores; editing SEO &amp; metadata; and managing all editorial content. At least one
              administrator must always exist.
            </p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <UserCheck size={14} color="#10b981" />
              <strong style={{ fontSize: 13, color: "#10b981" }}>Manager</strong>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Editorial and public relations privileges. Allowed to update portfolio media, notable
              works, press articles, photo gallery, awards &amp; honors, video showreels, media
              partner logos, manage incoming inquiries CRM, and edit their personal profile and
              password.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================================
          CREATE USER MODAL
          ====================================================================== */}
      {isAddModalOpen && (
        <div
          className="adm-modal-backdrop"
          onClick={() => !isSubmittingNew && setIsAddModalOpen(false)}
        >
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">Create New User</div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => !isSubmittingNew && setIsAddModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="adm-modal-body">
                {addModalError && (
                  <div
                    style={{
                      background: "#feebeb",
                      border: "1px solid #eb5757",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "#b91c1c",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {addModalError}
                  </div>
                )}

                <div className="adm-form-group">
                  <label className="adm-label">Username (login handle) *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    placeholder="e.g. editor_jane"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                    autoFocus
                  />
                  <span className="adm-help-text">
                    Unique handle, 3–30 characters (letters, numbers, hyphens, underscores).
                  </span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Display Name *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    placeholder="e.g. Jane Doe"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                  />
                  <span className="adm-help-text">Full name shown in the top bar and audit logs.</span>
                </div>

                <div className="adm-form-group">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <label className="adm-label" style={{ margin: 0 }}>
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3c50e0",
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600,
                      }}
                    >
                      <KeyRound size={12} />
                      <span>Generate Strong Password</span>
                    </button>
                  </div>

                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="adm-input"
                      placeholder="Minimum 8 characters (letters & numbers)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 4,
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="adm-help-text">
                    Passwords are encrypted securely using salted bcrypt (10 rounds).
                  </span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">System Role *</label>
                  <select
                    className="adm-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "admin" | "manager")}
                  >
                    <option value="manager">Manager (Content editing &amp; inquiries CRM)</option>
                    <option value="admin">Administrator (Full root access &amp; user management)</option>
                  </select>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingNew}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={isSubmittingNew}
                >
                  {isSubmittingNew ? "Creating User…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          EDIT USER MODAL
          ====================================================================== */}
      {editingUser && (
        <div
          className="adm-modal-backdrop"
          onClick={() => !isSubmittingEdit && setEditingUser(null)}
        >
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">Edit User @{editingUser.username}</div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => !isSubmittingEdit && setEditingUser(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="adm-modal-body">
                {editModalError && (
                  <div
                    style={{
                      background: "#feebeb",
                      border: "1px solid #eb5757",
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: "#b91c1c",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {editModalError}
                  </div>
                )}

                <div className="adm-form-group">
                  <label className="adm-label">Username</label>
                  <input
                    type="text"
                    disabled
                    className="adm-input"
                    value={`@${editingUser.username}`}
                    style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                  />
                  <span className="adm-help-text">Usernames are immutable for security.</span>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Display Name *</label>
                  <input
                    type="text"
                    required
                    className="adm-input"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Assigned Role *</label>
                  <select
                    className="adm-select"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "admin" | "manager")}
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {editingUser.role === "admin" && editRole === "manager" && (
                    <span className="adm-help-text" style={{ color: "#d97706" }}>
                      ⚠️ Demoting an Administrator will revoke user-management and backup access.
                      Ensure another Administrator exists.
                    </span>
                  )}
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={isSubmittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={isSubmittingEdit}
                >
                  {isSubmittingEdit ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          DELETE USER CONFIRMATION MODAL
          ====================================================================== */}
      {deletingUser && (
        <div
          className="adm-modal-backdrop"
          onClick={() => !isSubmittingDelete && setDeletingUser(null)}
        >
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="adm-modal-header" style={{ borderBottomColor: "#fee2e2" }}>
              <div className="adm-modal-title" style={{ color: "#b91c1c" }}>
                Confirm Account Deletion
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => !isSubmittingDelete && setDeletingUser(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="adm-modal-body">
              {deleteModalError && (
                <div
                  style={{
                    background: "#feebeb",
                    border: "1px solid #eb5757",
                    borderRadius: 6,
                    padding: "10px 14px",
                    color: "#b91c1c",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {deleteModalError}
                </div>
              )}

              <p style={{ fontSize: 14, color: "#1c2434", marginBottom: 12 }}>
                Are you sure you want to permanently delete the account for{" "}
                <strong>{deletingUser.displayName}</strong> (<code>@{deletingUser.username}</code>)?
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                This user will immediately lose access to the Shirin Shila administration portal. This
                action cannot be undone.
              </p>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setDeletingUser(null)}
                disabled={isSubmittingDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                onClick={handleDeleteUser}
                disabled={isSubmittingDelete}
              >
                {isSubmittingDelete ? "Deleting…" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
