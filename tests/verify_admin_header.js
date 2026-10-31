const fs = require('fs');

console.log('================================================================');
console.log('VERIFYING ADMIN HEADER CLEANUP & UI CONSISTENCY');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

// 1. Inspect src/app/admin/layout.tsx
const layoutContent = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');

assert(!layoutContent.includes('adm-user-chip'), 'Layout: adm-user-chip container removed from topbar');
assert(!layoutContent.includes('adm-user-avatar'), 'Layout: adm-user-avatar removed from topbar');
assert(!layoutContent.includes('{pageTitle}'), 'Layout: duplicate pageTitle removed from topbar');
assert(layoutContent.includes('adm-hamburger-btn'), 'Layout: mobile hamburger button preserved');
assert(layoutContent.includes('adm-topbar-search'), 'Layout: global search command palette preserved');
assert(layoutContent.includes('handleLogout'), 'Layout: sign-out button preserved');
assert(layoutContent.includes('/admin/profile'), 'Layout: profile link preserved in sidebar under SEO & Settings');

// 2. Inspect src/app/admin/admin.css
const cssContent = fs.readFileSync('src/app/admin/admin.css', 'utf8');
assert(
  !cssContent.includes('.adm-header .adm-header-title {\n    display: none;'),
  'CSS: In-page headings are NOT hidden on mobile/responsive breakpoints'
);

// 3. Inspect in-page headers across admin pages
const adminPages = [
  'src/app/admin/users/page.tsx',
  'src/app/admin/media/page.tsx',
  'src/app/admin/hero/page.tsx',
  'src/app/admin/about/page.tsx',
  'src/app/admin/works/page.tsx',
  'src/app/admin/backup/page.tsx',
];

adminPages.forEach((pagePath) => {
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    assert(
      pageContent.includes('adm-header-title') || pageContent.includes('adm-card-title'),
      `In-page heading verified in ${pagePath}`
    );
  }
});

console.log('\n================================================================');
console.log(`HEADER & UI AUDIT: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);

