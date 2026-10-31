import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getPersistentStoreDir } from './persistent-paths';
import { syncDbAdminUser, deleteDbAdminUser, logAdminAudit } from './db';

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

  // Account 2: Rumel (Default initial account: Manager)
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
  }

  // Ensure at least one account has admin role (fallback protection)
  const hasAdmin = users.some((u) => u.role === 'admin');
  if (!hasAdmin && shirinUser) {
    shirinUser.role = 'admin';
    modified = true;
  }

  if (modified || !fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  }

  // Asynchronously ensure database records are in sync
  for (const user of users) {
    syncDbAdminUser(user).catch(() => {});
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

    // Live session revalidation: Lookup user in live registry to ensure account is active and role is fresh
    const users = ensureAdminAccounts();
    const liveUser = users.find(
      (u) =>
        u.id === payload.sub ||
        (payload.username && u.username.toLowerCase() === payload.username.toLowerCase())
    );

    // If account was deleted or removed from registry, invalidate session immediately
    if (!liveUser) {
      return null;
    }

    // Always enforce the live persisted role and display name from the storage registry
    return {
      id: liveUser.id,
      username: liveUser.username,
      displayName: liveUser.displayName || liveUser.username,
      role: liveUser.role,
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
 * Returns admin user records (without passwordHash), with optional query and role filtering.
 */
export function getAllAdminUsers(query?: string, role?: string): Omit<AdminUserRecord, 'passwordHash'>[] {
  const users = ensureAdminAccounts();
  let result = users.map(({ passwordHash: _, ...rest }) => rest);

  if (role && role !== 'all') {
    result = result.filter((u) => u.role === role);
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }

  return result;
}

export interface CreateUserInput {
  username: string;
  displayName: string;
  password: string;
  role: 'admin' | 'manager';
}

/**
 * Creates a new administrator or manager user.
 * Validates unique username, strong password, and hashes with bcrypt.
 */
export function createUser(
  input: CreateUserInput,
  requestingUserId?: string
): {
  success: boolean;
  user?: Omit<AdminUserRecord, 'passwordHash'>;
  error?: string;
} {
  const username = (input.username || '').trim();
  const displayName = (input.displayName || '').trim();
  const password = input.password || '';
  const role = input.role || 'manager';

  if (!username || !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return {
      success: false,
      error: 'Username must be 3–30 characters and contain only letters, numbers, hyphens, or underscores.',
    };
  }

  if (!displayName || displayName.length < 2 || displayName.length > 64) {
    return {
      success: false,
      error: 'Display name must be between 2 and 64 characters.',
    };
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      error: 'Password must be at least 8 characters.',
    };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      success: false,
      error: 'Password must contain at least one letter and one number.',
    };
  }

  if (role !== 'admin' && role !== 'manager') {
    return {
      success: false,
      error: 'Role must be either "admin" or "manager".',
    };
  }

  const users = ensureAdminAccounts();

  // Check username uniqueness (case-insensitive)
  const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return {
      success: false,
      error: `Username "${username}" is already taken. Please choose another username.`,
    };
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const now = new Date().toISOString();
  const id = `admin-${username.toLowerCase()}-${Date.now().toString(36)}`;

  const newUser: AdminUserRecord = {
    id,
    username,
    displayName,
    role,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);

  const usersFile = getUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');

  // Sync to MySQL admin_users and record audit log
  syncDbAdminUser(newUser).catch(() => {});
  logAdminAudit('admin_users', requestingUserId || 'system', 'create_user', {
    id: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  }).catch(() => {});

  const { passwordHash: _, ...safeUser } = newUser;
  return {
    success: true,
    user: safeUser,
  };
}

export interface UpdateUserInput {
  displayName?: string;
  role?: 'admin' | 'manager';
}

/**
 * Updates an admin or manager user's display name or role.
 * Protects against demoting the founder or the only remaining administrator.
 */
export function updateUser(
  userId: string,
  input: UpdateUserInput,
  requestingUserId: string
): {
  success: boolean;
  user?: Omit<AdminUserRecord, 'passwordHash'>;
  error?: string;
} {
  const users = ensureAdminAccounts();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) {
    return { success: false, error: 'User not found.' };
  }

  const targetUser = users[idx];
  const previousRole = targetUser.role;

  // Role modification validation
  if (input.role && input.role !== targetUser.role) {
    if (input.role !== 'admin' && input.role !== 'manager') {
      return { success: false, error: 'Invalid role specified. Role must be "admin" or "manager".' };
    }

    // Founder protection: Shirin cannot be demoted from admin
    if (targetUser.username.toLowerCase() === 'shirin' && input.role === 'manager') {
      return {
        success: false,
        error: 'The primary founder account (@Shirin) must remain an Administrator.',
      };
    }

    // Last administrator protection
    if (targetUser.role === 'admin' && input.role === 'manager') {
      const otherAdmins = users.filter((u) => u.id !== userId && u.role === 'admin');
      if (otherAdmins.length === 0) {
        return {
          success: false,
          error: 'Cannot demote the only remaining Administrator. Assign another Administrator first.',
        };
      }
    }
    targetUser.role = input.role;
  }

  if (input.displayName !== undefined) {
    const trimmed = input.displayName.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 64) {
      return { success: false, error: 'Display name must be between 2 and 64 characters.' };
    }
    targetUser.displayName = trimmed;
  }

  targetUser.updatedAt = new Date().toISOString();
  users[idx] = targetUser;

  const usersFile = getUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');

  // Sync to MySQL admin_users and record audit log
  syncDbAdminUser(targetUser).catch(() => {});
  logAdminAudit('admin_users', requestingUserId, 'update_user', {
    id: targetUser.id,
    username: targetUser.username,
    previousRole,
    newRole: targetUser.role,
    displayName: targetUser.displayName,
  }).catch(() => {});

  const { passwordHash: _, ...safeUser } = targetUser;
  return {
    success: true,
    user: safeUser,
  };
}

/**
 * Deletes a user account.
 * Prevents self-deletion, deleting the founder account, and deleting the last administrator.
 */
export function deleteUser(
  userId: string,
  requestingUserId: string
): {
  success: boolean;
  error?: string;
} {
  if (userId === requestingUserId) {
    return {
      success: false,
      error: 'You cannot delete your own account while signed in.',
    };
  }

  const users = ensureAdminAccounts();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) {
    return { success: false, error: 'User not found.' };
  }

  const targetUser = users[idx];

  // Primary founder account protection
  if (targetUser.username.toLowerCase() === 'shirin') {
    return {
      success: false,
      error: 'The primary founder account (@Shirin) cannot be deleted.',
    };
  }

  // Last administrator check
  if (targetUser.role === 'admin') {
    const otherAdmins = users.filter((u) => u.id !== userId && u.role === 'admin');
    if (otherAdmins.length === 0) {
      return {
        success: false,
        error: 'Cannot delete the only remaining Administrator.',
      };
    }
  }

  const [deletedUser] = users.splice(idx, 1);

  const usersFile = getUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');

  // Sync to MySQL admin_users and record audit log
  deleteDbAdminUser(userId).catch(() => {});
  logAdminAudit('admin_users', requestingUserId, 'delete_user', {
    id: deletedUser.id,
    username: deletedUser.username,
  }).catch(() => {});

  return { success: true };
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
