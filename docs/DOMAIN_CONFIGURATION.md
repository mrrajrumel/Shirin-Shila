# Domain Configuration & Centralized Canonical Architecture
**Project**: Shirin Shila Official Cinema Portfolio  
**Audit & Implementation Date**: October 30, 2026  
**Status**: Fully Domain-Agnostic & Centrally Configured

---

## 1. Architectural Overview

The application was previously using hardcoded domain strings referencing the temporary Hostinger subdomain (`https://cornflowerblue-wildcat-675604.hostingersite.com`). 

To make the entire portfolio fully domain-agnostic, all URL generation has been refactored into a single, centralized configuration module: [`src/lib/site-config.ts`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/lib/site-config.ts).

### Canonical URL Resolution Hierarchy

When generating canonical tags, XML sitemaps, JSON-LD structured data, `llms.txt`, RFC 8288 `Link` headers, or the MCP Server Card, the application resolves the canonical origin in this strict order:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Server Environment Variables                             │
│    (SITE_URL || APP_URL || NEXT_PUBLIC_SITE_URL)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ (if undefined or empty)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CMS Database Store (Hostinger MySQL & Persistent Store)   │
│    (Admin Panel: Settings → SEO & AI Visibility → siteUrl)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (if undefined or empty)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Documented Staging Deployment Fallback                   │
│    (DEFAULT_FALLBACK_SITE_URL)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Normalization Rules

All configured origins pass through `normalizeOrigin()`:
1. Strips leading and trailing whitespace.
2. Automatically enforces `https://` if a protocol was omitted.
3. Removes all trailing paths, query strings, hashes, and trailing slashes (`/`).
4. Rejects malformed or untrusted host headers to prevent Host-Header Poisoning attacks.

---

## 3. How to Configure Your Permanent Domain

When your permanent custom domain (e.g., `https://shirinshila.com`) is registered and pointed to Hostinger, you can activate it through either of two supported methods without having to edit a single line of application source code:

### Method A — Admin Panel CMS (Zero-Rebuild Instant Update)
1. Log in to the Admin Panel at `/admin/login`.
2. Navigate to **SEO & AI Visibility** (`/admin/seo`).
3. Under **Site Identity & Canonical URL**, enter your domain in the **Canonical Site URL** field (e.g., `https://shirinshila.com`).
4. Click **Save Changes**.
5. The change is written directly to the persistent MySQL database (`u473489494_shirin`), caches are immediately invalidated via `revalidatePath`, and all public pages immediately emit your custom domain in:
   - `<link rel="canonical" ...>`
   - `sitemap.xml`
   - JSON-LD `@graph` (`WebSite`, `ProfilePage`, `Person`, `ContactPoint`)
   - `llms.txt` and `llms-full.txt`
   - RFC 8288 `Link` response headers
   - `/.well-known/mcp/server-card.json`

### Method B — Hostinger Environment Variable
1. In Hostinger hPanel, navigate to **Websites → Manage → Node.js Settings → Environment Variables**.
2. Add:
   ```env
   SITE_URL=https://shirinshila.com
   ```
3. Restart the application. All canonical references automatically resolve to this URL.

---

## 4. DNS & TLS Considerations for Custom Domain

Before switching the canonical domain in the CMS or environment:
1. **DNS A Records**: Ensure the root `@` and `www` A records point to your Hostinger server IP address.
2. **SSL / TLS Certificate**: In hPanel, install the Let's Encrypt lifetime SSL certificate. Confirm `ssl.status: active`.
3. **HTTPS Redirection**: Ensure `httpsRedirect: true` is enabled so all HTTP requests are upgraded to HTTPS.
4. **Hostinger CDN Rules**: Hostinger edge CDN will automatically route `/robots.txt` directly to the Node.js application once a custom domain is attached (staging domain edge protection is disabled for custom domains).

---

## 5. Verification Checklist

To verify that no temporary domain strings remain in your live production output after configuring a new domain:

```bash
# 1. Check Canonical Link on Homepage
curl -sI https://your-domain.com/ | grep -i link

# 2. Check XML Sitemap
curl -s https://your-domain.com/sitemap.xml

# 3. Check JSON-LD
curl -s https://your-domain.com/ | grep -o 'https://[^"]*#person'

# 4. Check llms.txt
curl -s https://your-domain.com/llms.txt | grep -E '^-\s+\['

# 5. Check MCP Server Card
curl -s https://your-domain.com/.well-known/mcp/server-card.json | grep -i endpoint
```
All outputs will reflect your configured domain consistently.

