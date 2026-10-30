# Database Setup & Configuration Guide

> **Target**: Hostinger Node.js Web Hosting Environment  
> **Database**: MySQL / MariaDB (`u473489494_shirin`)  
> **Security Notice**: Do NOT commit plaintext passwords or credentials to source repositories.

---

## 1. Required Environment Variables

Configure the following variables in the Hostinger server environment (via Hostinger hPanel or deployment settings):

| Variable Name | Purpose | Production Value (Hostinger Deployed App) |
|---|---|---|
| `DATABASE_HOST` | MySQL Server Hostname | `127.0.0.1` (Always use loopback from inside Hostinger) |
| `DATABASE_PORT` | MySQL Server Port | `3306` |
| `DATABASE_NAME` | Database Name | `u473489494_shirin` |
| `DATABASE_USER` | Database User | `u473489494_shirin` |
| `DATABASE_PASSWORD` | Database User Password | *[Configured via Hostinger Secure Environment Vault]* |
| `ADMIN_SECRET` | Cryptographic HMAC session secret | *[32+ character secure random secret]* |
| `PORT` | Node.js listening port | `3000` |
| `HOSTNAME` | Node.js interface bind | `0.0.0.0` |

---

## 2. Configuration Steps in Hostinger hPanel

1. **Log in to Hostinger hPanel**: Navigate to **Websites** $\rightarrow$ select `cornflowerblue-wildcat-675604.hostingersite.com`.
2. **Access Node.js Settings**: Click on the **Node.js** panel.
3. **Set Environment Variables**:
   - Scroll to **Environment Variables**.
   - Input each variable listed above (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `ADMIN_SECRET`).
   - Click **Save**.
4. **Automatic Process Restart**: Saving environment variables restarts the Node.js application process automatically.

---

## 3. Database Migration & Schema Initialization

Schema migrations execute **automatically and idempotently** on server boot via [`src/lib/db.ts`](file:///c:/Users/RajRu/Downloads/Shirin%20Shila/src/lib/db.ts) (`ensureDatabaseSchema()`):
- Creates `cms_content`, `cms_audit_logs`, `inquiries`, `media_assets`, and `admin_users` if they do not already exist.
- Will not drop, truncate, or overwrite existing tables or data.
- If initial database tables are empty, `server-storage.ts` automatically populates the default production content on first read.

---

## 4. Troubleshooting & Diagnostics

| Symptom | Probable Cause | Remediation Step |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL service offline | Verify database status in hPanel under **Databases**. |
| `Access denied for user` | Incorrect password or username | Verify `DATABASE_USER` and `DATABASE_PASSWORD` in Node.js environment variables. |
| Remote tool cannot connect | Missing remote IP rule | Add client IP or `%` under **Databases** $\rightarrow$ **Remote MySQL** in hPanel. |
| Application serving default content | Database credentials not detected | Check if `DATABASE_PASSWORD` is configured in environment variables. |
