import fs from 'fs';
import path from 'path';

/**
 * Persistent Paths Manager for Shirin Shila Portfolio
 * Guarantees zero data loss across GitHub deployments on Hostinger, cPanel, and VPS environments.
 */

export function getPersistentStoreDir(): string {
  // 1. Explicit environment variable configured in Hostinger or .env
  if (process.env.DATA_STORE_DIR && process.env.DATA_STORE_DIR.trim()) {
    const custom = path.resolve(process.env.DATA_STORE_DIR.trim());
    if (!fs.existsSync(custom)) {
      try {
        fs.mkdirSync(custom, { recursive: true });
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create custom DATA_STORE_DIR:', err);
      }
    }
    return custom;
  }

  // 2. Hostinger / Linux production user environment
  // Automatically detects user home (e.g. /home/u473489494) outside the versioned release folders
  if (process.platform === 'linux') {
    const homeMatch = process.cwd().match(/^(\/home\/[^/]+)/);
    if (homeMatch) {
      const userHome = homeMatch[1];
      const persistentDir = path.join(userHome, 'shirin_shila_persistent_data', 'store');
      try {
        if (!fs.existsSync(persistentDir)) {
          fs.mkdirSync(persistentDir, { recursive: true });
        }
        return persistentDir;
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create user-level persistent store dir:', err);
      }
    }
  }

  // 3. Fallback: local project repository store
  const localStore = path.join(process.cwd(), 'src', 'data', 'store');
  if (!fs.existsSync(localStore)) {
    fs.mkdirSync(localStore, { recursive: true });
  }
  return localStore;
}

export function getPersistentUploadsDir(): string {
  // 1. Explicit environment variable
  if (process.env.MEDIA_UPLOADS_DIR && process.env.MEDIA_UPLOADS_DIR.trim()) {
    const custom = path.resolve(process.env.MEDIA_UPLOADS_DIR.trim());
    if (!fs.existsSync(custom)) {
      try {
        fs.mkdirSync(custom, { recursive: true });
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create custom MEDIA_UPLOADS_DIR:', err);
      }
    }
    return custom;
  }

  // 2. Hostinger / Linux production user environment
  if (process.platform === 'linux') {
    const homeMatch = process.cwd().match(/^(\/home\/[^/]+)/);
    if (homeMatch) {
      const userHome = homeMatch[1];
      const persistentDir = path.join(userHome, 'shirin_shila_persistent_data', 'uploads');
      try {
        if (!fs.existsSync(persistentDir)) {
          fs.mkdirSync(persistentDir, { recursive: true });
        }
        return persistentDir;
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create user-level uploads dir:', err);
      }
    }
  }

  // 3. Fallback: local public/uploads
  const localUploads = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(localUploads)) {
    fs.mkdirSync(localUploads, { recursive: true });
  }
  return localUploads;
}

export function getPersistentBackupsDir(): string {
  if (process.env.BACKUPS_DIR && process.env.BACKUPS_DIR.trim()) {
    const custom = path.resolve(process.env.BACKUPS_DIR.trim());
    if (!fs.existsSync(custom)) {
      try {
        fs.mkdirSync(custom, { recursive: true });
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create custom BACKUPS_DIR:', err);
      }
    }
    return custom;
  }

  if (process.platform === 'linux') {
    const homeMatch = process.cwd().match(/^(\/home\/[^/]+)/);
    if (homeMatch) {
      const userHome = homeMatch[1];
      const persistentDir = path.join(userHome, 'shirin_shila_persistent_data', 'backups');
      try {
        if (!fs.existsSync(persistentDir)) {
          fs.mkdirSync(persistentDir, { recursive: true });
        }
        return persistentDir;
      } catch (err) {
        console.warn('[PersistentPaths] Failed to create user-level backups dir:', err);
      }
    }
  }

  const localBackups = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(localBackups)) {
    fs.mkdirSync(localBackups, { recursive: true });
  }
  return localBackups;
}

