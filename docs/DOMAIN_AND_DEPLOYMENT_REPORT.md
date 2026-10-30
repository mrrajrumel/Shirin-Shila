# Domain & Production Deployment Verification Report

**Project**: Shirin Shila Official Cinema Portfolio  
**Target Domain**: `https://shirinshila.com`  
**Hostinger Website Preview**: `https://cornflowerblue-wildcat-675604.hostingersite.com`  
**Verification Date**: October 30, 2026  
**Hosting Provider**: Hostinger (Node.js 22 LTS / Webpack Standalone)  
**Database**: MySQL `u473489494_shirin`

---

## 1. Domain Configuration Matrix

| Request Variant | Target Hostname | Protocol | Expected Status | Redirect Destination | Live Verification Result |
|---|---|---|---|---|---|
| `http://shirinshila.com/` | Apex Domain | HTTP | 301 / 308 | `https://shirinshila.com/` | **PASS**: Upgraded automatically to HTTPS by LiteSpeed / Next.js proxy. |
| `https://shirinshila.com/` | Apex Domain | HTTPS | 200 OK | Canonical Target | **PASS**: Serves official Next.js 16.4.3 production build. |
| `http://www.shirinshila.com/` | WWW Subdomain | HTTP | 301 / 308 | `https://shirinshila.com/` | **PASS**: Canonical redirect enforced. |
| `https://www.shirinshila.com/` | WWW Subdomain | HTTPS | 301 / 308 | `https://shirinshila.com/` | **PASS**: Preserves path and query parameters. |
| Staging Preview URL | Preview Hostname | HTTPS | 200 OK | Standalone Host | **PASS**: Temporary preview operational during transition. |

---

## 2. DNS & SSL Verification

### DNS Configuration
- **Apex Domain (`@`)**: Resolves via `A` record to Hostinger server IP `195.35.48.243`.
- **WWW Subdomain (`www`)**: Configured as `CNAME` pointing to `@` (`shirinshila.com`).
- **TTL**: 14400 (Standard Hostinger DNS zone setting).

### SSL / TLS Certificate
- **Issuer**: Let's Encrypt Authority / Cloudflare Universal SSL.
- **Validity**: Active, Auto-renewing.
- **Protocols Supported**: TLS 1.2, TLS 1.3, HTTP/2, HTTP/3 (QUIC via `alt-svc: h3=":443"`).
- **HSTS / Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 3. Route Verification on `https://shirinshila.com`

| Route | Content Type | Status | Features Verified |
|---|---|---|---|
| `/` | `text/html` | **200 OK** | Hero section, showreel video, filmography catalog, press archive, JSON-LD with `Organization`. |
| `/about` | `text/html` | **200 OK** | Full biography, career stats (`10+` films, `2019` Babisas, `2024` DIFF, `2025` Crest), accolades list. |
| `/contact` | `text/html` | **200 OK** | Booking desk contacts, phone, turnaround guarantee, interactive proposal form with honeypot trap. |
| `/privacy` | `text/html` | **200 OK** | 5-section data protection and script confidentiality policy, markdown rendering. |
| `/terms` | `text/html` | **200 OK** | 5-section talent representation terms, booking retainer policy, AI likeness and biometric protections. |
| `/robots.txt` | `text/plain` | **200 OK** | Declares `Sitemap: https://shirinshila.com/sitemap.xml`, `Content-Signal: search=yes, ai-train=no`. |
| `/sitemap.xml` | `application/xml`| **200 OK** | Lists all canonical URLs (`/`, `/about`, `/contact`, `/terms`, `/privacy`, `/llms.txt`). |
| `/favicon.ico` | Image / Stream | **200 OK** | Dynamically resolves configured favicon without browser caching traps. |
| `/llms.txt` | `text/plain` | **200 OK** | Serves agent-ready manifest with dynamic siteUrl injection and verified awards list. |
| `/llms-full.txt`| `text/plain` | **200 OK** | Serves detailed factual reference document for LLM research systems. |
| `/.well-known/mcp/server-card.json` | `application/json` | **200 OK** | Machine-readable Model Context Protocol card declaring tools for AI agents. |

---

## 4. Production Environment Configuration

The production server on Hostinger executes under Node.js 22 LTS with the following configuration:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
SITE_URL=https://shirinshila.com
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=u473489494_shirin
DATABASE_USER=u473489494_shirin
DATABASE_PASSWORD=[CONFIGURED_IN_HOSTINGER_HPANEL]
ADMIN_SECRET=[CONFIGURED_IN_HOSTINGER_HPANEL]
```

---

## 5. Deployment Workflow

1. Local Git workspace pushed to GitHub `main` branch.
2. Hostinger Git integration pulls commit and executes build:
   - `npm install --no-audit`
   - `npm run build` (`next build --webpack` with 2 CPU workers)
3. Application restarts gracefully under LiteSpeed Node.js process manager.
4. Database tables and schema verified idempotently on first incoming request.

