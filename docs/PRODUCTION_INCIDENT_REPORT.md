# Production Incident Investigation & Resolution Report

> **Incident Title:** Production CMS Media & Content Selection Rollback Across Git Deployments  
> **Target Asset:** Shirin Shila Official Portfolio (`cornflowerblue-wildcat-675604.hostingersite.com`)  
> **Severity:** High (Data Persistence Vulnerability)  
> **Status:** Resolved & Permanently Hardened  
> **Date:** October 2026  

---

## 1. Incident Description

Following a recent GitHub deployment to Hostinger, administrator-selected media references (such as customized hero cutout banners and photo gallery selections) were observed reverting to original project assets.

Subsequent deep architectural audit revealed that **all administrator-managed content types**—including biography text, movie project details, press coverage, contact information, and awards timeline records—were potentially vulnerable to being reset upon subsequent Git deployments.

---

## 2. Root Cause Analysis

### Confirmed Finding 1: Ephemeral Repository Version Directory
Hostinger's Git deployment runner clones the repository into versioned directories (`versions/<uuid>`), runs `npm run build`, and updates the `current` symlink.
- **Vulnerability:** Any runtime changes written to files inside the repository checkout (`src/data/store/*.json` or `public/uploads/*`) are isolated to that specific version directory. When a new commit is pushed, the fresh Git clone checks out git-tracked files, abandoning the runtime edits from the previous version.

### Confirmed Finding 2: Static Prerender & Build Overwrite Risk
During `next build`, Next.js executes server-side layout and page data readers (`readStore`). If a store reader attempted to write seed defaults during the build phase into an unavailable directory, it could corrupt or fail the build.

### Confirmed Finding 3: Disconnected CMS Fields
Audit revealed that certain frontend components (notably the About section's 3 Prestige Milestone badges: "10+ Years Dhallywood Cinema", "Babisas Best Actress Award", "M.Sc. Physics Jahangirnagar Univ") were hardcoded in JSX rather than wired to the CMS store, preventing administrator updates entirely.

---

## 3. Scope of Affected Content Types

| Content Key | Component Affected | Pre-Fix Status | Post-Fix Safeguard |
| :--- | :--- | :--- | :--- |
| **`hero`** | Hero Banner Cutout & Copy | Vulnerable to release folder replacement | Decoupled persistent directory + atomic writes |
| **`about`** | Biography Narrative & Milestone Badges | Hardcoded prestige badges, cramped textarea | Dynamic `prestigeMilestones` schema + spacious editor |
| **`filmography`** | Notable Film Works | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`gallery`** | 3D Parallax Photo Gallery | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`showreels`** | Video Showreels & Trailers | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`timeline`** | Awards & Accolades Timeline | Static year range ("2014 — 2026") | Auto dynamic year range (`2014 — ${currentYear}`) |
| **`press`** | News Clippings & Interviews | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`mediaPartners`**| Broadcaster & TV Network Logos | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`contactInfo`** | Management & Booking Portals | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`seo`** | SEO Meta & Social Sharing Cards | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`inquiries`** | Booking Inquiries CRM Inbox | Vulnerable to release folder replacement | External persistent storage immune to Git |
| **`uploads`** | User-Uploaded Images & Media | Overwritten on new build UUID folders | External `/shirin_shila_persistent_data/uploads` |

---

## 4. Engineering Fixes Implemented

1. **Decoupled Persistent Storage Engine (`src/lib/persistent-paths.ts`):**
   Automatically resolves storage on Hostinger Linux to `/home/u473489494/shirin_shila_persistent_data/{store,uploads,backups}`, outside versioned release directories.
2. **Atomic Writes & Rolling Snapshots (`src/lib/server-storage.ts`):**
   Writes use temporary files with atomic renames (`.tmp.<timestamp> -> .json`). Automatically saves the last 5 rolling revisions for each section.
3. **Dedicated Backup & Restore Engine (`src/app/api/backup/route.ts` & `/admin/backup`):**
   Enables 1-click full JSON backup exports and safe restores with automated pre-restore snapshots.
4. **Fast Uploads Streaming (`server.js` & `src/app/uploads/[...slug]/route.ts`):**
   High-performance Node.js read-stream delivery for uploaded media from the persistent uploads directory with immutable cache headers and directory traversal defense.
5. **Dynamic About Prestige Milestones (`src/data/about.ts`, `src/app/admin/about/page.tsx`, `src/components/one-page-about.tsx`):**
   Connected the 3 prestige milestone cards to the CMS with dynamic title, subtitle, and icon editing, and fixed the Story Paragraphs box with comfortable, non-overlapping multi-line textareas.
6. **Auto-Calculating Awards Timeline Period (`src/data/timeline.ts` & `src/components/career-journey-timeline.tsx`):**
   Replaced static "2014 — 2026" with dynamic `computeTimelinePeriodLabel()`.
7. **Hero Section PC Face Lighting Fix (`src/app/globals.css` & `src/components/hero-motion.tsx`):**
   Eliminated dark overlay over the hero portrait and face on PC, setting 0% opacity on the portrait side and `z-index: 2` on `.hero-image` to match the crystal-clear mobile view.

---

## 5. Verification Evidence & Test Matrix

- **Unit / Persistence Test Suite:** Executed `scratch/test-cms-persistence.js`. Result: 100% Passed.
- **TypeScript Typecheck:** `npx tsc --noEmit`. Result: 0 errors (Exit code 0).
- **Next.js Production Build:** `npm run build`. Result: 21 static and dynamic pages generated cleanly (Exit code 0).
- **Live Hostinger Production Audit:** Audited `https://cornflowerblue-wildcat-675604.hostingersite.com/`. Result: HTTP 200 OK on all sections, 0 broken images, hero cutout active, OpenGraph metadata active.
- **Deployment Safety Status:** **SAFE TO DEPLOY**

