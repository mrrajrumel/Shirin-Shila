# Deployment Safety & Data Preservation Policy

> **Scope:** Mandatory protocol for all developers, CI/CD pipelines, and autonomous AI agents modifying this repository.  
> **Target Production:** Hostinger Node.js Web Hosting (`cornflowerblue-wildcat-675604.hostingersite.com`)  
> **Core Mandate:** Code changes deployed via Git must **never** degrade, reset, or overwrite live CMS data or uploaded assets.

---

## 1. Core Policy Statement

1. **Production Data is Sovereign:** The live content in `/home/u473489494/shirin_shila_persistent_data/` is the single source of truth for the production website. It must never be overwritten by repository code.
2. **Backward-Compatible Schemas Only:** Any schema update must be additive. Renaming or removing fields without fallback defaults is strictly prohibited.
3. **Decoupled Assets:** Static branding assets (`public/images/`) belong to the git repository. All client-uploaded media (`uploads/`) belongs to persistent storage.

---

## 2. Rules for Modifying Data Models & `src/data/store/`

Files inside `src/data/store/*.json` are **seed templates only**. They are loaded only if the persistent store does not contain that file.

### Safe Schema Evolution Pattern (Adding New Fields)
When adding new fields to a section (e.g. adding `instagramHandle` to `about.json`):
1. **Never Assume Field Exists:** Always provide a default fallback in the frontend component or reader:
   ```typescript
   // In component or data retrieval:
   const instagram = about.instagramHandle || "";
   ```
2. **Safe Deep Merge in API Handlers:** When saving partial or new fields, always merge against the existing live object:
   ```typescript
   const current = await readStore<AboutData>('about');
   const updated = {
     ...current,
     newField: body.newField !== undefined ? body.newField : (current.newField || defaultValue),
   };
   await writeStore('about', updated);
   ```
3. **No Destructive Re-Seeding:** Never commit code that wipes persistent files or forces re-initialization of live data from repo seeds.

---

## 3. Rules for Static Assets & Uploads

| Asset Type | Storage Location | Git Tracked? | Policy |
| :--- | :--- | :--- | :--- |
| **Brand Cutouts & Core Logos** | `public/images/` | **Yes** | Maintained in git. Never delete canonical files like `shirin-akter.png` or `og-image.jpg`. |
| **Client Uploads** | `persistent_data/uploads/` | **No** | Never check uploaded client files into Git. Managed dynamically via `/admin/media`. |
| **Media Manifest** | `persistent_data/store/media-manifest.json` | **No** | Auto-indexes assets and tracks SHA-256 hashes. |

---

## 4. Environment Variables Specification

The application runs safely even with zero custom environment variables, but the following are supported and recommended in production:

| Variable | Required? | Default Fallback | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Optional | `production` | Enables production optimizations |
| `PORT` | Optional | `3000` | Port assigned by Hostinger Passenger / Node manager |
| `HOSTNAME` | Optional | `0.0.0.0` | Bind address for incoming HTTP traffic |
| `ADMIN_SECRET` | Recommended | Auto-generated persistent secret | Secret key for signing HMAC session cookies |
| `DATA_STORE_DIR` | Optional | `/home/{user}/shirin_shila_persistent_data/store` | Custom path to JSON data store directory |
| `MEDIA_UPLOADS_DIR`| Optional | `/home/{user}/shirin_shila_persistent_data/uploads` | Custom path to user media uploads |
| `BACKUPS_DIR` | Optional | `/home/{user}/shirin_shila_persistent_data/backups` | Custom path to automated snapshots |

---

## 5. Developer Checklist: 9-Step Safe Update Workflow

Follow these steps before pushing any commit to GitHub:

### Before Pushing (Pre-Flight)
- [ ] **Step 1: Check Git Status & Changes**
  Verify that no sensitive files, credentials, or unexpected JSON overrides are staged:
  ```bash
  git status
  ```
- [ ] **Step 2: Run Typecheck**
  Ensure zero TypeScript compiler errors:
  ```bash
  npx tsc --noEmit
  ```
- [ ] **Step 3: Run Full Production Build**
  Ensure the Next.js bundle compiles and outputs static pages cleanly:
  ```bash
  npm run build
  ```
- [ ] **Step 4: Verify Asset References**
  Confirm that all `<Image>` and `<img>` tags point to valid routes (e.g. `/images/...` or `/uploads/...`) and have valid alt text.

### Deployment Execution
- [ ] **Step 5: Commit with Descriptive Message**
  ```bash
  git add <specific files>
  git commit -m "feat(section): description of safe update"
  ```
- [ ] **Step 6: Push to GitHub `main`**
  ```bash
  git push origin main
  ```

### After Deployment (Post-Flight Smoke Test)
- [ ] **Step 7: Check Hostinger Deployment Status**
  Verify the build completed with exit status 0.
- [ ] **Step 8: Perform Live Web Smoke Test**
  - Visit `https://cornflowerblue-wildcat-675604.hostingersite.com/`
  - Verify Hero cutout image (`/images/shirin-akter.png`) loads crisp.
  - Verify all 9 sections render (`#home`, `#about`, `#showreel`, `#filmography`, `#gallery`, `#timeline`, `#press`, `#contact`, `#broadcasters`).
  - Open DevTools console: confirm 0 runtime JavaScript errors.
- [ ] **Step 9: Verify Admin Authentication & Data Persistence**
  - Log in to `/admin`
  - Confirm all existing live content and projects remain intact.
  - Test saving a minor update and confirm immediate live reflection.

---

## 6. Rollback Procedures

If a newly deployed code change introduces a regression:

### Code Rollback
1. Revert the commit locally:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. Hostinger will automatically detect the push and deploy the previous stable commit.

### Data Rollback (If Needed)
Live data is not touched by code deployments. However, if an administrator made an unwanted edit:
1. Navigate to `/admin/backup`.
2. Select and upload the desired backup `.json` file to restore the data state.
3. Or restore directly from server-side rolling revisions in `/home/u473489494/shirin_shila_persistent_data/backups/`.

