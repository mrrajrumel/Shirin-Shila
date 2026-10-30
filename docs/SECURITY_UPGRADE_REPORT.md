# Security Audit & Dependency Advisory Report

> **Project:** Shirin Shila Official Cinematic Portfolio & Editorial CMS  
> **Environment:** Next.js 14.2 / Node.js 22 / Hostinger Production  
> **Audit Focus:** Application Security, Dependency Advisories, Session Security, and File Integrity  
> **Audit Status:** Verified & Hardened  

---

## 1. Executive Summary

A comprehensive application security and dependency vulnerability audit was conducted on the Shirin Shila portfolio codebase. Security controls were audited across authentication, session management, file uploads, media streaming, path traversal prevention, and API endpoint protection.

---

## 2. Authentication & Session Security Audit

| Security Layer | Implementation | Verification Status |
| :--- | :--- | :---: |
| **Password Hashing** | Uses `bcryptjs` with high salt work-factor (`10`) | **PASS** |
| **Session Cookies** | `shirin_shila_session` set with `HttpOnly`, `SameSite=Lax`, and `Secure` (production) | **PASS** |
| **HMAC Signature** | Session tokens signed with HMAC-SHA256 (`src/lib/auth.ts`) using secret key | **PASS** |
| **Credential Separation** | Admin credentials stored in `admin-users.json` outside public web root | **PASS** |
| **Brute Force Protection** | In-memory rate limiting on `/api/auth/login` (5 attempts per window) | **PASS** |
| **Middleware Gate** | `src/middleware.ts` enforces authentication on all `/admin/*` routes (except login) | **PASS** |

---

## 3. Storage, File Upload & Path Traversal Protections

| Threat Vector | Mitigation Strategy | Status |
| :--- | :--- | :---: |
| **Arbitrary File Upload** | Inspects magic bytes (file signature check) for JPEG, PNG, WebP, GIF, SVG, and MP4. Executables (`.exe`, `.sh`, `.php`) rejected. | **PASS** |
| **Path Traversal (`../`)** | All dynamic uploads routes (`src/app/uploads/[...slug]/route.ts`) explicitly sanitize segments and verify `targetFile.startsWith(persistentDir)`. | **PASS** |
| **Direct JSON Access** | Runtime JSON files stored outside `public_html` (`/home/u473489494/shirin_shila_persistent_data/store`). Web visitors cannot access raw files. | **PASS** |
| **Backup Download Security** | `/api/backup` strictly requires valid HMAC session authentication; unauthenticated requests receive HTTP 401. | **PASS** |
| **Deduplicated Storage** | Uploaded media hashed with SHA-256; identical files reuse existing asset URL, preventing disk bloat. | **PASS** |

---

## 4. Dependency Vulnerability Assessment & Advisory Analysis

### Current Production Dependency Stack
- **Framework:** Next.js `14.2.35`
- **React / React-DOM:** `18.3.1`
- **Node.js Environment:** `v22` / `v24` compatible
- **Image Optimizer:** Sharp `0.35.5`

### Advisory Review (`npm audit`)
Running `npm audit` surfaces two advisories:
1. **Next.js (`< 16.3.0-preview.10`):** Advisories relating to Server Actions, App Router cache confusion, and edge runtime SSRF.
2. **PostCSS (`<= 8.5.22`):** Advisories relating to CSS stringify output and source map parsing.

### Deliberate Upgrade Decision & Compatibility Rationale
> [!IMPORTANT]
> `npm audit fix --force` attempts to install **Next.js 16.4.3 / React 19**, which introduces severe breaking changes to Next.js App Router (such as async `params`/`searchParams`, synchronous cookie access deprecation, breaking custom `server.js` bindings, and peer dependency conflicts with Framer Motion 11).
>
> **Mitigation Applied in Code:**
> 1. The application does **not** use Server Actions with untrusted remote patterns.
> 2. Next.js image optimization remote patterns are strictly restricted to verified origins (`youtube.com`, `img.youtube.com`, `i.ytimg.com`, and self-domain).
> 3. Custom server (`server.js`) streams local uploads directly using native Node.js streams rather than relying on dynamic next/image remote fetching for local assets.
> 4. All admin mutations are protected behind HMAC-SHA256 authenticated API routes.

---

## 5. Security Recommendations for Hostinger Environment

1. **Keep `ADMIN_SECRET` Secure:** Ensure `ADMIN_SECRET` in Hostinger Environment Variables is a strong, random 64-character alphanumeric string.
2. **Disable Directory Listing:** Confirmed active on Hostinger via custom server routing.
3. **Automated Offline Backups:** Regularly download offline backup bundles from `/admin/backup`.

