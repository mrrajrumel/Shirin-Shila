# Review 1: Full System Architecture & Data-Integrity Audit

**Target System:** Shirin Shila Actor Portfolio (`https://shirinshila.com/`)  
**Hostinger Preview:** `https://cornflowerblue-wildcat-675604.hostingersite.com/`  
**Repository:** `https://github.com/mrrajrumel/Shirin-Shila.git`  
**Audit Scope:** End-to-End Stack, Custom Domain, Data Flow, Security, RBAC, and Route Architecture  
**Status:** Completed & Remediated  

---

## 1. System Overview & Technology Stack

The application is a high-performance, single-page cinematic actor portfolio and digital talent management desk for Bangladeshi film actress Shirin Shila.

* **Framework:** Next.js 16.4.3 (App Router architecture, webpack build mode)
* **Frontend Runtime:** React 19, Framer Motion, Tailwind CSS, Lucide React
* **Backend Runtime:** Node.js 22 LTS on Hostinger Cloud Infrastructure
* **Database Layer:** MySQL (`u473489494_shirin`) with fallback to persistent JSON volume storage (`/home/u473489494/shirin_shila_persistent_data/store/`)
* **Authentication Subsystem:** Signed HMAC-SHA256 session tokens with bcrypt-hashed credentials and per-user/IP rate limiting
* **Primary Domain:** `https://shirinshila.com/` (apex) & `https://www.shirinshila.com/`

---

## 2. Route Architecture & Inventory

### A. Public Routes
1. `/` (Homepage): The primary single-page portfolio containing all interactive sections:
   * `#home`: Cinematic Hero banner with dynamic headline and media CTAs
   * `#about`: Biographical story, quick facts, and prestige career milestones
   * `#showreel`: Video showreel gallery
   * `#filmography`: Categorized filmography with category filters
   * `#gallery`: Visual parallax photo gallery
   * `#timeline`: Interactive career milestone journey & verified accolades
   * `#press`: Media coverage clippings and newspaper archive
   * `#contact`: Talent booking desk, office information, and inquiry submission form
   * `#broadcasters`: Auto-ticker of television channels and film production partners
2. `/terms`: Terms of Representation & Talent Booking Guidelines
3. `/privacy`: Data Protection & Confidentiality Policy
4. `/llms.txt`: Compact machine-readable portfolio manifest for AI agents and LLMs
5. `/llms-full.txt`: Comprehensive factual context profile for AI systems
6. `/.well-known/mcp/server-card.json`: Model Context Protocol (MCP) server manifest
7. `/api/markdown`: Alternate text/markdown representation of portfolio biography
8. `/sitemap.xml`: Dynamic XML sitemap listing active crawlable routes
9. `/robots.txt`: Web crawler directive file declaring sitemap and Content-Signals

### B. Retired Routes (Redirected)
* `/about` &rarr; Permanent 308 redirect to `/#about`
* `/contact` &rarr; Permanent 308 redirect to `/#contact`
* `/filmography`, `/works`, `/projects` &rarr; Permanent 308 redirect to `/#filmography`
* `/press` &rarr; Permanent 308 redirect to `/#press`

### C. Admin Panel Routes (`/admin/*`)
* `/admin/login`: Secure login portal with brute-force lockout protection
* `/admin`: TailAdmin dashboard overview with live system health indicators
* `/admin/media`: Media Asset Library and file uploader
* `/admin/hero`: Hero banner text, background imagery, and CTA buttons
* `/admin/about`: Homepage About section biography, highlights, and prestige milestones
* `/admin/showreel`: Video embeds, YouTube/Vimeo links, and display order
* `/admin/works`: Filmography items, posters, genres, and release years
* `/admin/gallery`: Photo gallery management
* `/admin/timeline`: Awards & Honors timeline milestones with permanent deletion tracking
* `/admin/press`: Press clippings and news links
* `/admin/media-partners`: Broadcasting and studio logo management
* `/admin/contact`: Talent management office phone, email, and social portals
* `/admin/inquiries`: Inbound inquiries CRM with status tracking
* `/admin/pages`: Legal policy management (Privacy Policy, Terms of Representation, llms.txt)
* `/admin/seo`: Global metadata, OpenGraph previews, favicon URL, and footer links
* `/admin/backup`: System snapshot generator, download, and restore (Admin only)
* `/admin/users`: User registry and role assignments (Admin only)
* `/admin/profile`: Authenticated user profile and password change console

---

## 3. End-to-End Data Flow Map

For each admin-managed feature, data flows along a secure, transactional path:

```
[ADMIN FORM]
      │
      ▼
[API ROUTE HANDLER / SERVER ACTION]
      │
      ├─► Server-Side Authentication (`verifySessionToken`)
      ├─► Server-Side Authorization (`hasMinimumRole`)
      ├─► Input Validation & Sanitization
      │
      ▼
[STORAGE ABSTRACTION (`writeStore`)]
      │
      ├─► 1. MySQL Query (`cms_content` table, parameterized JSON)
      └─► 2. Persistent Volume File Sync (`/home/.../persistent_data/store/*.json`)
      │
      ▼
[CACHE INVALIDATION (`revalidatePath`)]
      │
      ▼
[PUBLIC FRONTEND DATA FETCH (`readStore`)]
      │
      ▼
[RENDERED DOM / BROWSER CLIENT]
```

### Verification Highlights by Feature:
1. **Awards & Timeline:** `DELETE /api/timeline` &rarr; updates `deletedIds` &rarr; commits to `cms_content` &rarr; invalidates `/` &rarr; filtered on public render.
2. **About Biography:** `POST /api/about` &rarr; writes to `about` store &rarr; revalidates `/` &rarr; `OnePageAbout` displays updated story and milestones.
3. **Legal Policies:** `POST /api/pages` &rarr; writes to `pages` store &rarr; records revision in `page_revisions` table &rarr; revalidates `/privacy` and `/terms`.
4. **User Password Change:** `POST /api/auth/change-password` &rarr; bcrypt verifies current password &rarr; verifies 8+ char / letter+number policy &rarr; updates bcrypt hash in `admin-users.json` / `admin_users` table &rarr; logs audit event.

---

## 4. Confirmed Defects & Implemented Remedies

| Defect / Requirement | Root Cause | Remediated Implementation | Status |
|---|---|---|---|
| **Awards Deletion Bug** | Fallback to hardcoded seed data on empty arrays + missing store confirmation flag | Added `deletedIds[]` persistent tracking, `timelineLoadedFromStore` guard, and milestone separation | **PASS** |
| **Standalone `/about` & `/contact`** | Legacy standalone pages redundant with homepage sections | Removed standalone route files, added 308 redirects to `/#about` and `/#contact`, updated sitemap and footer links | **PASS** |
| **Admin Page Controls Clutter** | Page Management contained unused tabs and uploaders for removed pages | Removed `about` and `contact` from `PAGE_KEYS` in `/admin/pages`; preserved dedicated homepage section editors | **PASS** |
| **Privacy Policy Email Statement** | Hardcoded `Data inquiries: privacy@shirinshila.com` in footer and markdown | Completely removed from `src/app/privacy/page.tsx`, `src/data/pages.ts`, and `src/data/store/pages.json` | **PASS** |
| **Terms Email Statement** | Hardcoded `Questions regarding representation terms? Contact booking@shirinshila.com` | Completely removed from `src/app/terms/page.tsx`, `src/data/pages.ts`, and `src/data/store/pages.json` | **PASS** |
| **User Profile & Password Management** | No self-service console existed for authenticated users | Created `/admin/profile`, `/api/auth/profile`, and `/api/auth/change-password` with bcrypt verification | **PASS** |
| **Role-Based Access Control (RBAC)** | All accounts possessed equal, unsegmented admin privileges | Introduced `admin` vs. `manager` roles, added server-side `hasMinimumRole()` guard, protected backups & user registry | **PASS** |
