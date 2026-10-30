# Admin Settings & Full-Stack Data Mapping Guide
**Project**: Shirin Shila Official Cinema Portfolio  
**Audit & Architecture Date**: October 30, 2026  
**Security Model**: Role-Based HMAC-SHA256 Cookie Authentication (`shirin_shila_admin_session`)  
**Storage Architecture**: Hostinger MySQL (`u473489494_shirin`) with Atomic Persistent File Sync

---

## 1. Overview of Data Flow

Every admin-managed configuration follows a secure, validated, and persistent lifecycle:

```
┌─────────────────────────┐
│ Admin UI Form           │ (e.g. /admin/seo, /admin/works, /admin/hero)
└───────────┬─────────────┘
            │ 1. HTTP POST / JSON Payload
            ▼
┌─────────────────────────┐
│ Authenticated API Route │ (e.g. /api/seo, /api/works)
│ (HMAC-SHA256 Token Check)│
└───────────┬─────────────┘
            │ 2. Server-side Validation & Sanitization
            ▼
┌─────────────────────────┐
│ Persistence Layer       │ (src/lib/server-storage.ts)
│ - MySQL (cms_content)   │ Primary persistent storage in MySQL database
│ - Persistent JSON file  │ Rolling safety backup on persistent volume
└───────────┬─────────────┘
            │ 3. Instant Cache Invalidation (revalidatePath)
            ▼
┌─────────────────────────┐
│ Public Output           │
│ - HTML Pages            │ (/, /about, /contact, /terms, /privacy)
│ - Machine Endpoints     │ (/llms.txt, /api/markdown, /sitemap.xml, /.well-known/mcp/server-card.json)
└─────────────────────────┘
```

---

## 2. Complete Section-by-Section Mapping

### A. SEO & AI Visibility
- **Admin Route**: `/admin/seo`
- **API Endpoint**: `GET /api/seo`, `POST /api/seo`
- **Database Key**: `seo` in `cms_content`
- **Managed Fields**:
  - `siteUrl`: Canonical origin (e.g., `https://shirinshila.com` or empty for auto-env).
  - `siteTitle`, `tagline`, `description`, `keywords`, `author`: Page titles and search meta.
  - `ogTitle`, `ogDescription`, `ogImage`, `twitterHandle`: Social sharing cards.
  - `faviconUrl`, `appleTouchIconUrl`, `customHeadHtml`: Browser branding and analytics scripts.
  - `contentSignal`: Crawler policy (e.g., `search=yes, ai-train=no`).
  - `llmsSummary`: Custom notes for `/llms.txt`.
  - `footerLinks`: Approved footer links (`label`, `href`, `isVisible`, `order`).
- **Public Outputs**:
  - `<head>` metadata, canonical tags, Open Graph meta.
  - `/sitemap.xml`
  - `/robots.txt`
  - `/llms.txt` and `/llms-full.txt`
  - Visible `Footer` component across all pages.

### B. Hero Section
- **Admin Route**: `/admin/hero`
- **API Endpoint**: `GET /api/hero`, `POST /api/hero`
- **Database Key**: `hero` in `cms_content`
- **Managed Fields**: `name`, `banglaName`, `tagline`, `bio`, `profileImage`, `experienceYears`, `moviesCount`, `awardsCount`, `socialLinks`.
- **Public Outputs**: Homepage Hero Section (`#home`), `<title>` defaults, structured schema.

### C. About Actor
- **Admin Route**: `/admin/about`
- **API Endpoint**: `GET /api/about`, `POST /api/about`
- **Database Key**: `about` in `cms_content`
- **Managed Fields**: `heading`, `subheading`, `bioText`, `storyText`, `quote`, `honorsList`, `experienceHighlights`.
- **Public Outputs**: Homepage About Section (`#about`), Standalone `/about` page, `/api/markdown`, `/llms-full.txt`.

### D. Notable Works & Filmography
- **Admin Route**: `/admin/works`
- **API Endpoint**: `GET /api/works`, `POST /api/works`
- **Database Key**: `filmography` in `cms_content`
- **Managed Fields**: Array of movie records (`title`, `year`, `role`, `director`, `coStar`, `category`, `image`, `synopsis`, `trailerUrl`, `isFeatured`).
- **Public Outputs**: Homepage Filmography Section (`#filmography`), Standalone `/about` filmography listing, Schema.org `performerIn` (`Movie` entities), MCP Tool `get_filmography`.

### E. Video Showreels
- **Admin Route**: `/admin/showreel`
- **API Endpoint**: `GET /api/showreels`, `POST /api/showreels`
- **Database Key**: `showreels` in `cms_content`
- **Managed Fields**: Array of video records (`title`, `year`, `category`, `youtubeId`, `thumbnailUrl`, `description`).
- **Public Outputs**: Homepage Showreel Player (`#showreel`).

### F. Photo Gallery
- **Admin Route**: `/admin/gallery`
- **API Endpoint**: `GET /api/gallery`, `POST /api/gallery`
- **Database Key**: `gallery` in `cms_content`
- **Managed Fields**: Array of gallery items (`url`, `caption`, `category`, `aspectRatio`, `order`).
- **Public Outputs**: Homepage Gallery Lightbox (`#gallery`).

### G. Career Timeline
- **Admin Route**: `/admin/timeline`
- **API Endpoint**: `GET /api/timeline`, `POST /api/timeline`
- **Database Key**: `timeline` in `cms_content`
- **Managed Fields**: Career milestones and chronological achievements.
- **Public Outputs**: Homepage Timeline Section (`#timeline`).

### H. Press & Media Archive
- **Admin Route**: `/admin/press`
- **API Endpoint**: `GET /api/press`, `POST /api/press`
- **Database Key**: `press` in `cms_content`
- **Managed Fields**: Media clippings (`title`, `source`, `date`, `url`, `image`, `excerpt`).
- **Public Outputs**: Homepage Press Section (`#press`), `/api/markdown`.

### I. Contact & Talent Booking Desk
- **Admin Route**: `/admin/contact`
- **API Endpoint**: `GET /api/contact`, `POST /api/contact`
- **Database Key**: `contactInfo` in `cms_content`
- **Managed Fields**: `email`, `pressEmail`, `phone`, `location`, `officeAddress`, `bookingGuidelines`.
- **Public Outputs**: Homepage Contact Form (`#contact`), Standalone `/contact` page, Schema.org `ContactPoint`.

### J. Client Inquiries
- **Admin Route**: `/admin/inquiries`
- **API Endpoint**: `GET /api/inquiries`, `POST /api/inquiries`
- **Database Table**: `inquiries` (MySQL) & `inquiries.json`
- **Managed Fields**: Producer inquiries (`name`, `email`, `phone`, `service`, `message`, `status`).
- **Public Outputs**: Private admin inbox; incoming submissions received via homepage contact form, standalone `/contact`, and MCP tool `submit_inquiry`.

---

## 3. Security & Access Control

1. **Authentication Token**: Encrypted session token stored in httpOnly, secure, sameSite=lax cookie `shirin_shila_admin_session`.
2. **Signature Verification**: Validated on every request via `crypto.subtle` HMAC-SHA256 against `ADMIN_SECRET`.
3. **Audit Logging**: All database updates are automatically recorded in MySQL table `cms_audit_logs` with timestamp, acting user, and before/after state.

