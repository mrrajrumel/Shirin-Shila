# Data Protection, Backup & Disaster Recovery Architecture

**Project**: Shirin Shila Official Cinema Portfolio  
**Target Environment**: Hostinger Node.js 22 LTS / LiteSpeed (Production Host)  
**Database**: MySQL `u473489494_shirin`  
**File Storage**: Dual Persistent Layer (Hostinger Persistent Disk + MySQL)

---

## 1. CMS Data Inventory

| Store Key | Storage Medium | Schema / Structure | Recovery Priority | Persistence Mechanism |
|---|---|---|---|---|
| `hero` | MySQL `cms_content` + JSON | Name, eyebrow, roles, CTA text, background image | High | Atomic upsert + disk shadow file |
| `about` | MySQL `cms_content` + JSON | Bio paragraphs, highlights, stats, portrait image | High | Atomic upsert + disk shadow file |
| `works` | MySQL `cms_content` + JSON | Filmography array (titles, roles, release years, directors) | Critical | Atomic upsert + disk shadow file |
| `showreels` | MySQL `cms_content` + JSON | YouTube/Vimeo video embed URLs, titles, descriptions | High | Atomic upsert + disk shadow file |
| `gallery` | MySQL `cms_content` + JSON | Promotional photo items with captions and image URLs | Medium | Atomic upsert + disk shadow file |
| `press` | MySQL `cms_content` + JSON | News clippings, interview links, publication dates | High | Atomic upsert + disk shadow file |
| `mediaPartners`| MySQL `cms_content` + JSON | TV channels, streaming platforms, partner logos | Medium | Atomic upsert + disk shadow file |
| `contactInfo` | MySQL `cms_content` + JSON | Official emails, phone numbers, agency details, social URLs | Critical | Atomic upsert + disk shadow file |
| `seo` | MySQL `cms_content` + JSON | Canonical siteUrl, meta title/description, OG image, favicon | Critical | Atomic upsert + disk shadow file |
| `pages` | MySQL `cms_content` + JSON | Pages registry (About Us, Contact, Privacy, Terms, llms.txt) | Critical | Atomic upsert + revision history table |
| `page_revisions`| MySQL relational table | Historical snapshots per page with revision number & author | High | Append-only relational table |
| `inquiries` | MySQL relational table | Casting proposals, submissions, honeypot validation status | Critical | Relational table with duplicate key update |
| `media_assets` | MySQL relational table | Uploaded media records (filename, url, size, mime, sha256) | Critical | File stored on disk + metadata in DB |

---

## 2. Persistence Architecture & Deployment Safety

```
                     [ Next.js Application Runtime ]
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
[ Primary Database: MySQL ]                         [ Secondary Fallback: Disk ]
Table: `cms_content`                                Path: `/persistent_data/store/`
- Atomic INSERT ... ON DUPLICATE KEY UPDATE          - Survives Git pull / deployment
- Version counter incremented                       - Shadow mirror of all store keys
- Audit entry in `cms_audit_logs`                    - Initial seed fallback if DB offline
```

### Deployment Overwrite Protection
During normal Git deployments:
1. `src/data/store/*.json` contains the initial repo template.
2. In `src/lib/server-storage.ts`, `readStore()` checks MySQL first.
3. If MySQL contains content, it is returned immediately. Repo files NEVER overwrite database records.
4. If MySQL is unreachable, `readStore()` checks `/persistent_data/store/`, which is outside the Git workspace and persists across deployments.
5. Inquiries and uploaded media are stored in dedicated directories outside ephemeral workspace paths.

---

## 3. Backup Locations & Retention Strategy

1. **Hostinger Automated Nightly Backups**:
   - Hostinger takes automated daily filesystem snapshots and MySQL database dumps.
   - Retained for 30 rolling days in hPanel.
2. **Admin One-Click Backup Snapshot (`/admin/backup`)**:
   - Downloads a complete JSON snapshot containing all 10 CMS stores, inquiries, and revision history.
   - Files named `shirin-shila-backup-YYYY-MM-DD-HHmmss.json`.
3. **Automated Server Shadow Copies**:
   - Located at `persistent_data/backups/`.
   - Updated before any bulk update or schema migration.

---

## 4. Disaster Recovery & Restoration Procedures

### Scenario A: Accidental Admin Overwrite
1. Navigate to `/admin/backup`.
2. Click **Restore from Backup File**.
3. Select the latest verified `.json` backup file.
4. The system validates JSON schema, executes atomic MySQL upserts for each store key, and writes audit records with `action: 'restore'`.
5. Revalidates all public paths.

### Scenario B: Individual Page Accidental Edit
1. Navigate to `/admin/pages`.
2. Select the affected page tab (e.g., `About Us` or `Terms of Representation`).
3. Scroll to the **Historical Revision Snapshots & Rollback** card in the right column.
4. Identify the desired timestamp and revision number.
5. Click the rollback icon (`RotateCcw`).
6. The system restores the snapshot, records a rollback audit entry, and refreshes the live public page.

### Scenario C: Complete Database Re-Provisioning
If the MySQL database is dropped or corrupted:
1. Provision a fresh MySQL database in Hostinger hPanel.
2. Update environment variables in Hostinger:
   ```bash
   DATABASE_HOST=localhost
   DATABASE_NAME=u473489494_shirin
   DATABASE_USER=u473489494_shirin
   DATABASE_PASSWORD=...
   ```
3. Restart the Next.js process.
4. `ensureDatabaseSchema()` automatically re-creates all 6 tables (`cms_content`, `cms_audit_logs`, `inquiries`, `media_assets`, `admin_users`, `page_revisions`).
5. `readStore()` automatically seeds MySQL from `/persistent_data/store/` or repo seed files.
6. The site is fully recovered with zero manual SQL typing.
