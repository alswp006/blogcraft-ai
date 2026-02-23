import { describe, it, expect } from "vitest";
import { getDb } from "@/lib/db";

// Rollback all test data via SQLite savepoints for isolation
function withSavepoint(name: string, fn: () => void): void {
  const db = getDb();
  db.exec(`SAVEPOINT ${name}`);
  try {
    fn();
  } finally {
    db.exec(`ROLLBACK TO SAVEPOINT ${name}; RELEASE SAVEPOINT ${name};`);
  }
}

// Insert a throwaway user and return its id as string (TEXT FK compat)
function insertTestUser(db: ReturnType<typeof getDb>, email: string): string {
  const r = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)")
    .run(email, "testhash", "Test");
  return String(r.lastInsertRowid);
}

const NOW = Date.now();
const RAW_200 = "a".repeat(200); // minimum rawText length

describe("App Schema — tables exist", () => {
  it("creates all 11 required app tables on startup", () => {
    const db = getDb();
    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const names = new Set(rows.map((r) => r.name));

    const required = [
      "categories",
      "monetization_tips",
      "learning_samples",
      "style_profiles",
      "posts",
      "photos",
      "crawl_sources",
      "crawl_summaries",
      "post_versions",
      "plagiarism_checks",
      "seo_analyses",
    ];
    for (const t of required) {
      expect(names.has(t), `missing table: ${t}`).toBe(true);
    }
  });
});

describe("App Schema — unique constraints", () => {
  it("enforces categories(userId,name) and style_profiles(userId,categoryId)", () => {
    withSavepoint("uc_test", () => {
      const db = getDb();
      const uid = insertTestUser(db, `uc-${NOW}@test.com`);

      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("uc-cat1", uid, "Travel", NOW, NOW);

      // Duplicate (userId, name) must fail
      expect(() =>
        db
          .prepare(
            "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
          )
          .run("uc-cat2", uid, "Travel", NOW, NOW)
      ).toThrow();

      // Duplicate style_profiles(userId, categoryId) must fail
      db.prepare(
        "INSERT INTO style_profiles (id,userId,categoryId,profileJson,sampleCount,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)"
      ).run("sp1", uid, "uc-cat1", "{}", 0, NOW, NOW);

      expect(() =>
        db
          .prepare(
            "INSERT INTO style_profiles (id,userId,categoryId,profileJson,sampleCount,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)"
          )
          .run("sp2", uid, "uc-cat1", "{}", 1, NOW, NOW)
      ).toThrow();
    });
  });
});

describe("App Schema — CHECK constraints on enums", () => {
  it("rejects invalid posts.status, crawl_sources.provider, learning_samples.sourceType", () => {
    withSavepoint("check_test", () => {
      const db = getDb();
      const uid = insertTestUser(db, `chk-${NOW}@test.com`);

      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("chk-cat", uid, "Food", NOW, NOW);

      // posts.status — only 'draft','generated','exported' are valid
      expect(() =>
        db
          .prepare(
            "INSERT INTO posts (id,userId,categoryId,locationName,overallNote,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)"
          )
          .run("bad-post", uid, "chk-cat", "Seoul", "note", "published", NOW, NOW)
      ).toThrow();

      // Valid status must succeed
      db.prepare(
        "INSERT INTO posts (id,userId,categoryId,locationName,overallNote,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)"
      ).run("ok-post", uid, "chk-cat", "Seoul", "note", "draft", NOW, NOW);

      // crawl_sources.provider — only 'naver','kakao','google','blog'
      expect(() =>
        db
          .prepare(
            "INSERT INTO crawl_sources (id,userId,postId,provider,snippetText,createdAt) VALUES (?,?,?,?,?,?)"
          )
          .run("bad-src", uid, "ok-post", "bing", "a".repeat(20), NOW)
      ).toThrow();

      // learning_samples.sourceType — only 'url','file'
      expect(() =>
        db
          .prepare(
            "INSERT INTO learning_samples (id,userId,categoryId,sourceType,sourceUrl,rawText,createdAt) VALUES (?,?,?,?,?,?,?)"
          )
          .run("bad-ls", uid, "chk-cat", "pdf", "http://x.com", RAW_200, NOW)
      ).toThrow();
    });
  });
});

describe("App Schema — photo trigger", () => {
  it("allows up to 20 photos per post and rejects the 21st", () => {
    withSavepoint("trigger_test", () => {
      const db = getDb();
      const uid = insertTestUser(db, `trg-${NOW}@test.com`);

      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("trg-cat", uid, "Trip", NOW, NOW);

      db.prepare(
        "INSERT INTO posts (id,userId,categoryId,locationName,overallNote,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)"
      ).run("trg-post", uid, "trg-cat", "Busan", "Great trip", "draft", NOW, NOW);

      const insertPhoto = db.prepare(
        "INSERT INTO photos (id,userId,postId,originalFileName,storedFilePath,memo,sortOrder,createdAt) VALUES (?,?,?,?,?,?,?,?)"
      );

      for (let i = 1; i <= 20; i++) {
        insertPhoto.run(`ph${i}`, uid, "trg-post", `f${i}.jpg`, `/p/f${i}.jpg`, "memo", i, NOW);
      }

      // 21st insert must be rejected by the trigger
      expect(() =>
        insertPhoto.run("ph21", uid, "trg-post", "f21.jpg", "/p/f21.jpg", "memo", 21, NOW)
      ).toThrow(/max_photos_per_post_exceeded/);
    });
  });
});
