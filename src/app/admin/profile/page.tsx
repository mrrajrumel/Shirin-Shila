"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Check, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Display name form
  const [displayName, setDisplayName] = useState('');
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingName, setSavingName] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile(data.user);
        setDisplayName(data.user.displayName);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameStatus(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev) => prev ? { ...prev, displayName: data.user.displayName } : prev);
        setDisplayName(data.user.displayName);
        setNameStatus({ type: 'success', message: 'Display name updated successfully.' });
      } else {
        setNameStatus({ type: 'error', message: data.error || 'Failed to update display name.' });
      }
    } catch {
      setNameStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwStatus({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    setSavingPw(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwStatus({ type: 'success', message: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwStatus({ type: 'error', message: data.error || 'Failed to change password.' });
      }
    } catch {
      setPwStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-actions">
          <button
            type="button"
            onClick={loadProfile}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="adm-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--tail-text-body)' }}>
            Loading profile…
          </div>
        ) : (
          <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Account Info Card */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--tail-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                    {(profile?.displayName || profile?.username || 'A').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--tail-text-dark)' }}>
                      {profile?.displayName || profile?.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--tail-text-body)', fontFamily: 'var(--adm-font-mono)' }}>
                      @{profile?.username}
                    </div>
                  </div>
                </div>
                <span className="adm-badge adm-badge-blue" style={{ fontWeight: 700 }}>
                  {profile?.role?.toUpperCase() || 'ADMIN'}
                </span>
              </div>
              {profile?.updatedAt && (
                <div style={{ padding: '0 20px 16px', fontSize: '12px', color: 'var(--tail-text-body)' }}>
                  Last updated: {new Date(profile.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Display Name Form */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="var(--tail-primary)" />
                  <span className="adm-card-title">Display Name</span>
                </div>
              </div>
              <form onSubmit={handleSaveName} style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Full name shown in the admin panel
                  </label>
                  <input
                    type="text"
                    className="adm-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={64}
                    placeholder="Your display name"
                    required
                  />
                </div>

                {nameStatus && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                    background: nameStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: nameStatus.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${nameStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  }}>
                    {nameStatus.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {nameStatus.message}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={savingName || !displayName.trim()}
                    className="adm-btn adm-btn-primary"
                  >
                    {savingName ? 'Saving…' : 'Save Display Name'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="var(--tail-primary)" />
                  <span className="adm-card-title">Change Password</span>
                </div>
              </div>
              <form onSubmit={handleChangePassword} style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Current password */}
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="adm-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      required
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tail-text-body)', padding: '2px' }}
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="adm-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters, letters + numbers"
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tail-text-body)', padding: '2px' }}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: newPassword.length >= 8 && /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? '#059669' : '#dc2626' }}>
                      {newPassword.length >= 8 && /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
                        ? 'Meets requirements'
                        : 'Needs 8+ characters with letters and numbers'}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="adm-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="adm-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tail-text-body)', padding: '2px' }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#dc2626' }}>
                      Passwords do not match
                    </div>
                  )}
                </div>

                {pwStatus && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                    background: pwStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: pwStatus.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${pwStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  }}>
                    {pwStatus.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {pwStatus.message}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={savingPw || !currentPassword || !newPassword || !confirmPassword}
                    className="adm-btn adm-btn-primary"
                  >
                    {savingPw ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}
      </main>
    </>
  );
}

