import {
  ensureAdminAccounts,
  createUser,
  updateUser,
  deleteUser,
  getAllAdminUsers,
  createSessionToken,
  verifySessionToken,
  hasMinimumRole,
} from '../src/lib/auth';

async function runTests() {
  console.log('================================================================');
  console.log('STARTING ROLE CHANGE, USER CREATION & RBAC COMPREHENSIVE TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Ensure initial admin accounts
  const initialUsers = ensureAdminAccounts();
  const shirin = initialUsers.find(u => u.username.toLowerCase() === 'shirin');
  const rumel = initialUsers.find(u => u.username.toLowerCase() === 'rumel');

  assert(!!shirin && shirin.role === 'admin', 'Initial check: Shirin exists with admin role');
  assert(!!rumel && (rumel.role === 'manager' || rumel.role === 'admin'), 'Initial check: Rumel exists');

  // 2. User Creation Test
  const testUsername = `qa_test_${Date.now().toString(36)}`;
  const createResult = createUser({
    username: testUsername,
    displayName: 'QA Test Specialist',
    password: 'SecureTestPass123!',
    role: 'manager',
  }, 'admin-shirin');

  assert(createResult.success, 'User Creation: create new manager user', createResult.error);
  assert(createResult.user?.role === 'manager', 'User Creation: assigned role is manager');
  assert(createResult.user?.username === testUsername, 'User Creation: username matches input');
  assert(!('passwordHash' in (createResult.user || {})), 'User Creation: passwordHash is not exposed in return value');

  const testUserId = createResult.user?.id!;

  // 3. Duplicate User Validation
  const duplicateResult = createUser({
    username: testUsername,
    displayName: 'Duplicate Attempt',
    password: 'SecureTestPass123!',
    role: 'manager',
  }, 'admin-shirin');

  assert(!duplicateResult.success, 'Duplicate Validation: duplicate username rejected');
  assert(
    !!duplicateResult.error && duplicateResult.error.includes('already taken'),
    'Duplicate Validation: informative error returned'
  );

  // 4. User Search and Role Filtering
  const searchResults = getAllAdminUsers(testUsername, 'manager');
  assert(
    searchResults.some(u => u.id === testUserId),
    'Search & Filter: newly created user visible via search query and manager role filter'
  );

  // 5. Initial Session Verification (Manager)
  const initialToken = createSessionToken({
    id: testUserId,
    username: testUsername,
    displayName: 'QA Test Specialist',
    role: 'manager',
  });
  const verifiedInitialSession = verifySessionToken(initialToken);
  assert(
    !!verifiedInitialSession && verifiedInitialSession.role === 'manager',
    'Session Verification: initial token resolves with live manager role'
  );
  assert(
    hasMinimumRole(verifiedInitialSession, 'manager') && !hasMinimumRole(verifiedInitialSession, 'admin'),
    'RBAC Enforcement: manager cannot access admin-only privileges'
  );

  // 6. Role Change: Promote test user to Administrator
  const promoteResult = updateUser(
    testUserId,
    { role: 'admin' },
    'admin-shirin'
  );
  assert(promoteResult.success, 'Role Change: update role from manager to admin', promoteResult.error);
  assert(promoteResult.user?.role === 'admin', 'Role Change: returned user has admin role');

  // 7. Role Persistence: Re-read from storage / ensureAdminAccounts
  const refreshedUsers = ensureAdminAccounts();
  const refreshedUser = refreshedUsers.find(u => u.id === testUserId);
  assert(
    !!refreshedUser && refreshedUser.role === 'admin',
    'Role Persistence: user remains admin after store re-read / ensureAdminAccounts'
  );

  // 8. Live Session Permission Revalidation: Old session token now automatically reflects Admin role!
  const verifiedPromotedSession = verifySessionToken(initialToken);
  assert(
    !!verifiedPromotedSession && verifiedPromotedSession.role === 'admin',
    'Live Session Revalidation: existing session token immediately reflects updated admin role without re-login'
  );
  assert(
    hasMinimumRole(verifiedPromotedSession, 'admin'),
    'RBAC Enforcement: promoted user now has admin authorization'
  );

  // 9. Role Change: Demote test user back to Manager
  const demoteResult = updateUser(
    testUserId,
    { role: 'manager' },
    'admin-shirin'
  );
  assert(demoteResult.success, 'Role Change: update role from admin back to manager', demoteResult.error);
  assert(demoteResult.user?.role === 'manager', 'Role Change: returned user has manager role');

  // 10. Immediate Revocation of Admin Privileges in Active Session
  const verifiedDemotedSession = verifySessionToken(initialToken);
  assert(
    !!verifiedDemotedSession && verifiedDemotedSession.role === 'manager',
    'Live Session Revalidation: session immediately reflects demoted manager role'
  );
  assert(
    !hasMinimumRole(verifiedDemotedSession, 'admin'),
    'RBAC Enforcement: demoted user immediately loses admin authorization'
  );

  // 11. Last Administrator Protection: Attempt to demote Shirin (founder)
  const demoteFounderResult = updateUser(
    'admin-shirin',
    { role: 'manager' },
    'admin-shirin'
  );
  assert(!demoteFounderResult.success, 'Last-Admin Protection: demoting founder is rejected');
  assert(
    !!demoteFounderResult.error && demoteFounderResult.error.includes('founder'),
    'Last-Admin Protection: founder protection message returned'
  );

  // 12. Self-Deletion Protection
  const selfDeleteResult = deleteUser('admin-shirin', 'admin-shirin');
  assert(!selfDeleteResult.success, 'Self-Deletion Protection: cannot delete own active account');

  // 13. Clean Deletion of Test User
  const deleteResult = deleteUser(testUserId, 'admin-shirin');
  assert(deleteResult.success, 'User Deletion: delete test user', deleteResult.error);

  // 14. Session Invalidation upon Account Deletion
  const postDeleteSession = verifySessionToken(initialToken);
  assert(
    postDeleteSession === null,
    'Session Invalidation: deleted user session token is immediately revoked (returns null)'
  );

  // 15. Verify real accounts remain untouched
  const finalUsers = ensureAdminAccounts();
  const finalShirin = finalUsers.find(u => u.username.toLowerCase() === 'shirin');
  const finalRumel = finalUsers.find(u => u.username.toLowerCase() === 'rumel');
  assert(!!finalShirin && finalShirin.role === 'admin', 'Production Integrity: Shirin preserved as admin');
  assert(!!finalRumel, 'Production Integrity: Rumel preserved');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

