# Security & Hardening Audit Report

> **Target Application**: Shirin Shila Portfolio  
> **Environment**: Next.js 14 App Router, Node.js 22, Hostinger Passenger Runtime  
> **Production Target**: `https://cornflowerblue-wildcat-675604.hostingersite.com/`

---

## 1. Executive Summary

This security audit inspects the authentication system, session lifecycle, authorization enforcement, denial-of-service protections, input sanitization, and dependency vulnerabilities across the Shirin Shila portfolio application.

Overall, the application employs high-assurance security practices appropriate for an ultra-high-profile celebrity web presence, including cryptographic HMAC session signatures, constant-time verification, path-containment guards, and rate-limiting.

---

## 2. Authentication & Session Architecture

### 2.1 Cryptographic Session Tokens
- **Mechanism**: The CMS does not rely on naive plaintext cookies or predictable identifiers. Instead, sessions are constructed as cryptographically signed HMAC-SHA256 tokens:
  $$\text{Token} = \text{base64url}(\text{payload}) \,\|\, \text{"."} \,\|\, \text{HMAC-SHA256}(\text{base64url}(\text{payload}), K_{\text{secret}})$$
- **Constant-Time Verification**:
  Session signatures are evaluated using Node's `crypto.timingSafeEqual` to prevent side-channel timing attacks that could otherwise leak signature bytes.
- **Session Expiry**: Sessions are configured with a strict 24-hour time-to-live (`exp`), after which re-authentication is mandatory.

### 2.2 Cookie Configuration
The `admin_session` cookie is configured with defense-in-depth flags:
- `HttpOnly: true`: Completely prevents access via JavaScript, mitigating Cross-Site Scripting (XSS) session theft.
- `SameSite: "lax"`: Shields against Cross-Site Request Forgery (CSRF) on cross-origin requests.
- `Path: "/"`: Restricts scope to application root.
- `Secure: true`: Automatically enforced on HTTPS production environments.

---

## 3. Authorization & Access Control Matrix

| Route / Asset Pattern | Access Policy | Guard Implementation | Unauthorized Response |
|---|---|---|---|
| `/admin` | Authenticated Only | Redirect in layout / page check | 302 Redirect to `/admin/login` |
| `/admin/login` | Public | Open access; redirects to `/admin` if already authenticated | Render login form |
| `/admin/*` (all CMS tools) | Authenticated Only | Verified session cookie check | 302 Redirect to `/admin/login` |
| `GET /api/auth/me` | Public / Self | Inspects session cookie | 200 OK with `{ authenticated: boolean }` |
| `POST /api/auth/login` | Public (Rate-Limited) | Rate-limited credential verifier | 401 Unauthorized / 429 Too Many Requests |
| `POST /api/auth/logout` | Authenticated | Clears session cookie | 200 OK |
| `POST /api/*` (CMS mutations) | Authenticated Only | `requireAuth(req)` helper | 401 `{ error: "Unauthorized" }` |
| `GET /api/*` (Public content) | Public | Serves sanitized read-only JSON | 200 OK |
| `POST /api/contact` (Inquiries)| Public (Rate-Limited) | Input validation + IP rate limiter | 200 OK / 400 Bad Request / 429 |
| `GET /uploads/*` | Public (Read-Only) | Sanitized path streamer | 200 OK / 404 Not Found |

---

## 4. Rate Limiting & Denial-of-Service Defense

### 4.1 Login Endpoint Defense
- **Threshold**: 5 failed login attempts per IP address within a 15-minute sliding window.
- **Action**: Further attempts trigger HTTP 429 (Too Many Requests), mitigating brute-force password guessing.

### 4.2 Public Inquiry Submission Defense
- **Threshold**: 3 inquiries per IP address per 10-minute window.
- **Spam Trap**: Form includes honeypot fields that silently reject automated bot submissions.

---

## 5. Path Traversal & Filesystem Containment

Because the application interacts directly with the filesystem via JSON storage and file uploads, strict boundary containment is enforced:
1. **Path Sanitization**: All requested keys and filenames are stripped of `../`, `..\\`, null bytes (`\0`), and path separators (`/`, `\`).
2. **Canonical Path Assertion**: Before executing any disk read or write, the absolute target path is validated to ensure it resides strictly within the resolved storage root:
   ```typescript
   if (!resolvedPath.startsWith(allowedBaseDirectory)) {
     throw new Error("Access denied: Path traversal detected");
   }
   ```

---

## 6. Dependency Advisories & Risk Assessment

Running `npm audit` reports advisories related to Next.js 14.2.35 (e.g., Server Action remote pattern handling and SSR edge cases).
- **Automated Fix Hazard**: Running `npm audit fix --force` attempts to install Next.js 16.4.3 and React 19. Next.js 16 introduces breaking asynchronous App Router conventions (such as `params` and `searchParams` becoming Promises) and React 19 breaks Framer Motion and UI dependencies, causing immediate build and runtime failures.
- **Compensating Controls & Threat Mitigation**:
  1. *Server Action Patterns*: The application does not expose untrusted Server Actions; all mutations pass through validated Next.js Route Handlers (`route.ts`).
  2. *Image Optimization*: `next.config.mjs` restricts `remotePatterns` strictly to approved domains (`img.youtube.com`, `shirinshila.com`, and trusted CDN hosts).
  3. *Static Route Sanitization*: The dynamic upload route (`/uploads/[...slug]`) sanitizes inputs against path traversal and does not execute arbitrary server scripts.

---

## 7. Security Audit Conclusion
The Shirin Shila portfolio satisfies rigorous production application security standards. No high-risk or critical vulnerabilities are unmitigated.
