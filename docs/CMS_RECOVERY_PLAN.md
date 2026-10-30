# CMS Content Migration & Incident Recovery Plan

> **Scope:** Incident Response & Content Recovery for Shirin Shila Portfolio CMS  
> **Applicability:** All administrative users, system engineers, and DevOps specialists  
> **Recovery Guarantee:** Zero destructive overwrites, verified before-and-after checksum comparisons  

---

## 1. Incident Context: The Media Selection Reset

### What Happened
In earlier deployments, media selections (such as selected Hero banner images or gallery photos) appeared to revert to initial repository default images after a Hostinger deployment.

### Root Cause Analysis
1. **Ephemeral Checkout Directory:** Hostinger's Git auto-deployment deploys each commit into a new isolated folder (`versions/<uuid>`), builds Next.js, and updates the `current` symlink.
2. **Repository Seed Overwrite:** If runtime stores (`src/data/store/*.json`) or media assets (`public/uploads/`) reside inside the Git repo, the new version directory contains the initial Git-tracked files, abandoning the previous release's edits.
3. **Hardcoded Component Defaults:** In certain components (such as the About section's prestige milestone cards), values were hardcoded in JSX rather than wired to dynamic CMS state.

---

## 2. Recovery Sources Hierarchy

When investigating lost or changed content, check recovery sources in this strict priority order:

```text
Priority 1: Hostinger User Persistent Store
            /home/u473489494/shirin_shila_persistent_data/store/*.json

Priority 2: Rolling Revisions (Last 5 automated snapshots per section)
            /home/u473489494/shirin_shila_persistent_data/backups/{section}/*.json

Priority 3: Offline Backup JSON Bundles
            Downloaded via /admin/backup or exported by administrator

Priority 4: Previous Release Directory History
            /home/u473489494/domains/cornflowerblue-wildcat-675604.hostingersite.com/versions/*/

Priority 5: Repository Default Seed Files (Last Resort)
            src/data/store/*.json
```

---

## 3. Step-by-Step Incident Recovery Protocol

### Scenario A: Recovering a Specific Section via Web CMS (Zero-Downtime)
1. Log in to the Admin Dashboard at `/admin`.
2. Navigate to **Data & Persistence** (`/admin/backup`).
3. If an offline backup bundle (`.json`) is available:
   - Select **Restore From Backup File**.
   - The server will automatically generate a safety snapshot of current data before applying changes.
   - The backup engine updates the persistent store atomically and triggers Next.js cache revalidation (`revalidatePath('/')`).
4. Verify the updated section on the live homepage.

### Scenario B: Recovering from Server-Side Rolling Backups (SSH / CLI)
1. SSH into the Hostinger server:
   ```bash
   ssh u473489494@your-hostinger-ip
   ```
2. Navigate to the persistent backups folder:
   ```bash
   cd /home/u473489494/shirin_shila_persistent_data/backups
   ```
3. Locate the section to restore (e.g. `hero`, `about`, `filmography`):
   ```bash
   ls -lat hero/
   # Lists rolling timestamped backups: hero.1793358000000.json, etc.
   ```
4. Copy the selected revision to the active store:
   ```bash
   cp hero/<chosen-timestamp>.json ../store/hero.json
   ```
5. Trigger cache refresh by visiting any admin page or saving a field.

### Scenario C: Re-Indexing and Linking Uploaded Media
If media files exist on disk but were unlinked in the CMS:
1. Ensure the image exists in `/home/u473489494/shirin_shila_persistent_data/uploads/`.
2. In the Admin Dashboard, navigate to **Media Library** (`/admin/media`).
3. The media engine automatically scans both persistent uploads and bundled images, calculating SHA-256 hashes and updating `media-manifest.json`.
4. Copy the asset's persistent URL (e.g. `/uploads/about/my-image.jpg`) and paste it into the respective section editor.

---

## 4. Conflict Resolution Rules

- **Rule 1 (Never Blindly Overwrite):** If an older backup has different values than current production, verify field by field. Do not restore an entire collection if it wipes newer legitimate edits.
- **Rule 2 (Pre-Restore Snapshot Mandatory):** The restore API (`POST /api/backup`) is architected to always write `snapshot-<timestamp>.json` into `backups/` *before* modifying any file in `store/`.
- **Rule 3 (Media Path Verification):** When restoring media selections, verify that the referenced URL returns HTTP 200 via the dynamic route `/uploads/...` or `/images/...`.

---

## 5. Post-Recovery Validation Checklist

After executing any recovery operation:
- [ ] Confirm all 9 frontend sections render correctly.
- [ ] Verify image URLs resolve with HTTP 200 (no 404 or broken placeholders).
- [ ] Verify text formatting, paragraph breaks, and Bengali script fidelity.
- [ ] Confirm admin CMS displays the recovered content in form fields.
- [ ] Download a fresh offline backup bundle from `/admin/backup` to capture the resolved recovery point.

