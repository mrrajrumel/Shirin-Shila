import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getPersistentStoreDir } from './persistent-paths';

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || 'shirin_shila_secret_session_token_2026_secured_tso';

export const SESSION_COOKIE_NAME = 'shirin_shila_admin_session';

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

function getUsersFile(): string {
  const storeDir = getPersistentStoreDir();
  return path.join(storeDir, 'admin-users.json');
}

// In-memory rate limiting map: identifier -> { count, lockedUntil }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Initializes and ensures exactly the two authorized administrator accounts:
 * 1. Shirin (password: Shirin@tso)
 * 2. Rumel (password: Rumel@tso)
 * Stored safely with bcrypt password hashes in src/data/store/admin-users.json.
 * Plaintext passwords are NEVER saved.
 */
export function ensureAdminAccounts(): AdminUserRecord[] {
  const usersFile = getUsersFile();
  const storeDir = getPersistentStoreDir();

  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }

  let users: AdminUserRecord[] = [];

  // Check if persistent users file exists
  if (fs.existsSync(usersFile)) {
    try {
      const raw = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(raw);
      if (!Array.isArray(users)) users = [];
    } catch (err) {
      console.error('[Auth] Error reading admin-users.json, re-initializing:', err);
      users = [];
    }
  } else {
    // Check if seed file exists in repository
    const seedUsersFile = path.join(process.cwd(), 'src', 'data', 'store', 'admin-users.json');
    if (fs.existsSync(seedUsersFile)) {
      try {
        const raw = fs.readFileSync(seedUsersFile, 'utf-8');
        users = JSON.parse(raw);
        if (!Array.isArray(users)) users = [];
      } catch {
        users = [];
      }
    }
  }

  let modified = false;

  // Account 1: Shirin
  let shirinUser = users.find(
    (u) => u.username && u.username.toLowerCase() === 'shirin'
  );
  if (!shirinUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Shirin@tso', salt);
    shirinUser = {
      id: 'admin-shirin',
      username: 'Shirin',
      displayName: 'Shirin Shila',
      role: 'admin',
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(shirinUser);
    modified = true;
  } else if (shirinUser.role !== 'admin') {
    shirinUser.role = 'admin';
    shirinUser.updatedAt = new Date().toISOString();
    modified = true;
  }

  // Account 2: Rumel
  let rumelUser = users.find(
    (u) => u.username && u.username.toLowerCase() === 'rumel'
  );
  if (!rumelUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Rumel@tso', salt);
    rumelUser = {
      id: 'admin-rumel',
      username: 'Rumel',
      displayName: 'Rumel Ahmed',
      role: 'manager',
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(rumelUser);
    modified = true;
  } else if (rumelUser.role !== 'manager') {
    rumelUser.role = 'manager';
    rumelUser.updatedAt = new Date().toISOString();
    modified = true;
  }

  // Ensure ONLY these two accounts exist (remove legacy or unauthorized accounts)
  const allowed = ['shirin', 'rumel'];
  const filteredUsers = users.filter((u) => allowed.includes(u.username.toLowerCase()));
  if (filteredUsers.length !== users.length) {
    users = filteredUsers;
    modified = true;
  }

  if (modified || !fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  }

  return users;
}

/**
 * Verifies credentials against the two authorized accounts with rate-limiting.
 */
export function verifyAdminCredentials(
  identifier?: string,
  password?: string,
  clientIp: string = 'global'
): { success: boolean; user?: SessionUser; error?: string } {
  if (!identifier || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  const rateKey = `${clientIp}_${identifier.trim().toLowerCase()}`;
  const now = Date.now();
  const attempt = loginAttempts.get(rateKey);

  if (attempt && attempt.lockedUntil > now) {
    const remainingMin = Math.ceil((attempt.lockedUntil - now) / 60000);
    return {
      success: false,
      error: `Account temporarily locked due to repeated failed attempts. Please retry in ${remainingMin} minute(s).`,
    };
  }

  const users = ensureAdminAccounts();
  const targetUser = users.find(
    (u) => u.username.toLowerCase() === identifier.trim().toLowerCase()
  );

  if (!targetUser) {
    recordFailedAttempt(rateKey, now);
    return { success: false, error: 'Invalid username or password' };
  }

  const passwordValid = bcrypt.compareSync(password, targetUser.passwordHash);

  if (!passwordValid) {
    recordFailedAttempt(rateKey, now);
    return { success: false, error: 'Invalid username or password' };
  }

  // Successful login -> clear failed attempts
  loginAttempts.delete(rateKey);

  return {
    success: true,
    user: {
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      role: targetUser.role,
    },
  };
}

function recordFailedAttempt(key: string, now: number) {
  const current = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  const newCount = current.count + 1;
  if (newCount >= MAX_ATTEMPTS) {
    loginAttempts.set(key, { count: newCount, lockedUntil: now + LOCKOUT_DURATION_MS });
  } else {
    loginAttempts.set(key, { count: newCount, lockedUntil: 0 });
  }
}

/**
 * Updates a user's display name. Returns updated user or an error string.
 */
export function updateDisplayName(
  userId: string,
  newDisplayName: string
): { success: boolean; error?: string; user?: AdminUserRecord } {
  const trimmed = newDisplayName.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 64) {
    return { success: false, error: 'Display name must be 2–64 characters.' };
  }

  const users = ensureAdminAccounts();

  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { success: false, error: 'User not found.' };

  users[idx] = {
    ...users[idx],
    displayName: trimmed,
    updatedAt: new Date().toISOString(),
  };

  const usersFile = getUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true, user: users[idx] };
}

/**
 * Changes a user's password after verifying the current password.
 * Enforces minimum complexity: 8+ chars, at least one letter and one digit.
 */
export function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  if (!currentPassword || !newPassword) {
    return { success: false, error: 'Current and new passwords are required.' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters.' };
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { success: false, error: 'New password must contain at least one letter and one number.' };
  }

  const users = ensureAdminAccounts();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return { success: false, error: 'User not found.' };

  const user = users[idx];
  const currentValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!currentValid) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  users[idx] = {
    ...user,
    passwordHash: newHash,
    updatedAt: new Date().toISOString(),
  };

  const usersFile = getUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true };
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export function createSessionToken(user: SessionUser): string {
  const payload = JSON.stringify({
    sub: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies HMAC-SHA256 signed session token and checks expiration.
 */
export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  // Timing safe equal check
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    if (payload.role !== 'admin' && payload.role !== 'manager') {
      return null;
    }

    return {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName || payload.username,
      role: payload.role as 'admin' | 'manager',
    };
  } catch {
    return null;
  }
}

export function getUserByUsername(username: string): AdminUserRecord | undefined {
  const users = ensureAdminAccounts();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Returns all admin user records (without passwordHash).
 */
export function getAllAdminUsers(): Omit<AdminUserRecord, 'passwordHash'>[] {
  const users = ensureAdminAccounts();
  return users.map(({ passwordHash: _, ...rest }) => rest);
}

/**
 * Returns true if the user has at least the required role level.
 * Role hierarchy: admin > manager
 */
export function hasMinimumRole(user: SessionUser | null, required: 'admin' | 'manager'): boolean {
  if (!user) return false;
  if (required === 'manager') return user.role === 'admin' || user.role === 'manager';
  if (required === 'admin') return user.role === 'admin';
  return false;
}
