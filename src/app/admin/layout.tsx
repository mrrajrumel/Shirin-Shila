"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Globe,
  FolderKanban,
  ShieldCheck,
  FileText,
  UserCircle,
  Users2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Command,
  Loader2,
  Database,
} from "lucide-react";
import "./admin.css";

interface SearchableModule {
  href: string;
  label: string;
  group: string;
  description: string;
  keywords: string[];
  icon: any;
  adminOnly?: boolean;
}

interface DbSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  image?: string;
  type: 'record';
}

const ALL_SEARCHABLE_MODULES: SearchableModule[] = [
  {
    href: "/admin",
    label: "Dashboard Overview",
    group: "MAIN MENU",
    description: "System overview, CRM activity, quick metrics and recent site updates",
    keywords: ["home", "dashboard", "overview", "stats", "metrics", "analytics"],
    icon: LayoutDashboard,
  },
  {
    href: "/admin/media",
    label: "Media Library",
    group: "MEDIA & ASSETS",
    description: "Upload and manage photos, posters, logos, banners, and asset URLs",
    keywords: ["media", "images", "upload", "photos", "assets", "library", "storage", "pictures"],
    icon: FolderKanban,
  },
  {
    href: "/admin/hero",
    label: "Hero Banner",
    group: "EDITORIAL & CONTENT",
    description: "Homepage headline, portrait photography, badges, CTA button",
    keywords: ["hero", "banner", "headline", "portrait", "home", "title"],
    icon: LayoutTemplate,
  },
  {
    href: "/admin/about",
    label: "About Biography",
    group: "EDITORIAL & CONTENT",
    description: "Artistic bio, career highlights, acting philosophy, quick stats",
    keywords: ["about", "bio", "biography", "profile", "philosophy", "story"],
    icon: User,
  },
  {
    href: "/admin/showreel",
    label: "Video Showreels",
    group: "EDITORIAL & CONTENT",
    description: "Showreel video players, YouTube links, acting highlight reels",
    keywords: ["showreel", "video", "youtube", "trailer", "reel", "clips"],
    icon: Video,
  },
  {
    href: "/admin/works",
    label: "Notable Works",
    group: "EDITORIAL & CONTENT",
    description: "Feature films, TV dramas, OTT web series, music videos catalogue",
    keywords: ["works", "filmography", "movies", "films", "dramas", "theatre", "catalog"],
    icon: Film,
  },
  {
    href: "/admin/gallery",
    label: "Photo Gallery",
    group: "EDITORIAL & CONTENT",
    description: "Editorial photo shoots, event galleries, behind-the-scenes sets",
    keywords: ["gallery", "photos", "images", "photoshoot", "pictures", "editorial"],
    icon: ImageIcon,
  },
  {
    href: "/admin/timeline",
    label: "Awards & Honors",
    group: "EDITORIAL & CONTENT",
    description: "Awards, nominations, industry honors, lifetime achievements",
    keywords: ["timeline", "awards", "honors", "trophies", "recognition", "achievements"],
    icon: Clock,
  },
  {
    href: "/admin/press",
    label: "Press & Media",
    group: "EDITORIAL & CONTENT",
    description: "News articles, interview clippings, magazine profiles, press links",
    keywords: ["press", "news", "articles", "interviews", "media coverage", "clippings"],
    icon: Newspaper,
  },
  {
    href: "/admin/media-partners",
    label: "Media & TV Logos",
    group: "EDITORIAL & CONTENT",
    description: "Broadcaster logos, streaming platforms, production house partners",
    keywords: ["partners", "tv", "broadcasters", "logos", "ott", "channels", "networks"],
    icon: Tv,
  },
  {
    href: "/admin/contact",
    label: "Contact & Portals",
    group: "COMMUNICATIONS & CRM",
    description: "Management agency info, representation portals, social links",
    keywords: ["contact", "booking", "agency", "tso", "socials", "email", "representation"],
    icon: Share2,
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries CRM",
    group: "COMMUNICATIONS & CRM",
    description: "Incoming casting calls, booking requests, client inquiries inbox",
    keywords: ["inquiries", "messages", "inbox", "crm", "leads", "casting", "clients"],
    icon: Inbox,
  },
  {
    href: "/admin/pages",
    label: "Page Management",
    group: "PAGES & CMS POLICIES",
    description: "Privacy policy, terms of representation, and llms.txt content",
    keywords: ["pages", "privacy", "terms", "legal", "llms", "policies", "conditions"],
    icon: FileText,
  },
  {
    href: "/admin/seo",
    label: "SEO & Meta Data",
    group: "SEO & SYSTEM SETTINGS",
    description: "OpenGraph tags, search preview, Twitter cards, structured schema",
    keywords: ["seo", "meta", "keywords", "opengraph", "search engine", "google"],
    icon: Globe,
  },
  {
    href: "/admin/backup",
    label: "Data & Persistence",
    group: "SEO & SYSTEM SETTINGS",
    description: "MySQL database backups, manual snapshots, JSON recovery",
    keywords: ["backup", "database", "mysql", "restore", "persistence", "export", "dump"],
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    group: "SEO & SYSTEM SETTINGS",
    description: "Team accounts, administrator and manager role permissions",
    keywords: ["users", "roles", "team", "accounts", "permissions", "rbac", "passwords"],
    icon: Users2,
    adminOnly: true,
  },
  {
    href: "/admin/profile",
    label: "Profile & Security",
    group: "SEO & SYSTEM SETTINGS",
    description: "Personal display name, account credentials, and password change",
    keywords: ["profile", "password", "security", "account", "credentials", "self"],
    icon: UserCircle,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName: string; role?: string } | null>(null);

  // Global Quick Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [dbResults, setDbResults] = useState<DbSearchResultItem[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // If on login page, render plain without sidebar shell
  const isLoginPage = pathname === "/admin/login";

  // Load sidebar collapsed state from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adm_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adm_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

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

  // Close mobile sidebar and search dropdown on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    setDbResults([]);
    setIsSearchingDb(false);
  }, [pathname]);

  // Debounced live database search when query >= 2 characters
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setDbResults([]);
      setIsSearchingDb(false);
      return;
    }

    setIsSearchingDb(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setDbResults(data.items || []);
        }
      } catch {
        // Ignore network errors or aborted searches
      } finally {
        setIsSearchingDb(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Global hotkeys (Ctrl+K, Escape) and click-outside listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes mobile sidebar and search dropdown
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
        setIsSearchOpen(false);
        return;
      }

      // Ctrl+K or Cmd+K focuses quick search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      group: "MEDIA & ASSETS",
      items: [
        { href: "/admin/media", label: "Media Library", icon: FolderKanban },
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
    {
      group: "PAGES & CMS POLICIES",
      items: [
        { href: "/admin/pages", label: "Page Management", icon: FileText },
      ],
    },
    {
      group: "SEO & SYSTEM SETTINGS",
      items: [
        { href: "/admin/seo", label: "SEO & Meta Data", icon: Globe },
        ...(currentUser?.role === "admin"
          ? [{ href: "/admin/backup", label: "Data & Persistence", icon: ShieldCheck }]
          : []),
        ...(currentUser?.role === "admin"
          ? [{ href: "/admin/users", label: "Users & Roles", icon: Users2 }]
          : []),
        { href: "/admin/profile", label: "Profile & Security", icon: UserCircle },
      ],
    },
  ];

  // Filter modules based on search query and current user's role
  const filteredModules = ALL_SEARCHABLE_MODULES.filter((mod) => {
    if (mod.adminOnly && currentUser?.role !== "admin") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      mod.label.toLowerCase().includes(q) ||
      mod.group.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.keywords.some((k) => k.includes(q))
    );
  });

  const totalModules = filteredModules.length;
  const totalDbResults = dbResults.length;
  const totalItems = totalModules + totalDbResults;

  const navigateToDestination = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setDbResults([]);
    router.push(href);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev < totalItems - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, totalItems - 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSearchIndex < totalModules) {
        if (filteredModules[selectedSearchIndex]) {
          navigateToDestination(filteredModules[selectedSearchIndex].href);
        }
      } else {
        const dbIdx = selectedSearchIndex - totalModules;
        if (dbResults[dbIdx]) {
          navigateToDestination(dbResults[dbIdx].url);
        }
      }
    }
  };

  return (
    <div className="adm-root">
      {/* Mobile Drawer Overlay */}
      <div
        className={`adm-sidebar-overlay ${isSidebarOpen ? "is-open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* TailAdmin Sleek Sidebar (Dark Navy Slate) */}
      <aside
        className={`adm-sidebar ${isSidebarOpen ? "is-open" : ""} ${
          isCollapsed ? "is-collapsed" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="adm-sidebar-brand">
          <div className="adm-brand-left">
            <div className="adm-brand-logo-icon" style={{ background: "transparent", padding: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logos/tso-logo-white.svg"
                alt="Tune Soul Ocean"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div>
                <span className="adm-brand-title">Tune Soul Ocean</span>
                <span className="adm-brand-subtitle">Management Dashboard</span>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            type="button"
            className="adm-collapse-btn hidden lg:flex"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          {/* Mobile Close Button */}
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
                    title={isCollapsed ? item.label : undefined}
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
            title="Tune Soul Ocean Management"
          >
            <span className="adm-status-dot" />
            <span>Tune Soul Ocean Management</span>
          </a>

          <div
            className="adm-sidebar-footer-actions"
            style={{ display: "flex", gap: "8px", width: "100%" }}
          >
            <Link
              href="/"
              target="_blank"
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{
                flex: 1,
                backgroundColor: "#262e3f",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.1)",
              }}
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
              style={{
                backgroundColor: "#262e3f",
                color: "#e2e8f0",
                borderColor: "rgba(255,255,255,0.1)",
              }}
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
          </div>

          {/* Global Quick Search / Command Palette */}
          <div className="adm-topbar-search" ref={searchContainerRef}>
            <div className="adm-topbar-search-input-wrap">
              <Search size={15} className="adm-topbar-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="adm-topbar-search-input"
                placeholder="Search admin..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setSelectedSearchIndex(0);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Quick search admin modules and database records"
              />
              {isSearchingDb ? (
                <Loader2 size={14} className="adm-topbar-search-spinner animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDbResults([]);
                  }}
                  className="adm-topbar-search-clear"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="adm-topbar-search-kbd hidden sm:inline-flex">
                  <Command size={10} style={{ marginRight: 1 }} />K
                </span>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {isSearchOpen && (searchQuery.trim().length > 0 || isSearchOpen) && (
              <div className="adm-search-dropdown">
                {totalItems === 0 ? (
                  <div
                    style={{
                      padding: "18px 14px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    {isSearchingDb ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Loader2 size={16} className="animate-spin text-primary" />
                        <span>Searching database &amp; modules...</span>
                      </div>
                    ) : (
                      <>No admin modules or database records matched &quot;{searchQuery}&quot;</>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Navigation Modules Section */}
                    {totalModules > 0 && (
                      <div className="adm-search-section">
                        <div className="adm-search-section-header">
                          <span>Navigation Modules</span>
                          <span className="adm-search-section-count">{totalModules}</span>
                        </div>
                        {filteredModules.map((mod, index) => {
                          const ModIcon = mod.icon;
                          const isSelected = index === selectedSearchIndex;
                          return (
                            <div
                              key={mod.href}
                              className={`adm-search-item ${isSelected ? "is-selected" : ""}`}
                              onClick={() => navigateToDestination(mod.href)}
                              onMouseEnter={() => setSelectedSearchIndex(index)}
                            >
                              <div className="adm-search-item-icon">
                                <ModIcon size={16} />
                              </div>
                              <div className="adm-search-item-info">
                                <div className="adm-search-item-title">
                                  <span>{mod.label}</span>
                                  <span className="adm-search-item-group">{mod.group}</span>
                                </div>
                                <div className="adm-search-item-desc">{mod.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Database & Content Records Section */}
                    {totalDbResults > 0 && (
                      <div className="adm-search-section">
                        <div className="adm-search-section-header">
                          <span>Database &amp; Content Records</span>
                          <span className="adm-search-section-count">{totalDbResults}</span>
                        </div>
                        {dbResults.map((rec, index) => {
                          const itemIndex = totalModules + index;
                          const isSelected = itemIndex === selectedSearchIndex;
                          return (
                            <div
                              key={rec.id}
                              className={`adm-search-item ${isSelected ? "is-selected" : ""}`}
                              onClick={() => navigateToDestination(rec.url)}
                              onMouseEnter={() => setSelectedSearchIndex(itemIndex)}
                            >
                              {rec.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={rec.image}
                                  alt=""
                                  className="adm-search-item-thumb"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="adm-search-item-icon">
                                  <Database size={15} />
                                </div>
                              )}
                              <div className="adm-search-item-info">
                                <div className="adm-search-item-title">
                                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{rec.title}</span>
                                  <span className="adm-search-item-group">{rec.category}</span>
                                </div>
                                <div className="adm-search-item-desc">{rec.subtitle}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Live searching status hint if background DB search is still querying */}
                    {isSearchingDb && (
                      <div
                        style={{
                          padding: "8px 12px",
                          borderTop: "1px solid #f1f5f9",
                          fontSize: 11,
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          justifyContent: "center",
                        }}
                      >
                        <Loader2 size={12} className="animate-spin text-primary" />
                        <span>Updating live database records...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions */}
          <div className="adm-header-actions adm-topbar-actions">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              title="Sign out of admin session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic CMS Page Content */}
        {children}
      </div>
    </div>
  );
}
