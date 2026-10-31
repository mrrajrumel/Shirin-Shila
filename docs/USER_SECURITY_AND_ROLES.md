# User Security, Authentication, and Role-Based Access Control (RBAC)

**Target System:** Shirin Shila Actor Portfolio (`https://shirinshila.com/`)  
**Domain:** Security Engineering, Authentication Architecture, and RBAC  
**Status:** Implemented & Verified  

---

## 1. Executive Summary

The administrative authentication and authorization subsystems of the Shirin Shila portfolio website have been hardened against unauthorized access, session tampering, privilege escalation, and brute-force credential stuffing. 

Both existing authorized user accounts (`Shirin` and `Rumel`) are strictly preserved. A clear, enforceable Role-Based Access Control (RBAC) hierarchy has been established to differentiate full **Administrator** capabilities from operational **Manager** capabilities. Comprehensive self-service profile and password management tools have been integrated with strict server-side validation, current-password verification, and rate limiting.

---

## 2. Preserved User Accounts & RBAC Architecture

### Account Inventory
The platform maintains exactly two authorized administrative accounts. Account records are persisted in `admin-users.json` (within the persistent storage volume on Hostinger and repository fallback) and synchronized with the MySQL `admin_users` table:

1. **Shirin** (`id: admin-shirin`):
   * **Assigned Role:** `admin` (System Administrator)
   * **Access Scope:** Complete, unrestricted system access. Includes database backups and restores, user account audits, security configurations, SEO/domain settings, and all CMS editorial modules.
2. **Rumel** (`id: admin-rumel`):
   * **Assigned Role:** `manager` (Operations & Content Manager)
   * **Access Scope:** Content operations access. Includes hero banner, about biography, notable works (filmography), video showreels, photo gallery, awards & honors, press clippings, media partners, contact portals, incoming inquiries CRM, and self-service profile/security.
   * **Restricted:** Explicitly prevented from executing database backups/restores, accessing the user administration registry, and modifying security credentials.

### Role Hierarchy & Centralized Guards
In `src/lib/auth.ts`, roles are defined centrally:
```typescript
export interface AdminUserRecord {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'manager';
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'manager';
}

/**
 * Returns true if the user possesses at least the required role tier.
 * Role hierarchy: admin (level 2) > manager (level 1)
 */
export function hasMinimumRole(user: SessionUser | null, required: 'admin' | 'manager'): boolean {
  if (!user) return false;
  if (required === 'manager') return user.role === 'admin' || user.role === 'manager';
  if (required === 'admin') return user.role === 'admin';
  return false;
}
```

---

## 3. Server-Side Enforcement & Route Protection

Server-side authorization is enforced at every sensitive Route Handler and API boundary. Hidden UI buttons are never treated as security:

### A. Database Backup & Restore Protection (`/api/backup`)
* **Endpoint:** `GET /api/backup` (snapshot download) & `POST /api/backup` (snapshot creation/restore)
* **Enforcement:**
  ```typescript
  function checkAuth(request: NextRequest): boolean {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = verifySessionToken(token);
    return Boolean(user && hasMinimumRole(user, 'admin'));
  }
  ```
* **Result:** Non-admin sessions (e.g. `manager`) receive `403 Forbidden` or `401 Unauthorized` if attempting direct API calls.

### B. User Registry Administration (`/api/admin/users`)
* **Endpoint:** `GET /api/admin/users`
* **Enforcement:**
  ```typescript
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!hasMinimumRole(session, 'admin')) {
    return NextResponse.json({ error: 'Forbidden. Administrator access required.' }, { status: 403 });
  }
  ```
* **Payload Sanitation:** Strips `passwordHash` before serialization (`getAllAdminUsers()` returns `Omit<AdminUserRecord, 'passwordHash'>[]`).

### C. Sidebar Navigation Role Filtering
* In `src/app/admin/layout.tsx`, navigation items for `Data & Persistence` (`/admin/backup`) and `Users & Roles` (`/admin/users`) are dynamically conditionally rendered only when `currentUser?.role === 'admin'`.

---

## 4. Authentication Security & Password Governance

### Session Token Security
* **Format:** HMAC-SHA256 signed compact token (`base64url(payload).base64url(signature)`).
* **Signing Key:** Server environment variable `ADMIN_SECRET`.
* **Cookie Policy:** `shirin_shila_admin_session`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=7 days`.
* **Verification:** Employs constant-time signature comparison via `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
* **Expiration:** Explicit expiration timestamp (`exp`) embedded in payload; tokens expired beyond 7 days are automatically rejected.

### Password Storage & Complexity Policy
* **Hashing Algorithm:** `bcrypt` with 10 salt rounds (`bcrypt.genSaltSync(10)`). Plaintext passwords are never persisted to disk or database.
* **Complexity Enforcement:**
  - Minimum length: 8 characters.
  - Required characters: At least one alphabetic character (`[a-zA-Z]`) and at least one numeric character (`[0-9]`).
* **Current Password Verification:** Any password modification requires entering and cryptographically validating the current active password hash before the new hash is written.

### Brute-Force Rate Limiting
* In-memory attempt tracker per IP and username identifier (`${clientIp}_${identifier}`).
* **Lockout Threshold:** 5 consecutive failed authentication attempts locks the specific account identifier for 15 minutes (`15 * 60 * 1000` ms).
* **Response:** Generic error messaging ("Invalid username or password") to prevent username enumeration, with remaining lockout duration indicated when locked.

---

## 5. Profile & Security Management Console

### UI Features (`/admin/profile`)
1. **Profile Details Card:**
   * Displays Username (immutable), Account Role badge (Administrator vs. Manager), and Account Creation timestamp.
   * Allows the logged-in user to update their Public Display Name (2–64 characters).
2. **Password Change Card:**
   * Dedicated inputs for Current Password, New Password, and Confirm Password with interactive show/hide toggles.
   * Real-time client-side policy validation indicators (Length, Alphabet, Number).
   * Safe status banners indicating success or failure.

### Users & Roles Directory (`/admin/users`)
* Exclusive to Administrators (`role: 'admin'`).
* Lists all registered administrative accounts with visual avatar badges, display names, usernames, and role permission descriptions.

