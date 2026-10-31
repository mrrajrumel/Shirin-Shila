import assert from 'assert';
import { readStore } from '../src/lib/server-storage';
import { getMediaManifest } from '../src/lib/media-service';
import { getAllAdminUsers, createSessionToken, verifySessionToken } from '../src/lib/auth';
import { ProjectItem } from '../src/data/filmography';
import { JourneyItem } from '../src/data/timeline';

console.log('================================================================');
console.log('STARTING ADMIN GLOBAL SEARCH & DATABASE INTEGRATION TESTS');
console.log('================================================================\n');

async function testSearchIntegrations() {
  // 1. Filmography / Works Search Verification
  const works = (await readStore<ProjectItem[]>('filmography')) || [];
  assert(Array.isArray(works), 'Works store must return an array');
  const matchedWork = works.find((w) => w.title.toLowerCase().includes('begum'));
  assert(matchedWork, 'Must find Begum Jaan in works');
  console.log('[PASS] Works Provider: Successfully found matching work record "' + matchedWork.title + '"');

  // 2. Timeline / Honors & Awards Search Verification
  const timelineStore: any = (await readStore('timeline')) || {};
  const rawTimeline: JourneyItem[] = [
    ...(Array.isArray(timelineStore.top) ? timelineStore.top : []),
    ...(Array.isArray(timelineStore.bottom) ? timelineStore.bottom : []),
  ];
  assert(rawTimeline.length > 0, 'Timeline must return records');
  const matchedTimeline = rawTimeline.find((t) => t.title && t.title.toLowerCase().includes('diff'));
  assert(matchedTimeline, 'Must find DIFF award in timeline');
  console.log('[PASS] Timeline Provider: Successfully found matching award record "' + matchedTimeline.title + '"');

  // 3. Media Library Search Verification
  const manifest = (await getMediaManifest()) || [];
  assert(Array.isArray(manifest), 'Media manifest must return an array');
  const matchedMedia = manifest.find((m) => m.filename.toLowerCase().includes('hero'));
  assert(matchedMedia, 'Must find hero photo in media manifest');
  console.log('[PASS] Media Provider: Successfully found matching media asset "' + matchedMedia.filename + '"');

  // 4. Users & Roles Provider Verification (Admin Only)
  const users = await getAllAdminUsers();
  assert(Array.isArray(users), 'Admin users provider must return an array');
  const shirin = users.find((u) => u.username.toLowerCase() === 'shirin');
  const rumel = users.find((u) => u.username.toLowerCase() === 'rumel');
  assert(shirin, 'Founder Shirin must be discoverable');
  assert(rumel, 'Manager Rumel must be discoverable');
  console.log('[PASS] Users Provider: Verified genuine user records Shirin and Rumel');

  // 5. Authentication Token Verification for Search Requests
  const testSession = createSessionToken({
    id: 'test-search-session',
    username: 'Rumel',
    role: 'manager',
    displayName: 'Raj Rumel',
  });
  const verifiedUser = verifySessionToken(testSession);
  assert(verifiedUser && verifiedUser.username === 'Rumel', 'Session token verification must succeed');
  console.log('[PASS] Auth Token Verification: Manager session token correctly verified for search authorization');

  console.log('\n================================================================');
  console.log('ADMIN GLOBAL SEARCH TESTS: 5 PASSED, 0 FAILED');
  console.log('================================================================\n');
}

testSearchIntegrations().catch((err) => {
  console.error('[FAIL] Admin search test error:', err);
  process.exit(1);
});

