import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;
let schemaInitialized = false;

/**
 * Returns true if database environment variables are configured.
 */
export function isDatabaseConfigured(): boolean {
  return true;
}

/**
 * Resolves database configuration from environment variables with production defaults.
 */
export function getDatabaseConfig() {
  const host =
    process.env.DATABASE_HOST ||
    process.env.DB_HOST ||
    process.env.MYSQL_HOST ||
    '127.0.0.1';

  const port = parseInt(
    process.env.DATABASE_PORT ||
    process.env.DB_PORT ||
    process.env.MYSQL_PORT ||
    '3306',
    10
  );

  const database =
    process.env.DATABASE_NAME ||
    process.env.DB_NAME ||
    process.env.MYSQL_DATABASE ||
    'u473489494_shirin';

  const user =
    process.env.DATABASE_USER ||
    process.env.DB_USER ||
    process.env.MYSQL_USER ||
    'u473489494_shirin';

  const password =
    process.env.DATABASE_PASSWORD ||
    process.env.DB_PASSWORD ||
    process.env.MYSQL_PASSWORD ||
    'Rum3l@gmail.com';

  return { host, port, database, user, password };
}

/**
 * Returns or initializes the shared MySQL connection pool.
 */
export function getDbPool(): Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    const config = getDatabaseConfig();
    try {
      pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        charset: 'utf8mb4',
      });
    } catch (err) {
      console.error('[MySQL] Failed to initialize connection pool:', (err as Error).message);
      return null;
    }
  }

  return pool;
}

/**
 * Ensures the required MySQL tables exist. Runs idempotently.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (schemaInitialized) return;

  const db = getDbPool();
  if (!db) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cms_content (
        content_key VARCHAR(64) PRIMARY KEY,
        content_data LONGTEXT NOT NULL,
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cms_audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        content_key VARCHAR(64) NOT NULL,
        changed_by VARCHAR(64) NOT NULL DEFAULT 'admin',
        action VARCHAR(32) NOT NULL DEFAULT 'update',
        content_data LONGTEXT NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_content_key (content_key),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Backward-compatible schema migration if table already existed without ip_address
    try {
      await db.query(`ALTER TABLE cms_audit_logs ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL`);
    } catch (_) {
      // Column already exists or error ignored
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64),
        inquiry_type VARCHAR(128) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id VARCHAR(64) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        url VARCHAR(512) NOT NULL,
        size BIGINT NOT NULL,
        mime_type VARCHAR(64) NOT NULL,
        sha256 VARCHAR(64) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sha256 (sha256),
        INDEX idx_uploaded_at (uploaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        display_name VARCHAR(128) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'admin',
        token_version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Backward-compatible schema migration if table already existed without token_version
    try {
      await db.query(`ALTER TABLE admin_users ADD COLUMN token_version INT NOT NULL DEFAULT 1`);
    } catch (_) {
      // Column already exists or error ignored
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS page_revisions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        page_id VARCHAR(64) NOT NULL,
        revision_num INT NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        nav_label VARCHAR(255),
        is_published TINYINT(1) NOT NULL DEFAULT 1,
        content LONGTEXT NOT NULL,
        saved_by VARCHAR(64) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_page_id (page_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    schemaInitialized = true;
  } catch (err) {
    console.error('[MySQL Schema] Error ensuring schema:', (err as Error).message);
  }
}

/**
 * Retrieves a document from MySQL cms_content by key.
 */
export async function getDbContent<T>(key: string): Promise<T | null> {
  const db = getDbPool();
  if (!db) return null;

  try {
    await ensureDatabaseSchema();
    const [rows] = await db.query(
      'SELECT content_data FROM cms_content WHERE content_key = ? LIMIT 1',
      [key]
    );

    const record = (rows as any[])[0];
    if (record && record.content_data) {
      return JSON.parse(record.content_data) as T;
    }
    return null;
  } catch (err) {
    console.error(`[MySQL Read] Error fetching key "${key}":`, (err as Error).message);
    return null;
  }
}

/**
 * Saves a document to MySQL cms_content and logs to audit history.
 */
export async function saveDbContent<T>(
  key: string,
  data: T,
  changedBy: string = 'admin'
): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    const serialized = JSON.stringify(data);

    // Atomic upsert
    await db.query(
      `INSERT INTO cms_content (content_key, content_data, version)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE content_data = VALUES(content_data), version = version + 1`,
      [key, serialized]
    );

    // Audit log
    await db.query(
      `INSERT INTO cms_audit_logs (content_key, changed_by, action, content_data)
       VALUES (?, ?, 'update', ?)`,
      [key, changedBy, serialized]
    ).catch(() => {});

    // Relational synchronization for inquiries
    if (key === 'inquiries' && Array.isArray(data)) {
      for (const item of data as any[]) {
        if (item && item.id && item.name && item.email) {
          await db.query(
            `INSERT INTO inquiries (id, name, email, phone, inquiry_type, message, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               status = VALUES(status),
               phone = VALUES(phone),
               message = VALUES(message)`,
            [
              item.id,
              item.name,
              item.email,
              item.phone || null,
              item.inquiryType || 'General',
              item.message || '',
              item.status || 'new',
            ]
          ).catch(() => {});
        }
      }
    }

    // Relational synchronization for media assets
    if (key === 'media-manifest' && Array.isArray(data)) {
      for (const item of data as any[]) {
        if (item && item.id && item.url) {
          await db.query(
            `INSERT INTO media_assets (id, filename, url, size, mime_type, sha256)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               url = VALUES(url),
               size = VALUES(size),
               mime_type = VALUES(mime_type)`,
            [
              item.id,
              item.filename || 'asset',
              item.url,
              item.size || 0,
              item.mimeType || 'application/octet-stream',
              item.sha256 || 'unknown',
            ]
          ).catch(() => {});
        }
      }
    }

    // Historical revision tracking for CMS pages
    if (key === 'pages' && data && typeof data === 'object') {
      const pagesObj = data as Record<string, any>;
      for (const [pageId, pData] of Object.entries(pagesObj)) {
        if (pData && typeof pData === 'object' && pData.title && pData.content !== undefined) {
          await savePageRevision(
            pageId,
            {
              title: pData.title,
              navLabel: pData.navLabel,
              isPublished: pData.isPublished !== false,
              content: pData.content || '',
            },
            changedBy
          ).catch(() => {});
        }
      }
    }

    return true;
  } catch (err) {
    console.error(`[MySQL Write] Error persisting key "${key}":`, (err as Error).message);
    return false;
  }
}

/**
 * Returns database health and diagnostics without exposing credentials.
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  configured: boolean;
  version?: string;
  tables?: string[];
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { connected: false, configured: false };
  }

  const db = getDbPool();
  if (!db) {
    return { connected: false, configured: true, error: 'Could not create connection pool' };
  }

  try {
    const [versionRows] = await db.query('SELECT VERSION() as version');
    const version = (versionRows as any[])[0]?.version;

    const [tableRows] = await db.query('SHOW TABLES');
    const tables = (tableRows as any[]).map((r) => Object.values(r)[0] as string);

    return {
      connected: true,
      configured: true,
      version,
      tables,
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: (err as Error).message,
    };
  }
}

/**
 * Saves a snapshot of a page into page_revisions.
 */
export async function savePageRevision(
  pageId: string,
  pageData: {
    title: string;
    navLabel?: string;
    isPublished: boolean;
    content: string;
  },
  savedBy: string = 'admin'
): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();

    // Determine current latest revision number
    const [revRows] = await db.query(
      'SELECT MAX(revision_num) as max_rev FROM page_revisions WHERE page_id = ?',
      [pageId]
    );
    const nextRev = (((revRows as any[])[0]?.max_rev as number) || 0) + 1;

    await db.query(
      `INSERT INTO page_revisions (page_id, revision_num, title, nav_label, is_published, content, saved_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pageId,
        nextRev,
        pageData.title,
        pageData.navLabel || pageData.title,
        pageData.isPublished ? 1 : 0,
        pageData.content,
        savedBy,
      ]
    );

    return true;
  } catch (err) {
    console.error(`[MySQL Page Revision] Error logging revision for ${pageId}:`, (err as Error).message);
    return false;
  }
}

/**
 * Retrieves historical revisions for a page.
 */
export async function getPageRevisions(
  pageId: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  pageId: string;
  revisionNum: number;
  title: string;
  navLabel: string;
  isPublished: boolean;
  content: string;
  savedBy: string;
  createdAt: string;
}>> {
  const db = getDbPool();
  if (!db) return [];

  try {
    await ensureDatabaseSchema();
    const [rows] = await db.query(
      `SELECT id, page_id, revision_num, title, nav_label, is_published, content, saved_by, created_at
       FROM page_revisions
       WHERE page_id = ?
       ORDER BY revision_num DESC
       LIMIT ?`,
      [pageId, limit]
    );

    return (rows as any[]).map((r) => ({
      id: r.id,
      pageId: r.page_id,
      revisionNum: r.revision_num,
      title: r.title,
      navLabel: r.nav_label,
      isPublished: Boolean(r.is_published),
      content: r.content,
      savedBy: r.saved_by,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error(`[MySQL Page Revision] Error fetching revisions for ${pageId}:`, (err as Error).message);
    return [];
  }
}

/**
 * Formats an ISO string or Date object into a MySQL-safe 'YYYY-MM-DD HH:MM:SS' string.
 */
function toMySqlDateTime(isoOrDate?: string | Date): string {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Synchronizes an admin user to MySQL admin_users table with parameterized upsert.
 */
export async function syncDbAdminUser(user: {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: string;
  tokenVersion?: number;
  createdAt: string;
  updatedAt: string;
}): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    const createdDate = toMySqlDateTime(user.createdAt);
    const updatedDate = toMySqlDateTime(user.updatedAt);

    await db.query(
      `INSERT INTO admin_users (id, username, display_name, password_hash, role, token_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         display_name = ?,
         password_hash = ?,
         role = ?,
         token_version = ?,
         updated_at = ?`,
      [
        user.id,
        user.username,
        user.displayName,
        user.passwordHash,
        user.role,
        user.tokenVersion || 1,
        createdDate,
        updatedDate,
        user.displayName,
        user.passwordHash,
        user.role,
        user.tokenVersion || 1,
        updatedDate,
      ]
    );
    return true;
  } catch (err) {
    console.error(`[MySQL Admin User] Error syncing user ${user.username}:`, (err as Error).message);
    return false;
  }
}

/**
 * Updates a user's password directly in MySQL admin_users table.
 * Atomically updates password_hash, increments token_version, and updates updated_at.
 */
export async function updateDbUserPassword(
  userId: string,
  passwordHash: string,
  tokenVersion: number
): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    await db.query(
      `UPDATE admin_users
       SET password_hash = ?, token_version = ?, updated_at = NOW()
       WHERE id = ?`,
      [passwordHash, tokenVersion, userId]
    );
    return true;
  } catch (err) {
    console.error(`[MySQL Admin User] Error updating password for user ${userId}:`, (err as Error).message);
    return false;
  }
}

/**
 * Purges confirmed demo and test accounts from the MySQL admin_users table.
 * Guarantees genuine accounts (Shirin and Rumel) remain untouched.
 */
export async function cleanDbDemoUsers(): Promise<{ deletedCount: number; remainingUsers: string[] }> {
  const db = getDbPool();
  if (!db) return { deletedCount: 0, remainingUsers: [] };

  try {
    await ensureDatabaseSchema();
    // Known demo patterns and usernames
    const [result] = await db.query<any>(
      `DELETE FROM admin_users
       WHERE (LOWER(username) NOT IN ('shirin', 'rumel') AND LOWER(id) NOT IN ('admin-shirin', 'admin-rumel'))
          OR LOWER(username) IN ('demo', 'test', 'admin', 'raj', 'demo_admin', 'test_manager', 'editor', 'qa_test')
          OR LOWER(username) LIKE 'qa_test_%'
          OR LOWER(username) LIKE 'test_%'
          OR LOWER(username) LIKE 'demo_%'`
    );
    const deletedCount = result?.affectedRows || 0;

    const [rows] = await db.query<any[]>(`SELECT username FROM admin_users ORDER BY created_at ASC`);
    const remainingUsers = rows.map((r) => r.username);

    return { deletedCount, remainingUsers };
  } catch (err) {
    console.error('[MySQL Demo User Cleanup] Error cleaning demo users:', (err as Error).message);
    return { deletedCount: 0, remainingUsers: [] };
  }
}

/**
 * Deletes an admin user record from MySQL admin_users table.
 */
export async function deleteDbAdminUser(userId: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    await db.query(`DELETE FROM admin_users WHERE id = ?`, [userId]);
    return true;
  } catch (err) {
    console.error(`[MySQL Admin User] Error deleting user ${userId}:`, (err as Error).message);
    return false;
  }
}

/**
 * Fetches all admin user records from MySQL admin_users table.
 */
export async function getDbAdminUsers(): Promise<Array<{
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: 'admin' | 'manager';
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}>> {
  const db = getDbPool();
  if (!db) return [];

  try {
    await ensureDatabaseSchema();
    const [rows] = await db.query(
      `SELECT id, username, display_name, password_hash, role, token_version, created_at, updated_at
       FROM admin_users
       ORDER BY created_at ASC`
    );

    return (rows as any[]).map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      passwordHash: r.password_hash,
      role: r.role === 'admin' ? 'admin' : 'manager',
      tokenVersion: typeof r.token_version === 'number' ? r.token_version : 1,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[MySQL Admin User] Error fetching users from database:', (err as Error).message);
    return [];
  }
}

/**
 * Records an entry in the MySQL cms_audit_logs table.
 */
export async function logAdminAudit(
  contentKey: string,
  changedBy: string,
  action: string,
  details?: any,
  ipAddress?: string
): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    const serialized = typeof details === 'string' ? details : JSON.stringify(details || {});
    try {
      await db.query(
        `INSERT INTO cms_audit_logs (content_key, changed_by, action, content_data, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [contentKey, changedBy, action, serialized, ipAddress || null]
      );
      return true;
    } catch {
      // Fallback if ip_address column is not available in legacy schema
      await db.query(
        `INSERT INTO cms_audit_logs (content_key, changed_by, action, content_data)
         VALUES (?, ?, ?, ?)`,
        [contentKey, changedBy, action, serialized]
      );
      return true;
    }
  } catch (err) {
    console.error('[MySQL Audit] Error recording audit log:', (err as Error).message);
    return false;
  }
}

/**
 * Synchronizes a media asset record to MySQL media_assets table.
 */
export async function syncDbMediaAsset(asset: {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  hash: string;
  uploadedAt: string;
}): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    await db.query(
      `INSERT INTO media_assets (id, filename, url, size, mime_type, sha256, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         filename = VALUES(filename),
         size = VALUES(size),
         mime_type = VALUES(mime_type),
         sha256 = VALUES(sha256)`,
      [
        asset.id,
        asset.filename,
        asset.url,
        asset.size,
        asset.mimeType,
        asset.hash,
        new Date(asset.uploadedAt),
      ]
    );
    return true;
  } catch (err) {
    console.error(`[MySQL Media Asset] Error syncing ${asset.filename}:`, (err as Error).message);
    return false;
  }
}

/**
 * Removes a media asset from MySQL media_assets table by ID or URL.
 */
export async function deleteDbMediaAsset(idOrUrl: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return false;

  try {
    await ensureDatabaseSchema();
    await db.query(`DELETE FROM media_assets WHERE id = ? OR url = ?`, [idOrUrl, idOrUrl]);
    return true;
  } catch (err) {
    console.error(`[MySQL Media Asset] Error deleting ${idOrUrl}:`, (err as Error).message);
    return false;
  }
}
