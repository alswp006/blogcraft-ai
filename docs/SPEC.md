# SPEC

## Common Principles

- **Auth & ownership**
  - All user data is scoped to authenticated users via `userId` columns.
  - Every API endpoint requires authentication unless stated otherwise. If unauthenticated, respond with **401**.
  - Authorization checks enforce that users can only access and modify their own resources; if a resource belongs to another user, respond with **403**.
  
- **IDs and timestamps**
  - Use `TEXT` UUID strings (`crypto.randomUUID()`) as primary keys.
  - Store timestamps as integer milliseconds since epoch in DB; in API responses, return ISO 8601 strings.

- **Validation & error handling**
  - Input validation errors respond with **400** and a JSON body `{ error: { code: string; message: string; fieldErrors?: Record<string, string> } }`.
  - Ownership violations respond with **403**.
  - Resource not found is **404** after passing auth check.
  - Limit violations (e.g. >20 photos per post) respond with **409**.
  - Payload too large responds with **413**, unsupported media type with **415**.
  - Unexpected server errors respond with **500**.

- **Pagination**
  - List endpoints return all user data (no pagination needed in MVP).

- **File handling**
  - Uploaded files stored under server filesystem `./data/uploads`.
  - Supported photo mime types: `image/jpeg`, `image/png`, `image/webp`.

## Data Models

> Note: `users` and `sessions` tables exist in the template and are not defined here.

### Category  
- **Table:** `categories`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `name` TEXT NOT NULL (1–50 chars)  
  - `description` TEXT NULL  
  - `createdAt` INTEGER NOT NULL  
  - `updatedAt` INTEGER NOT NULL  
- **Constraints:**  
  - Unique per user: (`userId`, `name`)

### MonetizationTip  
- **Table:** `monetization_tips`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `categoryId` TEXT NOT NULL REFERENCES `categories`(`id`) ON DELETE CASCADE  
  - `recommendedMethod` TEXT NOT NULL (1–60 chars)  
  - `tipText` TEXT NOT NULL (1–500 chars)  
  - `createdAt` INTEGER NOT NULL  
  - `updatedAt` INTEGER NOT NULL  
- **Constraints:**  
  - Unique per user: (`userId`, `categoryId`)

### LearningSample  
- **Table:** `learning_samples`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `categoryId` TEXT NOT NULL REFERENCES `categories`(`id`) ON DELETE CASCADE  
  - `sourceType` TEXT NOT NULL CHECK (`sourceType` IN ('url', 'file'))  
  - `sourceUrl` TEXT NULL  
  - `fileName` TEXT NULL  
  - `rawText` TEXT NOT NULL (200–200000 chars)  
  - `createdAt` INTEGER NOT NULL  
- **Constraints:**  
  - If `sourceType='url'` then `sourceUrl` must be non-null  
  - If `sourceType='file'` then `fileName` must be non-null

### StyleProfile  
- **Table:** `style_profiles`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `categoryId` TEXT NOT NULL REFERENCES `categories`(`id`) ON DELETE CASCADE  
  - `profileJson` TEXT NOT NULL (JSON string)  
  - `sampleCount` INTEGER NOT NULL (≥0)  
  - `createdAt` INTEGER NOT NULL  
  - `updatedAt` INTEGER NOT NULL  
- **Constraints:**  
  - Unique per user: (`userId`, `categoryId`)

### Post  
- **Table:** `posts`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `categoryId` TEXT NOT NULL REFERENCES `categories`(`id`)  
  - `locationName` TEXT NOT NULL (1–80 chars)  
  - `overallNote` TEXT NOT NULL (1–5000 chars)  
  - `title` TEXT NOT NULL DEFAULT ''  
  - `contentMarkdown` TEXT NOT NULL DEFAULT ''  
  - `status` TEXT NOT NULL CHECK (`status` IN ('draft', 'generated', 'exported'))  
  - `createdAt` INTEGER NOT NULL  
  - `updatedAt` INTEGER NOT NULL  

### Photo  
- **Table:** `photos`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `originalFileName` TEXT NOT NULL  
  - `storedFilePath` TEXT NOT NULL  
  - `memo` TEXT NOT NULL (1–500 chars)  
  - `sortOrder` INTEGER NOT NULL  
  - `createdAt` INTEGER NOT NULL  
- **Constraints:**  
  - Max 20 photos per post  
  - `sortOrder` unique per (`postId`, `sortOrder`)

### CrawlSource  
- **Table:** `crawl_sources`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `provider` TEXT NOT NULL CHECK (`provider` IN ('naver', 'kakao', 'google', 'blog'))  
  - `sourceUrl` TEXT NULL  
  - `snippetText` TEXT NOT NULL (20–2000 chars)  
  - `rating` REAL NULL (0–5 if non-null)  
  - `createdAt` INTEGER NOT NULL  

### CrawlSummary  
- **Table:** `crawl_summaries`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `totalCount` INTEGER NOT NULL (0–17)  
  - `averageRating` REAL NULL  
  - `summaryText` TEXT NOT NULL  
  - `createdAt` INTEGER NOT NULL  
- **Constraints:**  
  - Unique per user per post: (`userId`, `postId`)

### PostVersion  
- **Table:** `post_versions`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `versionNumber` INTEGER NOT NULL (starting at 1, increments by 1)  
  - `promptNote` TEXT NOT NULL DEFAULT ''  
  - `title` TEXT NOT NULL (1–120 chars)  
  - `contentMarkdown` TEXT NOT NULL (200–200000 chars)  
  - `createdAt` INTEGER NOT NULL  
- **Constraints:**  
  - Unique (`postId`, `versionNumber`)

### PlagiarismCheck  
- **Table:** `plagiarism_checks`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `versionId` TEXT NOT NULL REFERENCES `post_versions`(`id`)  
  - `similarityScore` INTEGER NOT NULL (0–100)  
  - `comparedSourceIds` TEXT NOT NULL (JSON array of CrawlSource IDs)  
  - `passed` BOOLEAN NOT NULL  
  - `createdAt` INTEGER NOT NULL  

### SeoAnalysis  
- **Table:** `seo_analyses`  
- **Columns:**  
  - `id` TEXT PRIMARY KEY  
  - `userId` TEXT NOT NULL REFERENCES `users`(`id`)  
  - `postId` TEXT NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE  
  - `versionId` TEXT NOT NULL REFERENCES `post_versions`(`id`)  
  - `keywordDensityScore` INTEGER NOT NULL (0–100)  
  - `titleOptimizationScore` INTEGER NOT NULL (0–100)  
  - `metaDescriptionScore` INTEGER NOT NULL (0–100)  
  - `readabilityScore` INTEGER NOT NULL (0–100)  
  - `internalLinksScore` INTEGER NOT NULL (0–100)  
  - `overallScore` INTEGER NOT NULL (0–100)  
  - `suggestions` TEXT NOT NULL (JSON array of strings)  
  - `createdAt` INTEGER NOT NULL  

---

## Feature List

### F1. Category and Learning Sample Management  
- Description: Users can create categories to organize their blogs and upload at least five sample learning materials via URL or file. These samples are used to train a style profile representing the category’s unique writing style.  
- Data: `categories`, `learning_samples`, `style_profiles`  
- API:  
  - POST /api/categories  
    - Request: `{ name: string; description?: string }`  
    - Response: `{ id: string; name: string; description?: string; createdAt: string; updatedAt: string }`  
    - Errors: 400 (validation), 401, 409 (name duplicate)  
  - POST /api/categories/{categoryId}/learning-samples  
    - Request: `{ sourceType: 'url' | 'file'; sourceUrl?: string; file?: File; rawText: string }` (multipart/form-data for file)  
    - Response: `{ id: string; sourceType: string; sourceUrl?: string; fileName?: string; rawText: string; createdAt: string }`  
    - Errors: 400 (validation), 401, 403, 409 (max samples?), 415, 413  
  - GET /api/categories/{categoryId}/style-profile  
    - Response: `{ profileJson: string; sampleCount: number; createdAt: string; updatedAt: string }` | 404 if none  
    - Errors: 401, 403  

- Requirements:  
  - AC-1: Given authenticated user, when POST creating a category with valid name, then respond 201 with category data including createdAt and updatedAt  
  - AC-2: Given authenticated user, when adding a learning sample with sourceType 'url' and valid URL and rawText length ≥ 200, then create sample with correct fields and respond 201  
  - AC-3: Given authenticated user, when adding a learning sample with sourceType 'file' and uploading supported image file and rawText length ≥ 200, then save file, store fileName in DB, and respond 201  
  - AC-4: Given authenticated user, when retrieving style profile and profile exists, then respond 200 with profile JSON and sampleCount ≥ 5  
  - AC-5: Given learning sample request with invalid rawText length (<200), when submitting, then respond 400 with fieldErrors specifying rawText length  
  - AC-6: Given unauthenticated user, when accessing any category or learning sample endpoint, then respond 401  
  - AC-7: Given authenticated user requesting/modifying a category or learning sample belonging to another user, then respond 403  
  - AC-8: Given user attempts to add learning sample beyond system limits (e.g., >50 samples), then respond 409  

### F2. Photo Upload and Sorting for Posts  
- Description: Users can upload up to 20 photos per post, each requiring a memo. Users can reorder photos via drag-and-drop which sets their sortOrder.  
- Data: `photos`, `posts`  
- API:  
  - POST /api/posts/{postId}/photos  
    - Request: multipart/form-data with file (jpeg/png/webp), memo (string)  
    - Response: `{ id: string; originalFileName: string; storedFilePath: string; memo: string; sortOrder: number; createdAt: string }`  
    - Errors: 400, 401, 403, 409 (>20 photos), 415, 413  
  - PATCH /api/posts/{postId}/photos/order  
    - Request: `{ orderedPhotoIds: string[] }`  
    - Response: `{ success: true }`  
    - Errors: 400, 401, 403  

- Requirements:  
  - AC-1: Given authenticated user with a post and less than 20 photos, when POST uploading a supported photo with non-empty memo, then respond 201 with photo data including sortOrder = last + 1  
  - AC-2: Given authenticated user reordering photos with valid array containing all existing photo IDs for the post, when PATCH ordering, then update all photos’ sortOrder to match array index, respond 200  
  - AC-3: Given a photo upload exceeding 20 photos per post, when uploading, then respond 409 with error code `photo_limit_exceeded`  
  - AC-4: Given photo upload with missing or empty memo, when submitting, then respond 400 with fieldErrors for memo  
  - AC-5: Given unsupported file type (e.g., .gif), when uploading photo, then respond 415  
  - AC-6: Given unauthenticated user accessing photo endpoints, then respond 401  
  - AC-7: Given authenticated user accessing photos for another user’s post, then respond 403  

### F3. Post Creation and Draft Management  
- Description: Users create posts selecting a category, entering locationName and overallNote. Posts start as drafts before generating content.  
- Data: `posts`, `categories`  
- API:  
  - POST /api/posts  
    - Request: `{ categoryId: string; locationName: string; overallNote: string }`  
    - Response: `{ id: string; categoryId: string; locationName: string; overallNote: string; title: string; contentMarkdown: string; status: 'draft'; createdAt: string; updatedAt: string }`  
    - Errors: 400, 401, 403  
  - GET /api/posts/{postId}  
    - Response: full post data with photos (sorted), crawlSummary, latest postVersion if any  
    - Errors: 401, 403, 404  

- Requirements:  
  - AC-1: Given authenticated user, when creating post with valid categoryId owned by user, locationName (1–80 chars), and overallNote (1–5000 chars), then create post with status 'draft' and respond 201  
  - AC-2: Given authenticated user, when retrieving own post by ID, then respond 200 with full post details and related photos sorted by sortOrder ascending  
  - AC-3: Given invalid locationName (empty or >80 chars), when creating post, then respond 400 with fieldErrors for locationName  
  - AC-4: Given unauthenticated user accessing post endpoints, then respond 401  
  - AC-5: Given authenticated user accessing another user’s post, then respond 403  
  - AC-6: Given request for a non-existent post ID, then respond 404  

### F4. Multi-source Crawling and Summary Generation  
- Description: After post creation with locationName, users trigger limited crawl requests to Naver, Kakao, Google (up to 5 each) + blog (2), total max 17 sources to collect snippets and ratings, then an aggregated summary with average rating is generated and saved.  
- Data: `crawl_sources`, `crawl_summaries`  
- API:  
  - POST /api/posts/{postId}/crawl  
    - Request: _none_  
    - Response: `{ summaryId: string; totalCount: number; averageRating: number | null; summaryText: string; createdAt: string }`  
    - Errors: 400, 401, 403  
  - GET /api/posts/{postId}/crawl-sources  
    - Response: list of crawl sources for the post  
    - Errors: 401, 403  

- Requirements:  
  - AC-1: Given authenticated user and existing post, when POST crawl is triggered, then create up to max 17 crawl sources (5 Naver, 5 Kakao, 5 Google, 2 blog) with relevant snippetText and ratings, and a crawl summary aggregating totalCount and averageRating, respond 200 with summary  
  - AC-2: Given unauthenticated request to crawl post, then respond 401  
  - AC-3: Given another user’s post ID on crawl attempt, then respond 403  
  - AC-4: Given post without a locationName, when triggering crawl, then respond 400 with error message "locationName required for crawl"  
  - AC-5: Given crawl request while a crawl is ongoing, then respond 409 with code `crawl_in_progress`  

### F5. Style Profile Creation and Application  
- Description: Based on learning samples per category, the system generates a style profile JSON object capturing writing style metrics, saved per category, used later in content generation.  
- Data: `style_profiles`, `learning_samples`  
- API:  
  - POST /api/categories/{categoryId}/style-profile/generate  
    - Request: _none_  
    - Response: `{ profileJson: string; sampleCount: number; createdAt: string; updatedAt: string }`  
    - Errors: 400, 401, 403, 409 (if insufficient samples)  
  - GET /api/categories/{categoryId}/style-profile  
    - See F1  

- Requirements:  
  - AC-1: Given authenticated user and category with ≥5 learning samples, when POST generate style profile, then create or overwrite style_profiles entry and respond 200 with profileJson and sampleCount  
  - AC-2: Given category with <5 learning samples, when generating style profile, then respond 409 with error code `insufficient_samples` and message  
  - AC-3: Given unauthenticated user attempting style profile generation, then respond 401  
  - AC-4: Given user accessing another user’s category style profile, then respond 403  

### F6. AI-based Post Generation with Plagiarism and SEO Analysis  
- Description: Based on user inputs, photos, crawl summary, and style profile, AI generates the post content and title with the user’s style. Then plagiarism is checked against crawl sources; if similarity above threshold (e.g., ≥70), generation is rejected and user notified. SEO analysis evaluates 5 metrics and provides numeric scores plus textual suggestions. One or more post versions are saved for history.  
- Data: `post_versions`, `plagiarism_checks`, `seo_analyses`, `posts`  
- API:  
  - POST /api/posts/{postId}/generate  
    - Request: `{ promptNote?: string }`  
    - Response: `{ versionId: string; title: string; contentMarkdown: string; plagiarismPassed: boolean; plagiarismScore: number; seoScores: { keywordDensity: number; titleOptimization: number; metaDescription: number; readability: number; internalLinks: number; overall: number }; seoSuggestions: string[]; createdAt: string }`  
    - Errors: 400, 401, 403, 409 (plagiarism fail)  
  - POST /api/posts/{postId}/regenerate  
    - Same shape as generate, with new promptNote appended to previous  

- Requirements:  
  - AC-1: Given authenticated user and post with complete inputs, when POST generate, then create a postVersion with versionNumber incremented by 1, respond 200 with title, Markdown content, plagiarism result, and SEO scores/suggestions  
  - AC-2: Given plagiarism similarityScore ≥ 70, when generating post, then respond 409 with error `plagiarism_threshold_exceeded` and do not save postVersion  
  - AC-3: Given unauthenticated user calls generate, then respond 401  
  - AC-4: Given user attempts to generate for another user’s post, then respond 403  
  - AC-5: Given invalid promptNote exceeding 500 chars, when submitting generate request, then respond 400 with fieldErrors for promptNote  

### F7. Export Post Content and Photo ZIP Download  
- Description: After post is generated and finalized (status updated to 'exported'), user can download Markdown content file and a ZIP archive containing photos renamed with zero-padded prefix reflecting sortOrder (e.g., `01_filename.jpg`).  
- Data: `posts`, `post_versions`, `photos`  
- API:  
  - GET /api/posts/{postId}/export/markdown  
    - Response: markdown file with appropriate headers for download  
    - Errors: 401, 403, 404 (if no generated content)  
  - GET /api/posts/{postId}/export/photos-zip  
    - Response: ZIP file with photos renamed by `sortOrder` and underscore prefix (e.g., `01_memo.jpg`)  
    - Errors: 401, 403, 404 (if no photos)  

- Requirements:  
  - AC-1: Given authenticated user and post with `status='generated'` or `'exported'`, when downloading Markdown, then respond 200 with correct file named `{locationName}.md` containing latest postVersion contentMarkdown  
  - AC-2: Given authenticated user and post with photos, when downloading photo ZIP, then respond 200 with ZIP containing all photos named like `01_filename.ext`, sorted by sortOrder ascending  
  - AC-3: Given unauthenticated user accessing exports, then respond 401  
  - AC-4: Given user accessing another user’s post export, then respond 403  
  - AC-5: Given post without generated content or photos, when requesting exports, then respond 404  

### F8. Monetization Tip Management  
- Description: Users can add or edit monetization tips per category describing recommended monetization methods and short tip texts shown under posts to guide revenue growth.  
- Data: `monetization_tips`  
- API:  
  - POST /api/categories/{categoryId}/monetization-tip  
    - Request: `{ recommendedMethod: string; tipText: string }`  
    - Response: MonetizationTip object  
    - Errors: 400, 401, 403, 409 (one tip per category)  
  - GET /api/categories/{categoryId}/monetization-tip  
    - Response: MonetizationTip or 404 if none  
    - Errors: 401, 403  

- Requirements:  
  - AC-1: Given authenticated user and category, when posting valid monetization tip, then save or update the tip and respond 200  
  - AC-2: Given invalid recommendedMethod or tipText (outside length limits), when submitting, then respond 400 with fieldErrors