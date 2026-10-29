"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LayoutTemplate,
  User,
  Tv,
  Share2,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If on login page, render plain without sidebar shell
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    // Fetch incoming inquiries count
    fetch("/api/inquiries")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.items) {
          const count = data.items.filter((i: any) => i.status === "New").length;
          setNewInquiriesCount(count);
        }
      })
      .catch(() => {});
  }, [pathname, isLoginPage]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navGroups = [
    {
      group: "MAIN MENU",
      items: [
        { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
      ],
    },
    {
      group: "EDITORIAL & CONTENT",
      items: [
        { href: "/admin/hero", label: "Hero Banner", icon: LayoutTemplate },
        { href: "/admin/about", label: "About Biography", icon: User },
        { href: "/admin/showreel", label: "Video Showreels", icon: Video },
        { href: "/admin/works", label: "Notable Works", icon: Film },
        { href: "/admin/gallery", label: "Photo Gallery", icon: ImageIcon },
        { href: "/admin/timeline", label: "Awards & Honors", icon: Clock },
        { href: "/admin/press", label: "Press & Media", icon: Newspaper },
        { href: "/admin/media-partners", label: "Media & TV Logos", icon: Tv },
      ],
    },
    {
      group: "COMMUNICATIONS & CRM",
      items: [
        { href: "/admin/contact", label: "Contact & Portals", icon: Share2 },
        {
          href: "/admin/inquiries",
          label: "Inquiries CRM",
          icon: Inbox,
          badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
        },
      ],
    },
  ];

  const currentNav = navGroups
    .flatMap((g) => g.items)
    .find((item) => item.href === pathname);
  const pageTitle = currentNav ? currentNav.label : "TailAdmin Management";

  return (
    <div className="adm-root">
      {/* Mobile Drawer Overlay */}
      <div
        className={`adm-sidebar-overlay ${isSidebarOpen ? "is-open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* TailAdmin Sleek Sidebar (Dark Navy Slate) */}
      <aside className={`adm-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        {/* Brand Header */}
        <div className="adm-sidebar-brand">
          <div className="adm-brand-left">
            <div className="adm-brand-logo-icon" style={{ background: "transparent", padding: 0 }}>
              <img
                src="/assets/logos/tso-logo-white.svg"
                alt="Tune Soul Ocean"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="adm-brand-title">Tune Soul Ocean</span>
              <span className="adm-brand-subtitle">Management Dashboard</span>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="adm-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="adm-nav-group-label">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`adm-nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="adm-nav-badge new">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="adm-sidebar-footer">
          <a
            href="https://trytso.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="adm-status-chip hover:text-white transition-colors"
            title="Visit Tune Soul Ocean Management"
          >
            <span className="adm-status-dot" />
            <span>Tune Soul Ocean Management</span>
          </a>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/"
              target="_blank"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ flex: 1, backgroundColor: "#262e3f", color: "#fff", borderColor: "rgba(255,255,255,0.1)" }}
              title="Open public website in new tab"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ backgroundColor: "#262e3f", color: "#ff8cab", borderColor: "rgba(255,255,255,0.1)" }}
              title="Sign out of admin session"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* TailAdmin Main Content Shell */}
      <div className="adm-main">
        {/* TailAdmin Sticky Top Bar */}
        <header className="adm-topbar">
          <div className="adm-header-left">
            <button
              type="button"
              className="adm-hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="adm-header-title">{pageTitle}</h1>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="adm-header-actions">
            <Link
              href="/"
              target="_blank"
              className="adm-btn adm-btn-secondary adm-btn-sm hidden sm:inline-flex"
            >
              <span>Live Website</span>
              <ExternalLink size={13} />
            </Link>

            <div className="adm-user-chip">
              <div className="adm-user-avatar">
                <span>SS</span>
                <span className="adm-user-online-dot" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-800">
                  Shirin Shila
                </span>
                <span className="block text-[11px] text-slate-500 font-mono">
                  Administrator
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Dynamic CMS Page Content */}
        {children}
      </div>
    </div>
  );
}
