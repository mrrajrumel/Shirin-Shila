# Shirin Shila — Official Cinematic Portfolio & Editorial CMS

The official, production-ready cinematic portfolio, media repository, and editorial Content Management System (CMS) for celebrated Bangladeshi film actress, reality show judge, and model **Shirin Shila** (Shirin Akter).

Built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS. The platform features luxury dark cinematic aesthetics, interactive 3D perspective parallax matrices, full theatrical filmography modals, career milestone accolade timelines, newspaper clippings zoom lightboxes, verified social/portal links, and a secure administrative management console with dual-layer MariaDB and decoupled filesystem persistence.

---

## 🌐 Official Production & Admin Portals

- **Production Website:** [https://shirinshila.com/](https://shirinshila.com/)
- **Admin Management Console:** [https://shirinshila.com/admin](https://shirinshila.com/admin)
- **Repository:** [https://github.com/mrrajrumel/Shirin-Shila](https://github.com/mrrajrumel/Shirin-Shila)
- **Production Host:** Hostinger Cloud Node.js 22 LTS
- **Production Database:** MariaDB 11.8 (`u473489494_shirin`)
- **Verified Release Commit:** `1ca97c9` (Branch: `main`)

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 | App Router, Server Components, API Route Handlers |
| **UI Library** | React 19.3.1 & React DOM 19.3.1 | Modern client and server hydration architecture |
| **Language** | TypeScript 5.7.2 | Strict type-checking with zero compilation errors |
| **Styling** | Tailwind CSS 3.4.16 & PostCSS | Custom luxury dark palette, responsive utilities |
| **Animation & Parallax** | Framer Motion 11.15.0 & GSAP 3.15.0 | Smooth scroll triggers, 3D cards, coverflow |
| **Database Engine** | MariaDB 11.8 / MySQL via `mysql2` 3.24.6 | Connection pooling, auto-schema migration |
| **Storage Fallback** | Decoupled JSON Stores (`src/lib/server-storage.ts`) | Out-of-band persistent storage, rolling revisions |
| **Image Processing** | Sharp 0.35.5 | Metadata extraction, responsive image optimization |
| **Authentication** | Cryptographic HMAC-SHA256 & bcryptjs 3.0.3 | Salted hashing, token versioning, session cookies |
| **Runtime Server** | Node.js 22 LTS (`server.js`) | Custom Hostinger Application Manager entry point |

---

## 🌟 Public Website Features & CMS-Managed Sections

The public portal is fully server-rendered (SSR) for instant first-contentful paint, SEO indexability, and zero layout shift:

1. **Kinetic Hero Section (`#home`):** Cinematic heading with clean typography (`<h1 class="serif">` and `<span class="pink">Shila</span>`), transparent cutout portrait with responsive mouse and scroll parallax, and dynamic call-to-actions. All legacy letter-mask hover filters have been completely removed for clean visual rendering.
2. **Biographical Story (`#about`):** Multi-paragraph biographical narrative, native Bengali titles, and key profile statistics managed dynamically via the CMS.
3. **Cinema Video Showreel (`#showreel`):** Interactive coverflow video showcase featuring acting reels, dramatic scenes, and trailer highlights with embedded video modals.
4. **Notable Works Archive (`#filmography`):**
   - Category filtering across: *Film*, *Television Drama*, *TV Show Judge (বিচারক)*, *Music Video*, *Commercial & Modelling*.
   - Rich dialog modal displaying full theatrical poster, synopsis, director, co-stars, production company, and accolades.
5. **Visual Honors Archive (`#gallery`):** Interactive 3D perspective parallax matrix presenting high-resolution trophy, red carpet, and gala photographs with fullscreen zoom lightbox.
6. **Accolades & Career Timeline (`#timeline`):** Chronological milestone timeline highlighting major film debuts and industry awards (Babisas Best Actress Winner, Meril-Prothom Alo Nominee, DIFF Best Actress). Integrates an automated background carousel for *Recognized Excellence* with smooth transitions.
7. **Press & Media Coverage (`#press`):** Unified carousel presenting online news articles and authentic newspaper clippings with zoom inspection.
8. **Broadcaster & Studio Logo Ticker (`#broadcasters`):** Seamless, infinite auto-scrolling ticker showcasing vector logos of Bangladesh's premier television channels and film production houses.
9. **Talent Management & Booking Desk (`#contact`):** Direct talent representation desk, email inquiry submission form with server-side CRM logging, and 8 verified portal links (Facebook Profile, Facebook Page, Instagram, YouTube, TikTok, IMDb, Wikipedia, Google Knowledge Panel).
10. **SEO Directives & AI Discoverability:** Automated `/robots.txt`, dynamic `/sitemap.xml`, and standardized AI discovery endpoints (`/llms.txt`, `/llms-full.txt`, `/.well-known/mcp/server-card.json`).

---

## 🔒 Admin Dashboard Modules & Access Control

The administrative portal (`/admin`) is a restricted, authenticated workspace designed for content operations and talent management:

- **Executive Overview (`/admin`):** High-level summary of CMS record counts, quick action shortcuts, recent system activity, and deployment status.
- **Editorial Section Editors:**
  - **Hero Banner (`/admin/hero`):** Subtitle, heading, bio preview, hero image selection, and CTA links.
  - **About Biography (`/admin/about`):** Multi-language narrative, biographical facts, and personal details.
  - **Notable Works (`/admin/works`):** Filmography CRUD manager with IMDb metadata scraper, poster selector, and category filters.
  - **Video Showreel (`/admin/showreel`):** Video card CRUD with YouTube/Vimeo metadata integration.
  - **Photo Gallery (`/admin/gallery`):** Parallax gallery image manager with title and category assignment.
  - **Awards & Honors (`/admin/timeline`):** Milestone and award manager with category sorting and media asset linkers.
  - **Press & Clippings (`/admin/press`):** Online press releases and newspaper scan manager.
  - **Media & TV Logos (`/admin/media-partners`):** Broadcaster logo ticker manager.
  - **Contact & Portals (`/admin/contact`):** Representation info, phone, email, and social profile links.
- **Central Media Library (`/admin/media`):** Deduplicated asset manager with drag-and-drop file uploader, folder filtering, file magic byte validation, usage reference detection, and single/bulk deletion.
- **Inquiries CRM Inbox (`/admin/inquiries`):** Real-time management of incoming booking, casting, and press requests submitted through the public contact form with status updates (*New*, *Read*, *Replied*) and direct mailto / WhatsApp shortcuts.
- **SEO & Search Console (`/admin/seo`):** Visual management of meta title, description, OpenGraph share preview image, favicons, and custom `<head>` verification scripts.
- **User & Role Management (`/admin/users`):** Admin-only module to manage authorized users, assign roles (`admin` or `manager`), change display names, and monitor user accounts.
- **System Backups (`/admin/backup`):** Admin-only tool to download full JSON snapshots of the CMS stores and perform pre-restore safety dry runs.

---

## 🏛️ Project Architecture & Dual-Layer Data Persistence

To ensure zero downtime and immunity against deployment file resets, the application implements a **Dual-Layer Persistence Architecture**:

```
                                  ┌───────────────────────────┐
                                  │    Next.js 16 Server      │
                                  │ (App Router & API Routes) │
                                  └─────────────┬─────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │        Primary Layer        │                   │       Fallback Layer        │
        │    MariaDB 11.8 Database    │                   │   Persistent JSON Stores    │
        │      (Hostinger Cloud)      │                   │    (Decoupled Directory)    │
        ├─────────────────────────────┤                   ├─────────────────────────────┤
        │ • cms_content table         │                   │ • /home/<user>/.../store/   │
        │ • admin_users table         │                   │ • Atomic write & rename     │
        │ • audit_logs table          │                   │ • 5 rolling backup files    │
        │ • Connection pool (mysql2)  │                   │ • Local fallback in repo    │
        └─────────────────────────────┘                   └─────────────────────────────┘
```

### 1. Primary Layer: MariaDB Connection Pool
All read and write operations interact directly with the MariaDB database via `src/lib/db.ts`. The schema tables are initialized idempotently on startup:
- `cms_content`: Key-value store (`content_key`, `content_data`, `version`, `updated_at`) hosting serialized JSON payloads for all 12 CMS sections.
- `admin_users`: Relational user records (`id`, `username`, `display_name`, `role`, `password_hash`, `token_version`, `created_at`, `updated_at`).
- `audit_logs`: Traceability log for administrative actions.

### 2. Fallback Layer: Decoupled Persistent JSON Storage
If the database connection encounters latency or is unreachable, the system gracefully reads from and writes to the filesystem store (`src/lib/server-storage.ts`).
- **Hostinger Deployment Immunity:** In Linux production, storage paths resolve to `/home/<user>/shirin_shila_persistent_data/` outside the versioned Git release folders. New deployments and `git pull` operations will **never** overwrite live data.
- **Atomic Operations:** Files are written using temporary file creation and atomic rename (`fs.renameSync`) to eliminate file corruption.
- **Rolling Revisions:** Each section write creates timestamped rolling snapshots (retaining the last 5 revisions).

---

## 📁 Repository Structure

```
├── public/
│   ├── assets/logos/               # Approved brand marks (e.g. tso-logo-white.svg)
│   ├── favicon.ico                 # 32x32 Browser favicon
│   ├── icon.svg                    # Vector monogram brand crest
│   ├── apple-icon.png              # 180x180 Apple touch icon
│   ├── images/                     # Static production images, cutouts, posters
│   └── uploads/                    # Local development upload target
├── src/
│   ├── app/
│   │   ├── admin/                  # TailAdmin CMS management modules
│   │   │   ├── about/              # About biography editor
│   │   │   ├── backup/             # JSON backup export and snapshot module
│   │   │   ├── contact/            # Contact channels & portal links editor
│   │   │   ├── gallery/            # 3D parallax photo gallery editor
│   │   │   ├── hero/               # Hero section editor
│   │   │   ├── inquiries/          # Public inquiries CRM inbox
│   │   │   ├── login/              # Administrative login portal
│   │   │   ├── media/              # Central Media Library & asset registry
│   │   │   ├── media-partners/     # Broadcaster & studio logos editor
│   │   │   ├── pages/              # Custom legal pages editor
│   │   │   ├── press/              # Press articles & clippings editor
│   │   │   ├── profile/            # Current user profile & password editor
│   │   │   ├── seo/                # SEO metadata & header code injector
│   │   │   ├── showreel/           # Video showreels editor
│   │   │   ├── timeline/           # Awards & honors milestone editor
│   │   │   ├── users/              # RBAC user management (Admin only)
│   │   │   └── works/              # Notable works CRUD editor
│   │   ├── api/                    # 25+ Secure REST API route handlers
│   │   │   ├── admin/              # Admin search & user endpoints
│   │   │   ├── auth/               # Login, logout, session verification, password
│   │   │   ├── backup/             # Backup export and snapshot API
│   │   │   ├── upload/             # Media upload and validation API
│   │   │   └── [section]/          # Content section read/write endpoints
│   │   ├── uploads/[...slug]/      # Dynamic stream handler for persistent media
│   │   ├── layout.tsx              # Root HTML shell & JSON-LD schema
│   │   ├── page.tsx                # Main SSR portfolio page assembly
│   │   ├── robots.ts               # Robots crawling directives
│   │   └── sitemap.ts              # XML sitemap generator
│   ├── components/                 # Reusable UI & animation components
│   │   ├── admin/                  # Admin layout, command palette, media pickers
│   │   └── ui/                     # Coverflow, glassy carousel, lightboxes
│   ├── data/
│   │   ├── store/                  # Seed JSON stores committed to Git
│   │   └── *.ts                    # TypeScript data definitions & seed schemas
│   └── lib/                        # Server storage, auth, DB pool, media service
├── tests/                          # Automated test suites
│   ├── test_admin_search.ts        # Admin command palette search tests (5 tests)
│   ├── test_media_library.ts       # Media upload, manifest & deletion tests (12 tests)
│   ├── test_role_and_user_mgmt.ts  # RBAC, password security & session tests (39 tests)
│   └── verify_admin_header.js      # Responsive admin header & layout tests (14 tests)
├── backups/                        # JSON system snapshot archives
├── server.js                       # Hostinger Node.js production server entry point
├── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js:** 20.x or 22 LTS (recommended)
- **npm:** 10.x+ (bundled with Node.js)
- **MySQL / MariaDB:** Optional for local development (system automatically falls back to JSON file stores if MySQL is not running locally).

### 1. Clone the Repository
```bash
git clone https://github.com/mrrajrumel/Shirin-Shila.git
cd Shirin-Shila
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate `.env.local` using the placeholders below:
```env
PORT=3000
HOSTNAME=0.0.0.0

# Session Cryptographic Secret Key (Used for HMAC-SHA256 session token signatures)
ADMIN_SECRET=your_strong_random_secret_key_here

# MariaDB / MySQL Configuration (Optional locally; required in production)
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
```

> **Security Note:** Never commit `.env` or `.env.local` to Git. Version control ignores these files by default.

### 4. Run the Development Server
```bash
npm run dev
```

- Public Portfolio: [http://localhost:3000](http://localhost:3000)
- Admin CMS: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🗄️ Database Configuration & Schema Migrations

The database connection is managed by a shared connection pool (`mysql2/promise`) in `src/lib/db.ts`.

### Automatic Schema Migration
There is no separate migration CLI step required. The application executes `ensureDatabaseSchema()` idempotently upon initialization:
```sql
CREATE TABLE IF NOT EXISTS cms_content (
  content_key VARCHAR(64) PRIMARY KEY,
  content_data LONGTEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'manager',
  password_hash VARCHAR(255) NOT NULL,
  token_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(64) NOT NULL,
  actor VARCHAR(64) NOT NULL,
  target VARCHAR(64),
  details LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Persistence Behavior
1. **Reads:** When an API route requests section content, `getDbContent(key)` queries `cms_content`. If found, it returns the parsed JSON. If the database is empty or unavailable, it falls back to the JSON persistent store.
2. **Writes:** When content is updated in the CMS, `writeStore(key, data)` writes simultaneously to MariaDB (`cms_content`) and the persistent JSON file with a timestamped rolling backup.

---

## 🖼️ Media Library & Asset Management

The Central Media Library (`/admin/media`) manages all media assets dynamically:

- **Security Validation:** Uploaded files are inspected for magic byte signatures (`validateFileSignature` in `src/lib/media-service.ts`) to prevent disguised executables or malicious payloads. Supported formats: JPEG, PNG, WebP, GIF, SVG.
- **Cryptographic Hashing:** Every asset is hashed with SHA-256 to detect duplicates and verify file integrity.
- **Usage Reference Protection:** Before an asset is deleted, `checkMediaUsage(url)` scans all 12 CMS stores. If the image is actively referenced in a hero banner, film poster, or gallery item, the system prevents deletion and reports the active usage locations.
- **Bulk Deletion:** Supports multi-item selection with atomic batch removal and orphan file cleanup.
- **Dynamic File Serving:** User uploads stored outside the web root in Hostinger's persistent directory are served dynamically via the App Router route `src/app/uploads/[...slug]/route.ts` and the `server.js` static stream handler.

---

## 🔐 Authentication, RBAC & Security Model

Access to `/admin` and protected `/api/admin/*` routes is governed by a robust security model (`src/lib/auth.ts`):

- **Role-Based Access Control (RBAC):**
  - **`admin` Role:** Full permissions, including user creation, role assignment, password modification, and system backup export/restore.
  - **`manager` Role:** Editorial access to manage portfolio sections and media; restricted from modifying system users or backups.
- **Password Security:**
  - Salted bcrypt password hashes (`bcryptjs`). Plaintext passwords are never stored.
  - Genuine administrator accounts (`Shirin` and `Rumel`) are protected and verified in MariaDB and JSON storage.
  - Forbidden demo patterns (`admin`, `raj`, `demo`, `test`) are rejected during account creation.
- **Session Tokens & Instant Revocation:**
  - Session tokens are signed using HMAC-SHA256 with the secret key `ADMIN_SECRET` and stored in an HTTP-only, `SameSite=Lax` cookie (`shirin_shila_admin_session`).
  - **Token Versioning:** Each user record includes a `tokenVersion` counter. Changing a user's password or deleting an account immediately revokes all active session tokens.
- **Brute-Force Protection:** Built-in IP rate limiter locks login attempts after 5 consecutive failures for a 15-minute lockout period.

---

## 🧪 Testing, Linting & Quality Assurance

The repository includes a suite of automated and verification scripts:

| Command | Purpose | Verification Scope |
| :--- | :--- | :--- |
| `npm test` | Run complete automated test suite | Runs all 70 test assertions in sequence |
| `node tests/verify_admin_header.js` | Admin header & layout checks | 14 assertions: layout cleanup, mobile headings, responsive styling |
| `npx tsx tests/test_admin_search.ts` | Admin global search tests | 5 assertions: works, timeline, media, users, session tokens |
| `npx tsx tests/test_role_and_user_mgmt.ts` | RBAC & security tests | 39 assertions: credential checks, password security, session revocation |
| `npx tsx tests/test_media_library.ts` | Media library tests | 12 assertions: uploads, manifest sync, single/bulk deletion |
| `npx tsc --noEmit` | Strict TypeScript compilation | Type integrity across all 57 App Router routes |
| `npm run lint` | ESLint code quality | Standard syntax, React Hook rules, and formatting |
| `npm run build` | Next.js production build | Full production compilation (`next build --webpack`) |

---

## 🚢 Deployment Workflow (Hostinger Cloud Node.js 22 LTS)

### Production Environment Configuration
- **Application Startup File:** `server.js`
- **Application Mode:** `Production`
- **Node.js Version:** `22 LTS`
- **Environment Variables in Hostinger hPanel:**
  - `NODE_ENV=production`
  - `PORT=3000`
  - `HOSTNAME=0.0.0.0`
  - `ADMIN_SECRET=your_production_secret_key`
  - `DATABASE_HOST=127.0.0.1`
  - `DATABASE_NAME=u473489494_shirin`
  - `DATABASE_USER=u473489494_shirin`
  - `DATABASE_PASSWORD=your_database_password`

### Deployment Steps via Hostinger Git or SSH
1. **Pull Latest Changes:**
   ```bash
   git pull origin main
   ```
2. **Install Production Dependencies:**
   ```bash
   npm install --production=false
   ```
3. **Execute Production Build:**
   ```bash
   npm run build
   ```
4. **Restart Application:**
   Restart the Node.js application in Hostinger hPanel (or trigger application reload).

---

## 💾 Backup Procedures & Recovery Limitations

### Backup Snapshot Artifact
The repository contains an archived system data snapshot:
```text
backups/full-system-backup-1793519476316.json
```

### What is Covered
- Snapshots of all **14 CMS JSON data stores**:
  `about.json`, `admin-users.json`, `contactInfo.json`, `filmography.json`, `gallery.json`, `hero.json`, `inquiries.json`, `media-manifest.json`, `mediaPartners.json`, `pages.json`, `press.json`, `seo.json`, `showreels.json`, `timeline.json`.
- Asset metadata registry (file hashes, MIME types, dimensions, and URLs).
- Tested and verified through an isolated JSON dry-run restore.

### What is NOT Covered (Important Limitations)
- **Raw Binary Media:** The JSON backup does **not** embed binary image or video blobs. Uploaded files reside on the persistent disk volume (`/home/u473489494/shirin_shila_persistent_data/uploads/`). A comprehensive disaster recovery plan requires separate backups of the physical `uploads/` directory.
- **MariaDB Database Dumps:** Does not include physical MariaDB table dumps (`.sql` / `.ibd` files) or transaction logs.
- **Environment & Server Configuration:** Does not contain `.env` files, Hostinger hPanel settings, or SSL certificates.

### Safe Recovery Procedure
1. **CMS Data Recovery:** Authorized administrators can upload the JSON backup file via `/admin/backup` to restore CMS data stores.
2. **Pre-Restore Safety Snapshot:** The restore handler automatically writes a safety snapshot (`snapshot-<timestamp>.json`) of the current data before applying restored contents.

---

## 📋 Latest Production Release Audit & Verification Status

The project was subjected to an end-to-end technical release audit. Below is the verified status as of the release lock:

| Audit Item | Verification Status | Evidence / Notes |
| :--- | :--- | :--- |
| **Git Commit** | `1ca97c9` | Local `HEAD` and `origin/main` match; working tree clean |
| **Live Deployment** | Synchronized | Live site at [shirinshila.com](https://shirinshila.com/) matches reviewed commit |
| **Hero Typography** | Verified | Clean `<h1 class="serif">` and `<span class="pink">Shila</span>`; 0 letter-mask hover effects |
| **Admin Mobile Search** | 5 / 5 Passed | Verified responsive command palette across 320px–1440px breakpoints |
| **TypeScript Integrity** | 0 Errors | `npx tsc --noEmit` passed with zero errors |
| **ESLint Audit** | 0 Errors | `npm run lint` passed with 0 errors (38 non-blocking image warnings) |
| **Automated Tests** | 70 / 70 Passed | 14 header checks, 5 search checks, 39 RBAC checks, 12 media checks |
| **Production Build** | Successful | `npm run build` compiled successfully in 14.8s across 57 routes |
| **Account Preservation** | Verified | Genuine accounts `Shirin` and `Rumel` preserved with salted bcrypt hashes |
| **Brand Assets** | Verified | Approved TSO logo (`public/assets/logos/tso-logo-white.svg`) preserved |

### Known Manual-Review Items
- **Timeline Entry `2026-january-4090`:** A draft timeline record with content `"Njj"` exists in the database and persistent store. It has been intentionally preserved for the owner's manual editorial review and has not been altered or deleted.

---

## 👥 Credits & Attribution

- **Artiste:** **Shirin Shila** (Shirin Akter) — Dhallywood Film Actress & Screen Performer
- **Lead Developer & Maintainer:** [**Rumel Ahmed**](https://github.com/mrrajrumel)
- **Talent Management & Operations:** **Tune Soul Ocean** (Support: [support@trytso.com](mailto:support@trytso.com))
- **Copyright:** © 2026 Shirin Shila. All rights reserved.
