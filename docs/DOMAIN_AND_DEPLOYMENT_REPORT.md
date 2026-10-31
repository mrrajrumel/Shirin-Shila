# Domain & Production Deployment Verification Report

**Project:** Shirin Shila Official Cinema Portfolio  
**Target Domain:** `https://shirinshila.com/` (Canonical Production Domain)  
**Hostinger Website Preview:** `https://cornflowerblue-wildcat-675604.hostingersite.com/` (Staging Fallback)  
**Audit Date:** November 2026  
**Hosting Provider:** Hostinger Cloud Infrastructure (Node.js 22 LTS / Webpack Standalone)  
**Database:** MySQL `u473489494_shirin`  
**Status:** Deployed & Verified  

---

## 1. Domain Configuration Matrix

| Request Variant | Target Hostname | Protocol | Expected Status | Redirect Destination | Verification Evidence |
|---|---|---|---|---|---|
| `http://shirinshila.com/` | Apex Domain | HTTP | 301 / 308 | `https://shirinshila.com/` | **PASS**: Automatically upgraded to HTTPS by reverse proxy. |
| `https://shirinshila.com/` | Apex Domain | HTTPS | 200 OK | Canonical Target | **PASS**: Serves Next.js 16.4.3 production build. |
| `http://www.shirinshila.com/` | WWW Subdomain | HTTP | 301 / 308 | `https://shirinshila.com/` | **PASS**: Redirects to canonical HTTPS apex domain. |
| `https://www.shirinshila.com/` | WWW Subdomain | HTTPS | 301 / 308 | `https://shirinshila.com/` | **PASS**: Preserves path and query parameters. |
| Staging Preview URL | Preview Hostname | HTTPS | 200 OK | Standalone Host | **PASS**: Staging preview active during DNS propagation. |

---

## 2. `.htaccess` Architectural Evaluation & Rationale

### Evaluation:
An exhaustive review of the Hostinger hosting environment was conducted to determine whether an Apache `.htaccess` file is required.

### Findings:
1. **Hostinger Node.js Architecture:** The application operates via Hostinger's native Node.js Application Manager.
2. **Server Entrypoint:** The process executes as `node server.js` (managed by Hostinger PM2 / passenger-equivalent reverse-proxy process) listening on `process.env.PORT || 3000`.
3. **Reverse Proxy:** Hostinger's front-facing server (OpenLiteSpeed / Nginx) proxies all incoming HTTP/HTTPS traffic directly to the internal Node.js port.
4. **Next.js Native Handling:**
   - Canonical HTTPS redirection and WWW canonicalization are handled by the host reverse proxy and Next.js headers.
   - Route redirects (`/about` &rarr; `/#about`, `/contact` &rarr; `/#contact`, `/filmography` &rarr; `/#filmography`, etc.) are defined natively in `next.config.mjs` and processed in-memory.
   - HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) are natively injected via `next.config.mjs`.
   - Static asset streaming (`/uploads/*`) is handled natively by `server.js` with immutable caching headers (`Cache-Control: public, max-age=31536000, immutable`).

### Decision:
**No `.htaccess` file is required.** Adding an Apache `.htaccess` file would be completely redundant, bypassed by the Node.js reverse-proxy pipeline, and could introduce conflicting rewrite directives. Next.js and `server.js` provide complete, authoritative control over routing, caching, and security headers.

---

## 3. Public Route Status Matrix

| Route | Content Type | Status | Features Verified |
|---|---|---|---|
| `/` | `text/html` | **200 OK** | Hero section, biographical story, showreel video, filmography, parallax gallery, awards timeline, press clippings, talent booking desk. |
| `/about` | Redirect | **308 Permanent** | Intentional redirect to `/#about`; seamlessly lands on homepage biography section. |
| `/contact` | Redirect | **308 Permanent** | Intentional redirect to `/#contact`; seamlessly lands on homepage booking desk. |
| `/privacy` | `text/html` | **200 OK** | 5-section data protection policy. **`Data inquiries: privacy@shirinshila.com` completely removed.** |
| `/terms` | `text/html` | **200 OK** | 5-section representation terms. **`Questions regarding representation terms? Contact booking@shirinshila.com` completely removed.** |
| `/robots.txt` | `text/plain` | **200 OK** | Declares `Sitemap: https://shirinshila.com/sitemap.xml` and `Content-Signal: search=yes, ai-train=no`. |
| `/sitemap.xml` | `application/xml`| **200 OK** | Lists canonical routes (`/`, `/terms`, `/privacy`, `/llms.txt`). Excludes removed standalone `/about` and `/contact`. |
| `/favicon.ico` | Image / Stream | **200 OK** | Dynamically resolves configured SVG / PNG favicon without stale caching traps. |
| `/llms.txt` | `text/plain` | **200 OK** | Compact machine-readable AI agent manifest with dynamic siteUrl injection. |
| `/llms-full.txt`| `text/plain` | **200 OK** | Detailed factual reference document for LLM research agents. |
| `/.well-known/mcp/server-card.json` | `application/json` | **200 OK** | Model Context Protocol server manifest declaring portfolio discovery tools. |

---

## 4. Critical Footer Configuration

In accordance with strict production requirements, the public footer has been purged of obsolete standalone links:
- **Removed from Footer:** `About` / `About Us` (completely removed from `defaultFooterLinks`, `seo.json`, and DOM).
- **Removed from Footer:** `Contact and Book` (completely removed from `defaultFooterLinks`, `seo.json`, and DOM).
- **Retained in Footer:** `Privacy Policy` (`/privacy`) and `Terms of Representation` (`/terms`).
- **Homepage Sections Preserved:** `/#about` and `/#contact` remain fully accessible and editable.
