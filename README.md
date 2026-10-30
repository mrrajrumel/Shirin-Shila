# Shirin Shila — Official Cinematic Portfolio & Editorial CMS

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-ff3f79?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

The official, production-ready cinematic portfolio, media repository, and Zero-Database Content Management System (CMS) for celebrated Bangladeshi film actress, reality show judge, and model **Shirin Shila** (Shirin Akter).

Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS, featuring luxury dark cinematic aesthetics, interactive 3D perspective parallax matrices, full theatrical filmography modals, career milestone accolade timelines, newspaper clippings zoom lightboxes, 8 verified social/portal links, and a TailAdmin-inspired management console.

---

## 🌟 Key Architecture & Capabilities

### 1. Zero-Database Persistent Storage & Deployment Shield
- **Zero External Database Overhead**: Operates entirely with lightweight, structured JSON file persistence, requiring zero database servers (no MySQL, PostgreSQL, MongoDB, or Redis needed).
- **Hostinger Deployment Immunity**: Data modified or created via the Admin CMS is persisted outside ephemeral Git release folders (at `/home/u473489494/shirin_shila_persistent_data/`). Pushing code updates to GitHub and auto-deploying via Hostinger will **never** overwrite or reset live content.
- **Atomic Operations & Rolling Revisions**: Writes use atomic file renames and automatically archive timestamped rolling snapshots (retaining the last 5 revisions per section) to prevent corruption.
- **1-Click Offline Backup & Restore**: Full JSON backup archives can be downloaded directly from the CMS or restored with automatic pre-restore safety snapshots. See [`PRODUCTION_DATA_PERSISTENCE.md`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/PRODUCTION_DATA_PERSISTENCE.md) and [`DEPLOYMENT_SAFETY.md`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/DEPLOYMENT_SAFETY.md).
- **Server-Side Rendering (SSR)**: The public frontend preloads verified store data on the server, guaranteeing zero client-side layout shift, no flashing placeholders, and 100% crawlable content for search engines.

### 2. Public Frontend Sections
- **Kinetic Hero Section (`#home`)**: High-resolution transparent cutout portrait with responsive mouse and scroll parallax over an ambient glowing orb. Consistent, glitch-free image loading on every visit.
- **Biographical Story (`#about`)**: Multi-paragraph biographical narrative, native Bengali titles, and key profile facts.
- **Cinema Video Showreel (`#showreel`)**: Interactive coverflow video showcase featuring acting reels, dramatic scenes, and trailer highlights.
- **Notable Works Archive (`#filmography`)**: 
  - Comprehensive category filtering: *Film*, *Television Drama*, *TV Show Judge (বিচারক)*, *Music Video*, *Commercial & Modelling*.
  - Rich dialog modal displaying full theatrical poster, synopsis, director, co-stars, production company, and accolades.
- **Visual Honors Archive (`#gallery`)**: Interactive 3D perspective parallax matrix presenting high-resolution trophy, red carpet, and gala photographs with fullscreen zoom lightbox.
- **Accolades & Career Timeline (`#timeline`)**: Chronological dual-track milestone timeline highlighting major film debuts and industry awards (Babisas Best Actress Winner, Meril-Prothom Alo Nominee).
- **Press & Media Coverage (`#press`)**: Unified carousel presenting online news articles and authentic newspaper clippings with zoom inspection.
- **Talent Management & Booking Desk (`#contact`)**: Direct talent representation desk, email inquiry submission form with server-side CRM logging, and 8 verified portal links (Facebook Profile, Facebook Page, Instagram, YouTube, TikTok, IMDb, Wikipedia, Google Knowledge Panel).
- **Broadcaster & Studio Logo Ticker (`#broadcasters`)**: Seamless, infinite auto-scrolling ticker showcasing vector logos of Bangladesh's premier television channels and film production houses.
- **Footer**: Brand mark, direct portal shortcuts, developer attribution, and back-to-top navigation.

### 3. TailAdmin Management Console (`/admin`)
- **Protected Editorial Portal**: Session-based HTTP-only authentication with bcrypt password hashing and IP rate limiting.
- **Section Editors**: Dedicated visual editors for Hero Banner, About Biography, Video Showreels, Notable Works, Photo Gallery, Awards Timeline, Press Coverage, Broadcaster Logos, and Contact Channels.
- **Central Media Library (`/admin/media`)**: Deduplicated asset manager with drag-and-drop file uploader, folder filtering, and instant copyable URLs.
- **Inquiries CRM Inbox (`/admin/inquiries`)**: Real-time management of incoming booking, casting, and press requests submitted through the public contact form with status updates (New, Read, Replied) and direct mailto / WhatsApp reply shortcuts.
- **SEO & Search Console Settings (`/admin/seo`)**: Visual management of page title, meta description, OpenGraph share preview image, browser favicons, and custom `<head>` verification script injection (Google Search Console, analytics).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router) |
| **UI Library** | React 18.3 |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 & Custom Vanilla CSS |
| **Motion & Parallax** | Framer Motion 11.15 & GSAP 3.15 |
| **Image Processing** | Sharp 0.35 |
| **Icons** | Lucide React |
| **Authentication** | Custom HMAC-SHA256 Session Tokens + bcryptjs |
| **Data Engine** | Zero-Database Atomic JSON File Storage (`src/data/store/`) |
| **Server Entry** | Custom `server.js` optimized for Hostinger Node.js Application Manager |

---

## 📁 Repository Structure

```
├── public/
│   ├── favicon.ico                 # 32x32 Favicon icon
│   ├── icon.svg                    # Vector monogram brand crest
│   ├── apple-icon.png              # 180x180 Apple touch icon
│   ├── images/
│   │   ├── logos/                  # 15 Broadcaster & studio SVG logos
│   │   ├── shirin-akter.png        # Transparent cutout hero portrait
│   │   ├── award-*.jpg             # High-res award trophy & stage photos
│   │   ├── newspaper-cut-*.jpg     # Authentic newsprint clipping scans
│   │   └── poster-*.jpg            # Theatrical movie posters
│   └── uploads/                    # User-uploaded files from Admin CMS
├── src/
│   ├── app/
│   │   ├── admin/                  # Admin management console
│   │   │   ├── hero/               # Hero section editor
│   │   │   ├── about/              # About biography editor
│   │   │   ├── works/              # Notable works CRUD editor
│   │   │   ├── showreel/           # Video showreel manager
│   │   │   ├── gallery/            # 3D parallax photo gallery editor
│   │   │   ├── timeline/           # Awards & honors manager
│   │   │   ├── press/              # Press & news clippings editor
│   │   │   ├── media-partners/     # Broadcaster & studio logos editor
│   │   │   ├── contact/            # Contact info & social links editor
│   │   │   ├── inquiries/          # Public inquiries CRM inbox
│   │   │   ├── media/              # Media library & asset manager
│   │   │   ├── seo/                # SEO meta & header code injector
│   │   │   └── login/              # Secure administrator login page
│   │   ├── api/                    # 17 Secure REST API routes
│   │   ├── layout.tsx              # Root HTML shell & JSON-LD schema
│   │   ├── page.tsx                # Main SSR portfolio page assembly
│   │   ├── robots.ts               # Crawler indexing directives
│   │   └── sitemap.ts              # XML Sitemap generator
│   ├── components/                 # Reusable UI & animation components
│   │   ├── ui/                     # Coverflow, glassy carousel, & reveal text
│   │   └── admin/                  # Admin media picker modal
│   ├── data/
│   │   └── store/                  # JSON server-side persistence store
│   └── lib/                        # Auth, media service, storage, & head injector
├── server.js                       # Production Node.js server entry point
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20.x+
- npm (bundled with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/mrrajrumel/Shirin-Shila.git
cd Shirin-Shila
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment settings in `.env.local`:
```env
PORT=3000
HOSTNAME=0.0.0.0
ADMIN_SECRET=your_secure_random_secret_key_here
```

> **Security Note**: Never commit `.env.local` to version control. It is already included in `.gitignore`.

### 4. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live portfolio.  
Access the Admin CMS at [http://localhost:3000/admin](http://localhost:3000/admin).

### 5. Production Build & Test
```bash
npm run build
npm start
```

Or run using the production Hostinger server entry point:
```bash
npm run start:hostinger
```

---

## 🔒 Admin CMS Setup & Authentication

The administrative portal (`/admin`) is protected by secure session authentication:
- **Zero-DB User Management**: Authorized administrator accounts are initialized with salted bcrypt hashes in `src/data/store/admin-users.json`. Plaintext passwords are never stored.
- **Brute-Force Protection**: Built-in IP rate limiter locks login attempts after 5 consecutive failures.
- **Secure Sessions**: Authentication sets an HTTP-only, secure, `SameSite=Lax` session cookie (`shirin_shila_admin_session`).
- **Media Uploads**: File uploads are validated by MIME type (JPEG, PNG, WebP, GIF, SVG) and written to the persistent `public/uploads/` directory with automatic reindexing in `media-manifest.json`.

---

## 🌐 Deploying to Hostinger

### Method A: Hostinger Node.js Application Manager (hPanel)

1. **Create Node.js Application**:
   - Log into Hostinger hPanel → navigate to **Websites** → **Node.js**.
   - Click **Create Application**.
   - **Node.js version**: Select `20.x` (or `18.x`).
   - **Application mode**: `Production`.
   - **Application root**: `public_html` (or your chosen subdirectory).
   - **Application startup file**: `server.js`.

2. **Upload / Clone Project Files**:
   - Deploy your repository files to the application root on Hostinger (via Git deployment or File Manager).
   - Ensure the `.next` and `node_modules` folders are NOT uploaded (they will be built directly on the server).

3. **Configure Environment Variables**:
   - In the hPanel Node.js dashboard, add the environment variable:
     - `ADMIN_SECRET`: A strong, randomly generated string.
     - `NODE_ENV`: `production`

4. **Install Dependencies & Build**:
   - Open the hPanel SSH/terminal console and run:
     ```bash
     npm install
     npm run build
     ```

5. **Start the Application**:
   - Click **Start Application** (or **Restart Application**) in the Hostinger hPanel.
   - Your website will immediately be live and accessible at your domain.

---

### Method B: Hostinger VPS (Ubuntu / Debian with PM2 & Nginx)

1. **Connect to your VPS**:
   ```bash
   ssh root@your-server-ip
   ```

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/mrrajrumel/Shirin-Shila.git /var/www/shirin-shila
   cd /var/www/shirin-shila
   ```

3. **Set Up Environment**:
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
   Set your production `ADMIN_SECRET`.

4. **Install Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

5. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "shirin-shila"
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx Reverse Proxy**:
   Point your domain to `http://127.0.0.1:3000`:
   ```nginx
   server {
       server_name shirinshila.com www.shirinshila.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 👥 Credits & Attribution

- **Artiste**: **Shirin Shila** (Shirin Akter) — Dhallywood Film Actress & Screen Performer
- **Design & Developer**: [**Rumel Ahmed**](https://github.com/mrrajrumel)
- **Management Team**: **Tune Soul Ocean** (Email: [support@trytso.com](mailto:support@trytso.com))
- **Copyright**: © 2026 Shirin Shila. All rights reserved.
