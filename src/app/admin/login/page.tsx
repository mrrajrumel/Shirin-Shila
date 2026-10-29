"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import '../admin.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('admin@shirinshila.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'var(--adm-font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#121215',
          border: '1px solid #27272a',
          borderRadius: '10px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: '#18181b',
              border: '1px solid #27272a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f4f4f5',
              marginBottom: '14px',
            }}
          >
            <Lock size={18} />
          </div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#f4f4f5',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            Shirin Shila CMS
          </h1>
          <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>
            Talent Management & Editorial Desk
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#3b181c',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label">Admin Email</label>
            <input
              type="email"
              required
              className="adm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shirinshila.com"
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Password</label>
            <input
              type="password"
              required
              className="adm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="adm-btn adm-btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '10px 16px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #1f1f23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#71717a',
          }}
        >
          <ShieldCheck size={13} color="#22c55e" />
          <span>Encrypted Session • Zero-Database Mode</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#71717a',
            fontSize: '13px',
          }}
        >
          Loading Admin Security Gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
