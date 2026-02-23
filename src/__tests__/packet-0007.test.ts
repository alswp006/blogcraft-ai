import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDb } from "@/lib/db";
import { insertCrawlSources, listCrawlSources } from "@/lib/models/crawlSource";
import { upsertCrawlSummary, getCrawlSummaryByPost } from "@/lib/models/crawlSummary";
import { createUser } from "@/lib/models/user";
import { createCategory } from "@/lib/models/category";
import { createPost } from "@/lib/models/post";

let testUserId: string;
let testPostId: string;

beforeEach(async () => {
  const db = getDb();
  // Clear test data
  db.exec(`
    DELETE FROM crawl_summaries;
    DELETE FROM crawl_sources;
    DELETE FROM posts;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  // Create test user
  const user = await createUser("test@example.com", "password123", "Test User");
  testUserId = user.id.toString();

  // Create test category
  const category = createCategory(testUserId, { name: "Test Category" });

  // Create test post
  const post = createPost(testUserId, {
    categoryId: category.id,
    locationName: "Test Location",
    overallNote: "Test Note",
  });
  testPostId = post.id;
});

afterEach(() => {
  const db = getDb();
  db.exec(`
    DELETE FROM crawl_summaries;
    DELETE FROM crawl_sources;
    DELETE FROM posts;
    DELETE FROM categories;
    DELETE FROM users;
  `);
});

describe("CrawlSource Model", () => {
  it("insertCrawlSources inserts multiple rows in a transaction", () => {
    const sources = [
      {
        provider: "naver" as const,
        sourceUrl: "https://naver.com/article1",
        snippetText: "This is a test snippet from Naver about the topic.",
        rating: 4.5,
      },
      {
        provider: "kakao" as const,
        sourceUrl: "https://kakao.com/article2",
        snippetText: "Another snippet about the same subject from Kakao platform.",
        rating: 3.8,
      },
      {
        provider: "google" as const,
        snippetText: "Google search result snippet with relevant information.",
        rating: null,
      },
    ];

    const inserted = insertCrawlSources(testUserId, testPostId, sources);

    expect(inserted).toHaveLength(3);
    expect(inserted[0]).toMatchObject({
      userId: testUserId,
      postId: testPostId,
      provider: "naver",
      sourceUrl: "https://naver.com/article1",
      snippetText: "This is a test snippet from Naver about the topic.",
      rating: 4.5,
    });
    expect(inserted[1]).toMatchObject({
      provider: "kakao",
      rating: 3.8,
    });
    expect(inserted[2]).toMatchObject({
      provider: "google",
      sourceUrl: null,
      rating: null,
    });

    // Verify all have UUIDs and timestamps
    inserted.forEach((row) => {
      expect(row.id).toBeTruthy();
      expect(row.createdAt).toBeGreaterThan(0);
    });
  });

  it("listCrawlSources returns sources sorted by createdAt ASC", () => {
    const sources = [
      {
        provider: "naver" as const,
        sourceUrl: "https://naver.com/article1",
        snippetText: "This is a test snippet from Naver about the topic.",
        rating: 4.5,
      },
      {
        provider: "kakao" as const,
        sourceUrl: "https://kakao.com/article2",
        snippetText: "Another snippet about the same subject from Kakao platform.",
        rating: 3.8,
      },
      {
        provider: "google" as const,
        snippetText: "Google search result snippet with relevant information.",
        rating: null,
      },
    ];

    insertCrawlSources(testUserId, testPostId, sources);
    const listed = listCrawlSources(testUserId, testPostId);

    expect(listed).toHaveLength(3);
    // Verify sorted by createdAt ASC
    for (let i = 1; i < listed.length; i++) {
      expect(listed[i].createdAt).toBeGreaterThanOrEqual(listed[i - 1].createdAt);
    }
  });

  it("listCrawlSources returns empty array when no sources for post", () => {
    const listed = listCrawlSources(testUserId, "non-existent-post");
    expect(listed).toHaveLength(0);
  });
});

describe("CrawlSummary Model", () => {
  it("upsertCrawlSummary creates a new row", () => {
    const summary = upsertCrawlSummary(testUserId, testPostId, {
      totalCount: 15,
      averageRating: 4.1,
      summaryText: "This is a summary of all crawled sources.",
    });

    expect(summary).toMatchObject({
      userId: testUserId,
      postId: testPostId,
      totalCount: 15,
      averageRating: 4.1,
      summaryText: "This is a summary of all crawled sources.",
    });
    expect(summary.id).toBeTruthy();
    expect(summary.createdAt).toBeGreaterThan(0);
  });

  it("getCrawlSummaryByPost returns the row after upsert", () => {
    const fetched = getCrawlSummaryByPost(testUserId, testPostId);

    expect(fetched).not.toBeNull();
    expect(fetched).toMatchObject({
      userId: testUserId,
      postId: testPostId,
      totalCount: 15,
      averageRating: 4.1,
      summaryText: "This is a summary of all crawled sources.",
    });
  });

  it("upsertCrawlSummary updates existing row when called twice", () => {
    const firstId = getCrawlSummaryByPost(testUserId, testPostId)!.id;

    const updated = upsertCrawlSummary(testUserId, testPostId, {
      totalCount: 12,
      averageRating: 3.9,
      summaryText: "Updated summary with different content.",
    });

    expect(updated.id).toBe(firstId); // Same row ID
    expect(updated).toMatchObject({
      totalCount: 12,
      averageRating: 3.9,
      summaryText: "Updated summary with different content.",
    });

    // Verify only 1 row exists for this user+post
    const db = getDb();
    const count = db.prepare("SELECT COUNT(1) as cnt FROM crawl_summaries WHERE userId = ? AND postId = ?")
      .get(testUserId, testPostId) as { cnt: number };
    expect(count.cnt).toBe(1);
  });

  it("getCrawlSummaryByPost returns null when not found", () => {
    const notFound = getCrawlSummaryByPost(testUserId, "non-existent-post");
    expect(notFound).toBeNull();
  });

  it("upsertCrawlSummary allows null averageRating", () => {
    // Create a new post for this test
    const db = getDb();
    const newPostId = "test-post-null-rating";
    db.prepare(
      "INSERT INTO posts (id, userId, categoryId, locationName, overallNote, title, contentMarkdown, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(
      newPostId,
      testUserId,
      "test-category-1",
      "Location 2",
      "Note 2",
      "Title 2",
      "Content 2",
      "draft",
      Date.now(),
      Date.now(),
    );

    const summary = upsertCrawlSummary(testUserId, newPostId, {
      totalCount: 5,
      summaryText: "Summary without rating.",
    });

    expect(summary.averageRating).toBeNull();
    expect(summary.totalCount).toBe(5);

    // Cleanup
    db.prepare("DELETE FROM crawl_summaries WHERE postId = ?").run(newPostId);
    db.prepare("DELETE FROM posts WHERE id = ?").run(newPostId);
  });
});
