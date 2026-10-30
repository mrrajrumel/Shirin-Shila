# Hostinger MySQL Database & Admin Integrity Report

**Environment:** Hostinger Node.js Runtime + MySQL Server  
**Database Name:** `u473489494_shirin`  
**Database User:** `u473489494_shirin`  
**Host:** `127.0.0.1:3306` (Hostinger Localhost Socket)  
**Date:** October 30, 2026  

---

## 1. Database Schema & Architecture

The application connects to Hostinger MySQL via a managed connection pool (`src/lib/db.ts`). On startup, tables are initialized automatically using idempotent `CREATE TABLE IF NOT EXISTS` DDL statements:

### 1.1 Core Tables

1. **`cms_content`**
   - `collection` VARCHAR(64) PRIMARY KEY
   - `data` LONGTEXT (JSON-serialized payload)
   - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - `updated_by` VARCHAR(128) DEFAULT 'system'

2. **`cms_audit_logs`**
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `collection` VARCHAR(64)
   - `action` VARCHAR(32) ('insert', 'update', 'delete', 'backup')
   - `actor` VARCHAR(128)
   - `data_hash` VARCHAR(64) (SHA-256 integrity hash)
   - `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

3. **`inquiries`**
   - `id` VARCHAR(64) PRIMARY KEY
   - `name` VARCHAR(128)
   - `email` VARCHAR(128)
   - `phone` VARCHAR(64)
   - `company` VARCHAR(128)
   - `service` VARCHAR(128)
   - `budget` VARCHAR(64)
   - `deadline` VARCHAR(64)
   - `message` TEXT
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `status` VARCHAR(32) DEFAULT 'unread'

4. **`media_assets`**
   - `id` VARCHAR(64) PRIMARY KEY
   - `filename` VARCHAR(255)
   - `original_name` VARCHAR(255)
   - `url` VARCHAR(512)
   - `mime_type` VARCHAR(64)
   - `size` INT
   - `hash` VARCHAR(64) (Unique SHA-256 for cryptographic deduplication)
   - `folder` VARCHAR(64)
   - `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

5. **`admin_users`**
   - `id` VARCHAR(64) PRIMARY KEY
   - `username` VARCHAR(64) UNIQUE
   - `password_hash` VARCHAR(255) (bcrypt salt rounds = 12)
   - `role` VARCHAR(32) DEFAULT 'admin'
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 2. Seeded CMS Collections in MySQL

All 12 CMS collections are persisted in the `cms_content` table:

1. `hero` — Hero banner title, bio snippet, CTAs, portrait images
2. `about` — Biographical story, statistics, acting philosophy
3. `filmography` — Notable movies, awards, co-stars, streaming links
4. `gallery` — 3D parallax photo gallery assets, labels, and years
5. `showreels` — YouTube video embeds and showreel metadata
6. `timeline` — Career milestones and timeline journey
7. `press` — Newspaper coverage, media interviews, publication dates
8. `mediaPartners` — TV broadcaster and film studio logos
9. `contactInfo` — Phone, email, agent representation details
10. `seo` — Page titles, meta descriptions, OpenGraph, keywords
11. `inquiries` — Casting & booking inquiry repository
12. `media-manifest` — Master cryptographic registry of all uploaded media assets

---

## 3. Dual-Layer Storage Redundancy

To provide complete resilience against server restarts or network partitions, the storage architecture implements a dual-layer strategy:

```
[ Admin UI / Public Next.js Server Components ]
                    │
                    ▼
          [ server-storage.ts ]
         ┌──────────┴──────────┐
         ▼                     ▼
[ Hostinger MySQL ]   [ Persistent Disk File ]
 (Primary Source)      (Atomic Fallback & Mirror)
         │                     │
         └──────────┬──────────┘
                    ▼
          [ Rolling Backups ]
     (Last 5 timestamped snapshots)
```

1. **Read Operations:**
   - Queries Hostinger MySQL first (`cms_content`).
   - If MySQL is unreachable, instantly reads from local persistent disk (`/home/u473489494/shirin_shila_persistent_data/store/{key}.json` or repository store).
2. **Write Operations:**
   - Writes atomically to persistent disk file using a temporary `.tmp` file and rename.
   - Saves record directly to Hostinger MySQL with audit log recording.
   - Rotates a rolling backup snapshot in `backups/{key}/` (capped at 5 revisions).

---

## 4. Admin Overview Database Health Badge

The Admin Dashboard now features a live health indicator connected to `/api/db-status`:
- **Connected State:** Displays a green badge `"Hostinger MySQL Connected"` with host name (`127.0.0.1`), database name (`u473489494_shirin`), and pool readiness.
- **Failover State:** If database is unreachable, clearly displays fallback to persistent storage without throwing unhandled exceptions to the administrator.

