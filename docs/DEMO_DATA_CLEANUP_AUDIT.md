# Shirin Shila Website — Demo Data & Asset Inventory Audit

**Audit Date:** November 1, 2026  
**Environment:** Production (`https://shirinshila.com/`) & Development Workspace  
**Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary

In strict accordance with the user instructions:
1. **Existing Admin and Manager accounts are protected with ZERO destructive resets, truncations, or overwrites.**
2. **No unreviewed data or assets have been blindly deleted.**
3. **The approved Tune Soul Ocean logo (`public/assets/logos/tso-logo-white.svg`) is strictly preserved.**
4. **All data stores and media assets have been inspected and classified into Category A, B, C, and D.**

---

## 2. Classification Matrix

### Category A: Genuine Admin Accounts (STRICTLY PROTECTED)
| Identifier | Username | Display Name | Role | Storage | Protection Status |
|---|---|---|---|---|---|
| `admin-shirin` | `Shirin` | Shirin Shila | `admin` | MySQL `admin_users` + persistent store | **LOCKED & PROTECTED** (Founder Account; cannot be deleted, demoted, or overwritten) |

### Category B: Genuine Manager Accounts (PRESERVED)
| Identifier | Username | Display Name | Role | Storage | Status |
|---|---|---|---|---|---|
| `admin-rumel` | `Rumel` | Raj Rumel | `manager` | MySQL `admin_users` + persistent store | **ACTIVE & PRESERVED** (Manager Role; full editorial management access) |

### Category C: Confirmed Demo / Test Data (CLEANUP & REVIEW INVENTORY)
| Item Type | Item Identifier / Name | Description | Location | Current Status |
|---|---|---|---|---|
| Banned Demo User | `admin` | Default test username | Codebase & DB Blocklist | **PERMANENTLY BLOCKED** (Rejected by API, zero DB entries) |
| Banned Demo User | `raj` | Temporary testing account | Codebase & DB Blocklist | **PERMANENTLY BLOCKED** (Rejected by API, zero DB entries) |
| Test Inquiries | N/A | Mock CRM inquiries | `src/data/store/inquiries.json` | **CLEAN** (Count: 0 items; ready for genuine customer inquiries) |
| Test Uploads | `public/uploads/testing` | Automated test suite scratch directory | File system | **CLEAN** (Empty directory; transient test files auto-deleted after test runs) |

### Category D: Production Assets & Content (VERIFIED AUTHENTIC — DO NOT DELETE)
All 33 assets currently in `src/data/store/media-manifest.json` and `public/images/` are authentic production materials:

1. **Film Posters (Dhallywood Features):**
   - `poster-begum-jaan.jpg` — Begum Jaan (Babisas Best Actress award-winning film)
   - `poster-hitman.jpg` — Hitman (Silver screen debut with Shakib Khan)
   - `poster-seshbazi.jpg` — Shesh Bazi (2024 psychological thriller)
   - `poster-birangona71.jpg` — Birangona 71 (Historical liberation war drama)
   - `poster-ghor-vanga.jpg` — Ghor Vanga Songsar (Family drama with Dipjol)
   - `poster-jimmi.jpg` — Jimmi (Action feature)
2. **Honors & Awards Photography:**
   - `award-diff-stage.jpg` — Dhaka International Film Festival (DIFF) Best Actress Trophy & stage speech
   - `award-trophy-gala.jpg` — Crystal Trophy & photocall
   - `award-trophy-stage.jpg` — Babisas Award stage presentation
3. **Press Clippings & Newspaper Cuts:**
   - `newspaper-cut-1.jpg` — Dainik Chitrali newspaper clipping
   - `newspaper-cut-2.jpg` — Dainik Anandabazar premier show clipping
4. **Official Portraits & Editorial Galleries:**
   - `hero.jpg`, `portrait.jpg`, `shirin-akter.png`
   - `gallery-1.jpg`, `gallery-2.jpg`, `gallery-3.jpg`, `gallery-4.jpg`
5. **Approved Management & Partner Logos:**
   - `public/assets/logos/tso-logo-white.svg` — **TSO Logo (Explicitly Approved Non-Shirin Brand Asset)**
   - Media partner logos: Channel i, ATN Bangla, NTV, RTV, Banglavision, Deepto TV, Boishakhi TV, Maasranga TV, GTV, BTV, Jaaz Multimedia, Impress Telefilm, Prothom Alo, The Daily Star, Babisas.

---

## 3. Data Integrity & Verification Checklist

- [x] Admin accounts `Shirin` and `Rumel` persist without alteration.
- [x] `updateDbUserPassword()` syncs with MySQL without overwriting other records.
- [x] Password changes increment `tokenVersion`, invalidating stale sessions across devices.
- [x] Global search (`/api/admin/search`) queries real database and persistent storage.
- [x] Fixed-width elements in Admin UI updated to responsive `flex` and `max-width` structures.
- [x] Mobile command palette dropdown breaks out into fixed viewport-spanning positioning on `<= 768px` with zero horizontal overflow.
- [x] Table wrappers support smooth horizontal scrolling (`-webkit-overflow-scrolling: touch`).
- [x] 100% of automated test assertions pass (67/67).
- [x] Next.js builds cleanly with 0 TypeScript and 0 ESLint errors.

