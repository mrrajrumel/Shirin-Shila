# Awards & Honours Data Integrity: Bug Analysis & Root-Cause Remediation

**Target System:** Shirin Shila Actor Portfolio (`https://shirinshila.com/`)  
**Component:** Career Journey & Awards Milestone Timeline (`/admin/timeline`, `/#timeline`, `src/app/api/timeline/route.ts`)  
**Defect Classification:** Critical Data Integrity Defect (Resurrection of Deleted Records)  
**Remediation Status:** Verified Resolved  

---

## 1. Executive Summary

A critical data-integrity issue previously caused deleted awards or honours to remain visible or reappear upon subsequent page reloads, browser cache invalidations, or application restarts. Treating this as an architectural defect rather than a superficial UI issue, a full trace from the Admin Panel through MySQL/filesystem persistence to the public frontend was conducted. 

The investigation uncovered **three distinct root-cause failure modes** that caused deleted items to resurrect. All three have been surgically repaired with persistent exclusion tracking (`deletedIds`), store read status guards, and milestone separation.

---

## 2. Root Cause Analysis (Three Failure Modes)

### Failure Mode 1: Static Fallback Triggered on Legitimate Empty Store
* **Location:** `src/app/page.tsx`
* **Mechanism:** The server component previously executed:
  ```typescript
  const timeline = await readStore<TimelineStoreData>("timeline").catch(() => defaultTimeline);
  const timelineTopData = (timeline.top && timeline.top.length > 0) ? timeline.top : defaultTopJourneyData;
  ```
* **Failure:** When an administrator deleted all awards or deleted specific awards, leaving an array empty, the `timeline.top.length > 0` condition evaluated to `false`. Instead of respecting the deliberate deletions, the application silently fell back to `defaultTopJourneyData` (the hardcoded seed data in source code), resurrecting the default awards.

### Failure Mode 2: Client Component Seed Resuscitation via Missing Store Confirmation Flag
* **Location:** `src/components/career-journey-timeline.tsx` and `src/app/api/timeline/route.ts`
* **Mechanism:** On the client-side interactive timeline view, the component re-fetched `/api/timeline`. If the network response returned an empty array or failed to explicitly declare whether the store was loaded, the client hook interpreted this as a fetch error and reset state to the initial props (which contained the seed data).
* **Failure:** Optimistic deletions in the Admin Panel appeared successful initially, but upon page reload or client re-fetch, the items were injected back into the DOM by the client component's defensive fallback logic.

### Failure Mode 3: Milestones Array Cross-Contamination
* **Location:** `src/app/api/timeline/route.ts`
* **Mechanism:** The timeline store maintained three collections: `top`, `bottom`, and `milestones`. When an award was deleted from the visual alternating track (`top`/`bottom`), its matching title entry in `milestones` remained intact.
* **Failure:** Any component or automated sync (such as accolades sync) querying `milestones` re-extracted the "deleted" award title and propagated it back to other views.

---

## 3. Implemented Root-Cause Fix

### A. Permanent Exclusion Tracking (`deletedIds`)
* In `src/lib/server-storage.ts`, the `TimelineStoreData` schema was extended to include:
  ```typescript
  export interface TimelineStoreData {
    top: JourneyItem[];
    bottom: JourneyItem[];
    milestones?: any[];
    items?: JourneyItem[];
    deletedIds?: string[];
  }
  ```
* Both the MySQL database storage adapter (`cms_content` table) and the JSON fallback storage adapter (`src/data/store/timeline.json` and `/home/u473489494/shirin_shila_persistent_data/store/timeline.json`) now persistently maintain an array of `deletedIds`.
* Whenever `readStore('timeline')` is executed, items whose IDs match any entry in `deletedIds` are filtered out at the authoritative storage layer before reaching any caller.

### B. Store Read Status Guard (`timelineLoadedFromStore`)
* In `src/app/page.tsx`, the store loading logic was updated to distinguish between:
  1. A storage failure (e.g., database connection timeout), and
  2. A successful storage read that legitimately contains an empty or reduced item set.
  ```typescript
  let timelineLoadedFromStore = false;
  const timeline = await readStore<TimelineStoreData>("timeline")
    .then((data) => { timelineLoadedFromStore = true; return data; })
    .catch(() => ({
      top: defaultTopJourneyData,
      bottom: defaultBottomJourneyData,
      milestones: careerTimeline,
      deletedIds: [] as string[],
    }));

  const deletedIds = new Set(Array.isArray(timeline.deletedIds) ? timeline.deletedIds : []);
  const timelineTopData = timelineLoadedFromStore
    ? (timeline.top || []).filter((it) => !deletedIds.has(it.id))
    : defaultTopJourneyData.filter((it) => !deletedIds.has(it.id));
  const timelineBottomData = timelineLoadedFromStore
    ? (timeline.bottom || []).filter((it) => !deletedIds.has(it.id))
    : defaultBottomJourneyData.filter((it) => !deletedIds.has(it.id));
  ```

### C. Comprehensive Server-Side Deletion Handler
* In `src/app/api/timeline/route.ts` (`DELETE` method):
  1. Validates the incoming target `id`.
  2. Filters the item out of `store.top` and `store.bottom`.
  3. Records `id` permanently in `store.deletedIds`.
  4. Purges any matching item by ID or title from `store.milestones` and `store.items`.
  5. Commits the updated state to persistent storage (`writeStore('timeline', store)`).
  6. Revalidates Next.js cache tags and paths: `/`, `/#timeline`, `/admin/timeline`, `/admin/pages`.
  7. Returns `success: true` with the updated collections and `deletedIds` array.

### D. Milestone Separation & Auto-Sync Safety
* Standalone page accolades synchronization now queries only active, non-deleted timeline items.
* If an administrator explicitly re-creates an item with the same identifier, the `POST` handler in `src/app/api/timeline/route.ts` automatically removes the ID from `deletedIds`, allowing legitimate re-addition without phantom conflicts.

---

## 4. Verification Methodology & Evidence

A controlled test procedure was performed to verify that deletions are permanent and resilient across reload cycles:

1. **Test Record Creation:**
   * Action: Submitted a temporary award record via `/api/timeline` (`POST`):
     - Title: `Controlled Audit Test Trophy 2026`
     - Organization: `Antigravity Verification Lab`
     - Year: `2026`
   * Verification: Confirmed present in `store.top`/`store.bottom` and rendered in the DOM.

2. **Deletion Execution:**
   * Action: Triggered `DELETE` request with the test item's identifier.
   * Verification: Server responded `200 OK` with `success: true` and the test ID present in `deletedIds`.

3. **Persistence Across Read Operations:**
   * Action: Sent a clean `GET /api/timeline` request with `Cache-Control: no-cache`.
   * Result: The test record was absent from `top`, `bottom`, and `milestones`; present in `deletedIds`.

4. **Public Homepage Verification:**
   * Action: Server-rendered `src/app/page.tsx`.
   * Result: The test item was completely absent. Existing legitimate awards (Babisas Best Actress Award, Meril-Prothom Alo Nominee, DIFF Trophy, National Star Excellence Crest) remained intact and untouched.

5. **Re-addition Verification:**
   * Action: Re-submitted the award.
   * Result: The ID was successfully removed from `deletedIds`, and the item was restored without residual deletion locks.

---

## 5. Summary of Files Modified for This Fix

| File | Purpose of Modification |
|---|---|
| `src/lib/server-storage.ts` | Added `deletedIds` and `items` to `TimelineStoreData` interface; filtered items by `deletedIds` on read |
| `src/app/api/timeline/route.ts` | Implemented permanent `deletedIds` tracking on `DELETE`, cleaned `milestones`, returned `deletedIds` on `GET`, updated `POST` to un-track |
| `src/app/page.tsx` | Added `timelineLoadedFromStore` guard; prevented false fallback to seed defaults on empty arrays |
| `src/components/career-journey-timeline.tsx` | Honored `loaded: true` and `deletedIds` from server API; prevented optimistic fallback to initial props |
