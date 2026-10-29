"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Video,
  Newspaper,
  Image as ImageIcon,
  Clock,
  Inbox,
  ExternalLink,
  LogOut,
  RefreshCw,
  LayoutTemplate,
  User,
  Tv,
  Share2,
} from 'lucide-react';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on login page, render plain without sidebar shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    // Fetch incoming inquiries count
    fetch('/api/inquiries')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items) {
          const count = data.items.filter((i: any) => i.status === 'New').length;
          setNewInquiriesCount(count);
        }
      })
      .catch(() => {});
  }, [pathname, isLoginPage]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/hero', label: 'Hero Section', icon: LayoutTemplate },
    { href: '/admin/about', label: 'About Us', icon: User },
    { href: '/admin/showreel', label: 'Showreel', icon: Video },
    { href: '/admin/works', label: 'Notable Works', icon: Film },
    { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/admin/timeline', label: 'Awards & Honors', icon: Clock },
    { href: '/admin/press', label: 'Press & Media', icon: Newspaper },
    { href: '/admin/media-partners', label: 'Media & TV Logos', icon: Tv },
    { href: '/admin/contact', label: 'Contact & Socials', icon: Share2 },
    {
      href: '/admin/inquiries',
      label: 'Inquiries CRM',
      icon: Inbox,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
  ];

  return (
    <div className="adm-root">
      {/* Minimal Left Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-brand-title">Shirin Shila</span>
          <span className="adm-brand-subtitle">Editorial CMS • Zero-DB</span>
        </div>

        <nav className="adm-sidebar-nav">
          <div className="adm-nav-group-label">Management Desk</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`adm-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="adm-nav-badge new">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-status-chip">
            <span className="adm-status-dot" />
            <span>Server JSON Sync: Active</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/"
              target="_blank"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ flex: 1 }}
              title="Open public website in new tab"
            >
              <span>Website</span>
              <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              title="Sign out of admin session"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="adm-main">
        {children}
      </div>
    </div>
  );
}
