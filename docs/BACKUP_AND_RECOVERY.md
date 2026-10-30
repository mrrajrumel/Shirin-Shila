# Backup, Recovery & Disaster Prevention Guide

> **Application**: Shirin Shila Portfolio  
> **Database Engine**: Hostinger MySQL (`u473489494_shirin`)  
> **Hostinger Account**: `u473489494`

---

## 1. Dual Backup Architecture

The application provides two complementary backup tiers:

### Tier 1: Hostinger Native MySQL Backups
- **Automated Snapshots**: Hostinger takes automated daily and weekly system-level database snapshots.
- **Manual MySQL Export**:
  - Accessible via Hostinger hPanel $\rightarrow$ **Databases** $\rightarrow$ **phpMyAdmin** for `u473489494_shirin`.
  - Use the **Export** tab to download a standard `.sql` text file.

### Tier 2: Application-Level Offline JSON Backup Archive
- **Location**: Available directly inside the admin panel at [`/admin/backup`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/app/admin/backup/page.tsx).
- **Format**: Single download bundle containing all 12 CMS collections (`hero`, `about`, `filmography`, `gallery`, `showreels`, `timeline`, `press`, `mediaPartners`, `contactInfo`, `seo`, `inquiries`, `media-manifest`).
- **One-Click Restore**: Uploading a valid backup JSON bundle via `/admin/backup` immediately restores the entire CMS state, creating an automatic pre-restore safety snapshot before writing.

---

## 2. Step-by-Step Restoration Procedures

### Scenario A: Restoring from an Offline JSON Backup
1. Log in to the Admin Dashboard at `/admin`.
2. Navigate to **System Backup** (`/admin/backup`).
3. Select your previously downloaded `.json` archive.
4. Click **Restore Backup**.
5. The application takes an automated safety snapshot of the existing database, replaces all 12 keys in Hostinger MySQL and on disk, and triggers page revalidation.

### Scenario B: Restoring from a MySQL SQL Dump
1. Log in to Hostinger hPanel.
2. Navigate to **Databases** $\rightarrow$ **phpMyAdmin** for `u473489494_shirin`.
3. Click the **Import** tab.
4. Choose the `.sql` backup file and click **Import**.
5. The tables (`cms_content`, `cms_audit_logs`, `inquiries`, `media_assets`, `admin_users`) are restored to the exact snapshot state.

---

## 3. Media Asset Recovery
- All uploaded images and media reside in durable storage:
  `/home/u473489494/shirin_shila_persistent_data/uploads/`
- This directory is not affected by Git deployment checkouts.
- In the event of catastrophic server disk re-imaging, media assets can be restored by re-uploading the backup media directory.

