import type Database from "better-sqlite3";

export function initAppSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      CONSTRAINT categories_name_len CHECK (length(name) BETWEEN 1 AND 50)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user_name ON categories(userId, name);
    CREATE INDEX IF NOT EXISTS idx_categories_user_updated ON categories(userId, updatedAt DESC);

    CREATE TABLE IF NOT EXISTS monetization_tips (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      recommendedMethod TEXT NOT NULL,
      tipText TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      CONSTRAINT monetization_recommended_len CHECK (length(recommendedMethod) BETWEEN 1 AND 60),
      CONSTRAINT monetization_tip_len CHECK (length(tipText) BETWEEN 1 AND 500)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_monetization_user_category ON monetization_tips(userId, categoryId);

    CREATE TABLE IF NOT EXISTS learning_samples (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      sourceType TEXT NOT NULL CHECK (sourceType IN ('url','file')),
      sourceUrl TEXT NULL,
      fileName TEXT NULL,
      rawText TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      CONSTRAINT learning_raw_len CHECK (length(rawText) BETWEEN 200 AND 200000),
      CONSTRAINT learning_source_rules CHECK (
        (sourceType='url' AND sourceUrl IS NOT NULL AND fileName IS NULL) OR
        (sourceType='file' AND fileName IS NOT NULL AND sourceUrl IS NULL)
      )
    );
    CREATE INDEX IF NOT EXISTS idx_learning_user_category_created ON learning_samples(userId, categoryId, createdAt DESC);

    CREATE TABLE IF NOT EXISTS style_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      profileJson TEXT NOT NULL,
      sampleCount INTEGER NOT NULL CHECK (sampleCount >= 0),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_style_profiles_user_category ON style_profiles(userId, categoryId);

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      categoryId TEXT NOT NULL REFERENCES categories(id),
      locationName TEXT NOT NULL,
      overallNote TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      contentMarkdown TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('draft','generated','exported')),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      CONSTRAINT posts_location_len CHECK (length(locationName) BETWEEN 1 AND 80),
      CONSTRAINT posts_overall_len CHECK (length(overallNote) BETWEEN 1 AND 5000)
    );
    CREATE INDEX IF NOT EXISTS idx_posts_user_updated ON posts(userId, updatedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_user_category ON posts(userId, categoryId);

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      originalFileName TEXT NOT NULL,
      storedFilePath TEXT NOT NULL,
      memo TEXT NOT NULL,
      sortOrder INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      CONSTRAINT photos_memo_len CHECK (length(memo) BETWEEN 1 AND 500),
      CONSTRAINT photos_sort_positive CHECK (sortOrder >= 1)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_post_sort ON photos(postId, sortOrder);
    CREATE INDEX IF NOT EXISTS idx_photos_post_created ON photos(postId, createdAt ASC);

    CREATE TRIGGER IF NOT EXISTS trg_photos_max_20
    BEFORE INSERT ON photos
    FOR EACH ROW
    WHEN (SELECT COUNT(1) FROM photos WHERE postId = NEW.postId) >= 20
    BEGIN
      SELECT RAISE(ABORT, 'max_photos_per_post_exceeded');
    END;

    CREATE TABLE IF NOT EXISTS crawl_sources (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK (provider IN ('naver','kakao','google','blog')),
      sourceUrl TEXT NULL,
      snippetText TEXT NOT NULL,
      rating REAL NULL,
      createdAt INTEGER NOT NULL,
      CONSTRAINT crawl_snippet_len CHECK (length(snippetText) BETWEEN 20 AND 2000),
      CONSTRAINT crawl_rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
    );
    CREATE INDEX IF NOT EXISTS idx_crawl_sources_post_created ON crawl_sources(userId, postId, createdAt ASC);

    CREATE TABLE IF NOT EXISTS crawl_summaries (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      totalCount INTEGER NOT NULL CHECK (totalCount BETWEEN 0 AND 17),
      averageRating REAL NULL,
      summaryText TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_crawl_summaries_user_post ON crawl_summaries(userId, postId);

    CREATE TABLE IF NOT EXISTS post_versions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      versionNumber INTEGER NOT NULL CHECK (versionNumber >= 1),
      promptNote TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      contentMarkdown TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      CONSTRAINT post_versions_title_len CHECK (length(title) BETWEEN 1 AND 120),
      CONSTRAINT post_versions_content_len CHECK (length(contentMarkdown) BETWEEN 200 AND 200000)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_post_versions_post_version ON post_versions(postId, versionNumber);
    CREATE INDEX IF NOT EXISTS idx_post_versions_post_created ON post_versions(userId, postId, createdAt DESC);

    CREATE TABLE IF NOT EXISTS plagiarism_checks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      versionId TEXT NOT NULL REFERENCES post_versions(id),
      similarityScore INTEGER NOT NULL CHECK (similarityScore BETWEEN 0 AND 100),
      comparedSourceIds TEXT NOT NULL,
      passed INTEGER NOT NULL CHECK (passed IN (0,1)),
      createdAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_plagiarism_post_version ON plagiarism_checks(userId, postId, versionId, createdAt DESC);

    CREATE TABLE IF NOT EXISTS seo_analyses (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id),
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      versionId TEXT NOT NULL REFERENCES post_versions(id),
      keywordDensityScore INTEGER NOT NULL CHECK (keywordDensityScore BETWEEN 0 AND 100),
      titleOptimizationScore INTEGER NOT NULL CHECK (titleOptimizationScore BETWEEN 0 AND 100),
      metaDescriptionScore INTEGER NOT NULL CHECK (metaDescriptionScore BETWEEN 0 AND 100),
      readabilityScore INTEGER NOT NULL CHECK (readabilityScore BETWEEN 0 AND 100),
      internalLinksScore INTEGER NOT NULL CHECK (internalLinksScore BETWEEN 0 AND 100),
      overallScore INTEGER NOT NULL CHECK (overallScore BETWEEN 0 AND 100),
      suggestions TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_seo_post_version ON seo_analyses(userId, postId, versionId, createdAt DESC);
  `);
}
