# TASK
## Epic 1. Data Layer

### Task 1.1 Create DB schema for app tables
- Description:  
  Create an app schema initializer that creates all SPEC tables (`categories`, `monetization_tips`, `learning_samples`, `style_profiles`, `posts`, `photos`, `crawl_sources`, `crawl_summaries`, `post_versions`, `plagiarism_checks`, `seo_analyses`) with constraints and indexes, and wire it into the existing DB init so it runs on startup.
- DoD:
  - [ ] On app start, the DB contains all new tables with the specified columns and constraints (FKs, UNIQUEs, CHECKs).
  - [ ] Unique constraints exist for: (`categories.userId`,`categories.name`), (`monetization_tips.userId`,`monetization_tips.categoryId`), (`style_profiles.userId`,`style_profiles.categoryId`), (`crawl_summaries.userId`,`crawl_summaries.postId`), (`post_versions.postId`,`post_versions.versionNumber`), (`photos.postId`,`photos.sortOrder`).
  - [ ] The app builds successfully (`next build`).
- Covers: [F1-AC1, F2-AC1, F3-AC1, F4-AC1, F5-AC1, F6-AC1, F7-AC1, F8-AC1]
- Files: [src/lib/db/appSchema.ts, src/lib/db.ts]
- Depends on: [none]

### Task 1.2 Add shared time + API error helpers
- Description:  
  Add utilities to convert DB millisecond timestamps to ISO strings, and a helper to build SPEC-compliant JSON error responses for API routes.
- DoD:
  - [ ] `msToIso(ms)` returns an ISO 8601 string.
  - [ ] `isoNowMs()` returns `Date.now()`-style milliseconds.
  - [ ] `apiError(status, {code,message,fieldErrors?})` produces `{ error: { code, message, fieldErrors? } }` JSON with the given status.
  - [ ] The app builds successfully.
- Covers: [F1-AC5, F2-AC4, F3-AC3, F5-AC2, F6-AC5]
- Files: [src/lib/time.ts, src/lib/api/errors.ts]
- Depends on: [Task 1.1]

### Task 1.3 Add validation helpers (lengths, enums, URL)
- Description:  
  Implement small reusable validation helpers for string length checks, URL validation, and enum membership to support consistent 400 responses.
- DoD:
  - [ ] `validateStringLen(value, {min,max})` returns a string error message or `null`.
  - [ ] `isValidHttpUrl(value)` returns `true` only for `http:`/`https:` URLs.
  - [ ] `oneOf(value, allowed)` returns boolean for allowed literal strings.
  - [ ] The app builds successfully.
- Covers: [F1-AC1, F1-AC2, F3-AC1, F6-AC5, F8-AC2]
- Files: [src/lib/validation.ts]
- Depends on: [Task 1.2]

### Task 1.4 Create Category model
- Description:  
  Add a `categories` model with functions to create, fetch by id (scoped), and list by user for server-side pages.
- DoD:
  - [ ] `createCategory(userId, {name, description})` inserts and returns the row with ms timestamps.
  - [ ] `getCategoryById(categoryId)` returns row including `userId` for ownership checks.
  - [ ] `listCategoriesByUser(userId)` returns categories sorted by `updatedAt DESC`.
  - [ ] The app builds successfully.
- Covers: [F1-AC1, F1-AC7]
- Files: [src/lib/models/category.ts]
- Depends on: [Task 1.1]

### Task 1.5 Create LearningSample + StyleProfile models
- Description:  
  Add `learning_samples` and `style_profiles` models for insert, count, list, get, and upsert profile by category+user.
- DoD:
  - [ ] `createLearningSample(...)` inserts a sample and returns the row.
  - [ ] `countLearningSamplesForCategory(userId, categoryId)` returns integer count.
  - [ ] `getStyleProfile(userId, categoryId)` returns profile row or `null`.
  - [ ] `upsertStyleProfile(userId, categoryId, {profileJson, sampleCount})` creates or overwrites.
  - [ ] The app builds successfully.
- Covers: [F1-AC2, F1-AC3, F1-AC4, F5-AC1]
- Files: [src/lib/models/learningSample.ts, src/lib/models/styleProfile.ts]
- Depends on: [Task 1.1]

### Task 1.6 Create Post + Photo models
- Description:  
  Add `posts` and `photos` models: create post, get post, list posts by user, list photos by post sorted, insert photo with next sortOrder, and bulk update photo order.
- DoD:
  - [ ] `createPost(userId, {categoryId, locationName, overallNote})` inserts with status `draft`.
  - [ ] `getPostById(postId)` returns row including `userId`.
  - [ ] `listPhotosByPost(userId, postId)` returns photos sorted by `sortOrder ASC`.
  - [ ] `addPhotoWithNextSortOrder(...)` assigns `sortOrder = max + 1` (or 1 if none).
  - [ ] The app builds successfully.
- Covers: [F2-AC1, F2-AC2, F3-AC1, F3-AC2]
- Files: [src/lib/models/post.ts, src/lib/models/photo.ts]
- Depends on: [Task 1.1]

### Task 1.7 Create CrawlSource + CrawlSummary models
- Description:  
  Add models for inserting crawl sources, listing by post, inserting/upserting a crawl summary, and fetching summary by post.
- DoD:
  - [ ] `insertCrawlSources(userId, postId, sources[])` inserts all sources.
  - [ ] `listCrawlSources(userId, postId)` returns sources sorted by `createdAt ASC`.
  - [ ] `upsertCrawlSummary(userId, postId, {...})` creates or overwrites summary.
  - [ ] The app builds successfully.
- Covers: [F4-AC1]
- Files: [src/lib/models/crawlSource.ts, src/lib/models/crawlSummary.ts]
- Depends on: [Task 1.1]

### Task 1.8 Create PostVersion + PlagiarismCheck + SeoAnalysis models
- Description:  
  Add models to create a post version with incrementing versionNumber, and insert plagiarism + SEO analysis records linked to the version.
- DoD:
  - [ ] `createPostVersionNext(userId, postId, {promptNote,title,contentMarkdown})` sets `versionNumber` to `(max+1)` starting at 1.
  - [ ] `getLatestPostVersion(userId, postId)` returns latest or `null`.
  - [ ] `createPlagiarismCheck(...)` inserts with JSON `comparedSourceIds`.
  - [ ] `createSeoAnalysis(...)` inserts with JSON `suggestions`.
  - [ ] The app builds successfully.
- Covers: [F6-AC1, F6-AC2, F7-AC1]
- Files: [src/lib/models/postVersion.ts, src/lib/models/plagiarismCheck.ts, src/lib/models/seoAnalysis.ts]
- Depends on: [Task 1.1]

### Task 1.9 Create MonetizationTip model
- Description:  
  Add model to get and upsert monetization tip per (userId, categoryId).
- DoD:
  - [ ] `getMonetizationTip(userId, categoryId)` returns tip or `null`.
  - [ ] `upsertMonetizationTip(userId, categoryId, {recommendedMethod, tipText})` creates or updates.
  - [ ] Enforces uniqueness at DB level (from schema) without crashing the app build.
  - [ ] The app builds successfully.
- Covers: [F8-AC1, F8-AC2]
- Files: [src/lib/models/monetizationTip.ts]
- Depends on: [Task 1.1]

### Task 1.10 Add upload storage utilities
- Description:  
  Implement server-side helpers to (1) ensure `./data/uploads` exists, (2) persist uploaded files to disk with UUID names, and (3) validate supported image mime types.
- DoD:
  - [ ] `ensureUploadsDir()` creates `data/uploads` if missing.
  - [ ] `saveUploadedFile(file, subdir)` writes to `data/uploads/{subdir}/...` and returns `{ storedFilePath, originalFileName }`.
  - [ ] `isSupportedImageMime(mime)` returns true only for `image/jpeg`, `image/png`, `image/webp`.
  - [ ] The app builds successfully.
- Covers: [F1-AC3, F2-AC1, F2-AC5]
- Files: [src/lib/uploads/storage.ts]
- Depends on: [Task 1.2]

---

## Epic 2. API Routes

### Task 2.1 POST /api/categories
- Description:  
  Implement category creation endpoint with validation, per-user unique name handling, and SPEC error shapes.
- DoD:
  - [ ] Unauthenticated request returns 401.
  - [ ] Valid