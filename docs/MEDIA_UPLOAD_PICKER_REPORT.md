# Media Pipeline, Upload & Gallery Picker Report

**Date:** October 30, 2026  
**Subsystems:** Media Service (`src/lib/media-service.ts`), Upload API (`src/app/api/upload/route.ts`), Media Library Modal (`src/components/admin/media-picker-modal.tsx`), Gallery Admin (`src/app/admin/gallery/page.tsx`), Media TV Logos Admin (`src/app/admin/media-partners/page.tsx`)  

---

## 1. Upload API Upgrade (`/api/upload`)

The upload route was completely overhauled from a single-file handler into a high-capacity, multi-format upload pipeline:

### Key Capabilities:
1. **Single & Multiple File Uploads:** Supports `formData.getAll('files')` and `formData.getAll('file')`. Admins can upload 1 to 20+ images in a single HTTP request.
2. **File Size Capacity:** Increased limit to 25MB per file to accommodate high-resolution event photography and print comp cards.
3. **Magic Byte Signature Inspection:** Validates binary headers to verify authenticity (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WebP: `RIFF...WEBP`, GIF: `GIF87a/89a`, SVG: clean XML without scripts). Rejects disguised `.php`, `.sh`, `.exe`, or executable payloads.
4. **Cryptographic SHA-256 Deduplication:** Computes hash of every incoming buffer. If an identical file already exists in the media manifest or MySQL, the system reuses the existing URL without saving duplicate bytes on disk.
5. **Backward Compatibility:** Single file uploads continue to return `{ success: true, url, asset, isDuplicate, message }`, while multi-file uploads return `{ success: true, files: [...], count, message }`.

---

## 2. Photo Gallery Picker Resolution (`/admin/gallery`)

### Root Causes of Previous Issue:
1. **Event Bubbling & Modal Nesting:** `MediaPickerModal` was nested inside the add/edit form modal. When closing or clicking outside the picker, click events bubbled up to `.adm-modal-backdrop`, unexpectedly closing the entire editing form.
2. **Single-File Restriction:** Adding multiple awards photos required opening the modal repeatedly for every single picture.
3. **Double-Click Inconvenience:** Selecting an asset required scrolling down to click "Use This Asset" instead of direct selection.

### Fixes Implemented:
1. **Decoupled Picker Stacking:** `MediaPickerModal` is now positioned at the root level of `AdminGalleryPage` with `z-index: 9999` and explicit `e.stopPropagation()` handlers on backdrop and dialog surfaces.
2. **Double-Click Instant Selection:** Double-clicking any thumbnail in `MediaPickerModal` immediately selects the asset and closes the modal.
3. **Batch Multi-Photo Upload:** Added an "Upload Multiple Photos" button on the main gallery page. Administrators can select 5, 10, or 20 photos at once, upload them in one batch, and have gallery records auto-created with clean formatted titles.
4. **Immediate Form Preview:** Selecting an asset updates `formData.src` instantaneously with a 90x90 live thumbnail.

---

## 3. Media TV Logos Admin Redesign (`/admin/media-partners`)

### Old Problematic UX:
The previous implementation forced administrators through a 4-field manual form:
1. *Logo Path / URL* (required manual typing or pasting)
2. *Company / Channel Name (English)* (required manual typing)
3. *Bengali Name* (required manual typing)
4. *Website Link* (required manual typing)

### New Modern Image-First Design:
All 4 manual text inputs were eliminated. The interface now provides:
1. **Drag-and-Drop / Multi-File Upload Zone:** Direct upload for single or multiple SVG/PNG logos. Broadcaster records are generated automatically.
2. **Auto-Derived Titles:** Automatically title-cases filenames (e.g. `channel-i.svg` -> `Channel I`, `deepto-tv.svg` -> `Deepto Tv`).
3. **"Choose from Media Library" Integration:** Quick selection from existing logo assets in the persistent media library.
4. **Interactive Logo Manager:**
   - Visual containment cards with dark background and drop shadows.
   - One-click "Replace Logo" button.
   - Reorder arrows (Move Left / Move Right) with immediate persistence.
   - Delete button with confirmation.
   - Optional inline label rename (no modal required).

---

## 4. Test Verification Results

```
=== STARTING SUITE OF VERIFICATION TESTS ===

Test 1: Magic Byte Signature Validation
  JPEG validation: PASS
  PNG validation: PASS
  Malicious file rejection: PASS

Test 2: Cryptographic SHA-256 Deduplication
  First upload created asset: med-1793362171748-r1tupw | isDuplicate: PASS
  Second identical upload deduplicated: PASS
  Reused URL match: PASS

=== ALL UNIT CHECKS PASSED ===
```
