# Shirin Shila — Minimalist Admin CMS & Zero-Database Architecture Blueprint

Detailed technical roadmap and architectural specification for the next task: building a password-protected, zero-database Admin Management Console with direct media uploading, automated metadata scraping (YouTube & online news), and customer inquiries CRM table.

---

## 🌟 1. Zero-Database Architecture: How It Works

### Core Concept: Server-Side File-System Storage (JSON Persistence Engine)
The entire system operates **without any external database** (no MySQL, PostgreSQL, MongoDB, Supabase, or Firebase) while remaining **100% visible to all public visitors globally**.

```
┌──────────────────────────────────────────────────────────────┐
│                   PUBLIC WEBSITE VISITORS                    │
│     (Mobile, Tablets, Desktops across Bangladesh & Global)   │
└──────────────────────────────┬───────────────────────────────┘
                               │ Reads verified data
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                NEXT.JS APP ROUTER API ENGINE                 │
│   GET /api/works   GET /api/press   GET /api/inquiries       │
│   POST /api/inquiries (Public Form Submissions)              │
└──────────────────────────────▲───────────────────────────────┘
                               │
            ┌──────────────────┴───────────────────┐
            │                                      │ Writes & updates
            ▼                                      │ via authenticated session
┌───────────────────────────────┐   ┌──────────────┴───────────────┐
│  SERVER-SIDE FILE ENGINE      │   │  MINIMALIST ADMIN CMS        │
│  /src/data/storage/*.json     │   │  /admin (Password Protected) │
│  /public/uploads/* (Media)    │   │  - YouTube Auto-Import       │
│  - filmography.json           │   │  - Link OpenGraph Scraper    │
│  - press.json                 │   │  - Direct Media Uploader     │
│  - showreel.json              │   │  - Inquiries CRM Desk        │
│  - gallery.json               │   │  - Timeline & About CMS      │
│  - inquiries.json             │   └──────────────────────────────┘
└───────────────────────────────┘
```

### Why Server-Side JSON Beats Pure Browser `localStorage`:
| Feature | Pure Browser `localStorage` | Next.js Server-Side File System (Our Architecture) |
|:---|:---:|:---:|
| **Zero External Database / 0 Hosting Cost** | ✅ Yes | ✅ **Yes** |
| **Visible to ALL Public Visitors Globally** | ❌ No (stays only on admin's computer) | ✅ **Yes (Instant global persistence)** |
| **Direct Media File Upload to Disk** | ❌ No (cannot save files to disk) | ✅ **Yes (Saves directly to `/public/uploads`)** |
| **Public Contact Form Inquiries CRM** | ❌ No (visitors can't reach admin storage) | ✅ **Yes (Form writes to server CRM queue)** |
| **Instant Real-Time Website Sync** | ⚠️ Only local window | ✅ **Yes (Auto-revalidates public website)** |

---

## 🛠️ 2. Stealth Admin Route & Security

1. **Hidden from Public Site**:
   - The public website contains **NO** visible admin links or buttons.
   - Regular visitors browsing the portfolio have no knowledge of the admin portal.
2. **Protected Route Guard**:
   - Direct access to `/admin` or sub-routes requires an encrypted HTTP-only session cookie.
   - Unauthenticated visitors are automatically redirected to `/admin/login`.
3. **Login Portal (`/admin/login`)**:
   - Clean, minimalist authentication card with password protection.
   - Credentials configured securely in `.env.local` (`ADMIN_PASSWORD`, `ADMIN_EMAIL`).

---

## 🎨 3. Minimalist Dashboard Design System

- **Aesthetic**: Minimalist Dark Slate / Zinc (`#0c0a0e`, `#161318`, `#241e27`, `#ff3f79`).
- **Layout**:
  - Collapsible left sidebar navigation.
  - Top header with sync status indicator and logout action.
  - Distraction-free operational tables and modals.

---

## 🚀 4. Functional Modules & Automated Ingestion

### A. Showreel Management (`/admin/showreels`)
- **YouTube Automatic Importer**:
  - Admin pastes a YouTube link (e.g. `https://youtu.be/81k39lq5g7M`).
  - System extracts video ID and automatically fetches:
    - Video Title
    - High-Resolution Poster Thumbnail (`https://img.youtube.com/vi/{id}/maxresdefault.jpg`)
    - Duration & Embed Player code
  - 1-click addition to the showreel list.
- **Actions**: Add, Inline Edit, Drag/reorder, Delete reel.

### B. Notable Works / Filmography (`/admin/works`)
- **Direct Poster Upload**:
  - Upload theatrical posters (`.jpg`, `.webp`, `.png`) directly from the device.
  - Saves file to `/public/uploads/works/`.
- **Fields**:
  - Title (English & Bengali)
  - Category (`Film`, `Television Drama`, `Music Video`, `Commercial & Modelling`)
  - Year, Director, Co-Stars, Production House, Release Status
  - Featured on Homepage Switch (`true` / `false`)
  - Awards & Recognitions text
- **Actions**: Add, Edit, Delete, Toggle Featured.

### C. Press & Media Studio (`/admin/press`)
- **Three Intelligent Modes**:
  1. **Online News (Auto-Fetch Scraper)**:
     - Admin pastes article URL (e.g. Prothom Alo, Daily Star, Channel i).
     - System scrapes OpenGraph tags (`og:title`, `og:image`, `og:site_name`, publication date) and auto-fills the form instantly.
  2. **Newspaper Clipping (Direct Media Upload)**:
     - Direct image upload for physical newspaper clippings, saved to `/public/uploads/press/`.
  3. **Video Interview (YouTube Embed)**:
     - YouTube URL import for TV interviews and talk shows.
- **Actions**: Add, Edit, Delete, Filter by Kind.

### D. Awards & Honors Parallax Gallery (`/admin/gallery`)
- **Direct Media Upload**: Upload red carpet photos, trophies, and festival crests to `/public/uploads/gallery/`.
- **Fields**: Image Title/Label, Category, Year, Parallax Column index.
- **Actions**: Add, Edit, Reorder, Delete.

### E. Career Journey Timeline (`/admin/timeline`)
- **Milestones**:
  - Year, Month (`January` – `December`), Description text.
  - Track Position (`Top Track` / `Bottom Track`).
- **Actions**: Add new milestone, Edit, Delete.

### F. Contact Submissions CRM Table (`/admin/inquiries`)
- **Public Form Ingestion**:
  - Submissions from public `#contact` section write directly to the server inquiry queue.
- **CRM Table Features**:
  - Status badges: `New`, `Read`, `Replied`, `Archived`.
  - Type filters: *Film Project*, *Brand Endorsement*, *TV Serial*, *Interview*, *General*.
  - Private notes field for internal talent management records.
  - One-Click Actions:
    - 📲 Open WhatsApp with pre-filled greeting.
    - ✉️ Direct Email Client Reply.
    - 🗑️ Archive / Delete.

---

## 🔌 5. API Endpoints Architecture

| Endpoint | Method | Purpose |
|:---|:---:|:---|
| `/api/auth/login` | `POST` | Authenticate credentials & set secure HTTP-only cookie |
| `/api/auth/logout` | `POST` | Destroy session |
| `/api/upload` | `POST` | Write uploaded files to `/public/uploads/` and return public path |
| `/api/youtube-meta` | `GET` | Extract video details & high-res thumbnail without API keys |
| `/api/scrape-meta` | `GET` | Scrape news article OpenGraph metadata (headline, image, publisher) |
| `/api/works` | `GET / POST / PUT / DELETE` | CRUD operations on `filmography.json` |
| `/api/press` | `GET / POST / PUT / DELETE` | CRUD operations on `press.json` |
| `/api/showreel` | `GET / POST / PUT / DELETE` | CRUD operations on `showreel.json` |
| `/api/gallery` | `GET / POST / PUT / DELETE` | CRUD operations on `gallery.json` |
| `/api/timeline` | `GET / POST / PUT / DELETE` | CRUD operations on `timeline.json` |
| `/api/inquiries` | `GET / POST / PUT / DELETE` | Public form ingestion + CRM status management |

---

## ⚡ 6. Real-Time Synchronization with Public Website

Whenever an item is added, edited, or removed in the Admin CMS:
1. The server updates the corresponding JSON file in the project.
2. Next.js triggers `revalidatePath('/')`.
3. The public one-page website reflects the changes instantly for all visitors worldwide without manual rebuilds.
