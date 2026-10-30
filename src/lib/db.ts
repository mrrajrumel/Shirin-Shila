import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;
let schemaInitialized = false;

/**
 * Returns true if database environment variables are configured.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_PASSWORD ||
    process.env.DB_PASSWORD ||
    process.env.MYSQL_PASSWORD
  );
}

/**
 * Resolves database configuration from environment variables.
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
    '';

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_content_key (content_key),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
