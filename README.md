# Shirin Shila — Official Cinematic Portfolio & Editorial CMS

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-ff3f79?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

An authentic, ultra-premium Next.js 14 cinematic portfolio, media archive, and zero-database Editorial CMS celebrating renowned Bangladeshi silver-screen film actress, television reality show judge, and model **Shirin Shila** (Shirin Akter).

Designed with dark luxury crimson aesthetics, smooth-scrolling 3D perspective parallax matrices, full two-column filmography modals, career milestone accolade timelines, curated press clippings, 7 official verified social portals, and an automated broadcaster logo ticker.

---

## ✨ Key Features & Architectural Highlights

### 1. Cinematic One-Page Experience
- **Kinetic Hero Section (`#home`)**: Parallax-driven portrait imagery, dynamic ambient glow orbs, designation highlights, and customizable call-to-actions.
- **Biographical Journey (`#about`)**: Natural multi-paragraph biographical story, profile facts card, and downloadable PDF Comp Card.
- **Showreel Gallery (`#showreel`)**: Positioned directly beneath About Us; embeds high-definition cinema screen tests and performance reels.
- **Notable Works & Theatrical Modals (`#filmography`)**: 
  - Comprehensive category filter: *Film*, *Television Drama*, *TV Show Judge (বিচারক)*, *Music Video*, *Commercial & Modelling*.
  - Rich two-column modal preview showcasing the theatrical poster, release year, category badge, production house, character role, co-stars, awards, and complete synopsis.
- **Visual Archive (`#gallery`)**: 3D perspective parallax matrix displaying official red-carpet appearances and photoshoots.
- **Awards & Honors Milestone Timeline (`#timeline`)**: Double-tracked interactive horizontal timeline featuring high-resolution trophy and gala award photos (115×148px).
- **Media & Press Coverage (`#press`)**: Unified, aligned carousel cards for online news articles and authentic newspaper clippings with high-res zoom lightbox.
- **Management & Official Socials (`#contact`)**: Direct talent desk representation with one-click copyable emails and verified links for **Facebook ID**, **Facebook Page**, **Instagram**, **YouTube**, **TikTok**, **IMDb**, and **Wikipedia**.
- **Broadcaster & Film Studio Logo Ticker (`#broadcasters`)**: Pure auto-scrolling brand showcase featuring 15 official vector logos of Bangladeshi television channels and production houses.

### 2. Zero-DB Server-Side Persistence
- Backed by robust JSON server storage in `src/data/store/` with atomic write safety and self-healing initialization.
- Full CRUD APIs for instant content updates with anti-stale browser `Cache-Control: no-store` headers.

### 3. Integrated Admin CMS (`/admin`)
- **Hero & About Editors**: Update portraits, headlines, and bio copy directly from the browser.
- **Notable Works Manager**: Add, edit, or remove films with direct poster image upload.
- **Awards & Timeline Manager**: Upload trophy photos and update milestone details.
- **Showreels & Press Managers**: Universal auto-fetching capabilities.
- **TV & Media Logos Manager**: Add, remove, or toggle broadcaster logos.
- **Contact & Socials Editor**: Manage official emails and all 7 portal URLs.
- **CRM Inquiries Desk**: Manage bookings and incoming inquiries from the public form.

### 4. Universal Multi-Source Auto-Importer
- **Keyword / Topic Search**: Type any words (e.g. *"Shirin Shila Hitman"* or *"Shirin Shila Prothom Alo"*) to automatically fetch live news headlines, dates, publisher sources, and links via Google News BD RSS & Wikipedia.
- **Direct Article URLs**: Paste any news link to extract OpenGraph titles, publishers, publish dates, and lead imagery with automatic slug fallbacks.
- **YouTube Auto-Import**: Paste video links to automatically extract YouTube oEmbed metadata, titles, and HD maxres thumbnails.
- **Project Auto-Fetch**: Pre-fills film credits, director, co-stars, and role information.

### 5. SEO & High-Security Production Ready
- **Meta & OpenGraph**: Comprehensive tags, Twitter summary large image cards, and canonical definitions.
- **JSON-LD Structured Data**: Embedded `schema.org/Person` with awards, filmography credits, and official social profiles.
- **Crawlers**: Dynamic `sitemap.ts` and `robots.ts` configuration.
- **Branded Favicons**: Custom SVG badges, 32×32 `.ico`, and 180×180 Apple touch icons.
- **Custom 404 Page**: Thematic "Scene Not Found" page with fast navigation shortcuts.
- **Security Headers**: Hardened with `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`, and strict permission policies.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

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
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```
Configure your credentials:
```env
ADMIN_EMAIL=admin@shirinshila.com
ADMIN_PASSWORD=shirinshila2026
ADMIN_SECRET=shirin_shila_production_jwt_secret_token_secure_2026
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Access the Admin CMS at [http://localhost:3000/admin](http://localhost:3000/admin).

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🌐 Deploying to Hostinger (VPS / Cloud / Node.js App)

Deploying on Hostinger using the **Node.js Application Manager** or **Hostinger VPS** is straightforward:

### Method A: Hostinger Node.js Application Manager (hPanel)
1. In Hostinger hPanel, navigate to **Websites** → **Node.js**.
2. Select your domain/subdomain and click **Create Application**.
3. Set:
   - **Node.js version**: `20.x` or `18.x`
   - **Application mode**: `Production`
   - **Application root**: `public_html` (or your chosen subdirectory)
   - **Application startup file**: `server.js` or configure Next.js start script
4. Clone or upload your repository files (excluding `node_modules` and `.next`).
5. Upload your `.env.local` file with your production credentials.
6. Open the terminal or use the hPanel console to run:
   ```bash
   npm install
   npm run build
   ```
7. Start the application via the hPanel UI.

### Method B: Hostinger VPS (Ubuntu / Debian with PM2 & Nginx)
1. SSH into your Hostinger VPS:
   ```bash
   ssh root@your-vps-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/mrrajrumel/Shirin-Shila.git /var/www/shirin-shila
   cd /var/www/shirin-shila
   ```
3. Set up environment:
   ```bash
   cp .env.example .env.local
   nano .env.local # update your secret credentials
   ```
4. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
5. Run with PM2 Process Manager:
   ```bash
   npm install -g pm2
   pm2 start npm --name "shirin-shila" -- start
   pm2 save
   pm2 startup
   ```
6. Configure Nginx reverse proxy to pass traffic from port 80/443 to `http://127.0.0.1:3000`.

---

## 📁 Project Directory Layout

```
├── public/
│   ├── favicon.ico             # 32x32 Favicon icon
│   ├── icon.svg                # Vector monogram SS crest
│   ├── apple-touch-icon.png    # 180x180 Apple touch icon
│   ├── images/
│   │   ├── logos/              # 15 Broadcaster & studio SVG logos
│   │   ├── hero.jpg            # Hero portrait
│   │   └── poster-*.jpg        # Theatrical movie posters
│   └── uploads/                # User-uploaded files from Admin CMS
├── src/
│   ├── app/
│   │   ├── admin/              # Full Admin CMS subpages
│   │   │   ├── hero/           # Hero section editor
│   │   │   ├── about/          # About Us editor
│   │   │   ├── works/          # Notable Works CRUD & auto-fetch
│   │   │   ├── showreel/       # Showreels manager & YouTube importer
│   │   │   ├── press/          # Press & Media auto-importer
│   │   │   ├── timeline/       # Awards & honors manager
│   │   │   ├── media-partners/ # TV & studio logos manager
│   │   │   ├── contact/        # Contact & socials editor
│   │   │   └── inquiries/      # CRM bookings desk
│   │   ├── api/                # Secure REST API endpoints
│   │   ├── not-found.tsx       # Custom cinematic 404 page
│   │   ├── sitemap.ts          # Search engine sitemap XML generator
│   │   ├── robots.ts           # Search crawler directives
│   │   ├── layout.tsx          # Root layout & JSON-LD schema
│   │   └── page.tsx            # Main one-page portfolio assembly
│   ├── components/             # Reusable UI & animation components
│   ├── data/
│   │   └── store/              # JSON server-side persistence files
│   └── lib/                    # Auth, security, and storage helpers
├── next.config.mjs             # Next.js config with security headers
├── package.json
└── README.md
```

---

## 🔒 Security & Best Practices

- **Zero-DB Server Persistence**: Stored files in `src/data/store/*.json` persist safely across server restarts without external database downtime risks.
- **JWT Session Verification**: Secure HTTP-only cookies protect all `/admin` routes and sensitive mutations.
- **Repository Hygiene**: `.env`, `.env.local`, and sensitive secrets are strictly excluded via `.gitignore`.
- **Content Security Headers**: Pre-configured protection against MIME sniffing, clickjacking, and XSS attacks.

---

## 👥 Credits & Attribution

- **Artiste**: **Shirin Shila** (Shirin Akter) — Dhallywood Film Actress & Screen Performer
- **Design & Developer**: [**Rumel Ahmed**](https://github.com/mrrajrumel)
- **Management Team**: **Tune Soul Ocean** (Email: [support@trytso.com](mailto:support@trytso.com))
- **Copyright**: © 2026 Shirin Shila. All rights reserved.
