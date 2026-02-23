import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDb } from "@/lib/db";
import { insertCrawlSources, listCrawlSources } from "@/lib/models/crawlSource";
import { upsertCrawlSummary, getCrawlSummaryByPost } from "@/lib/models/crawlSummary";
import { createUser } from "@/lib/models/user";
import { createCategory } from "@/lib/models/category";
import { createPost } from "@/lib/models/post";

let testUserId: string;
let testPostId: string;
let testCategoryId: string;

beforeEach(async () => {
  const user = await createUser(`test-p0007-${Date.now()}@example.com`, "password123", "Test User");
  testUserId = user.id.toString();

  const category = createCategory(testUserId, { name: "Test Category" });
  testCategoryId = category.id;

  const post = createPost(testUserId, {
    categoryId: testCategoryId,
    locationName: "Test Location",
    overallNote: "Test Note",
  });
  testPostId = post.id;
});

afterEach(() => {
  const db = getDb();
  db.prepare("DELETE FROM crawl_summaries WHERE userId = ?").run(testUserId);
  db.prepare("DELETE FROM crawl_sources WHERE userId = ?").run(testUserId);
  db.prepare("DELETE FROM posts WHERE userId = ?").run(testUserId);
  db.prepare("DELETE FROM categories WHERE userId = ?").run(testUserId);
  db.prepare("DELETE FROM users WHERE id = ?").run(testUserId);
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
    upsertCrawlSummary(testUserId, testPostId, {
      totalCount: 15,
      averageRating: 4.1,
      summaryText: "This is a summary of all crawled sources.",
    });

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
    upsertCrawlSummary(testUserId, testPostId, {
      totalCount: 15,
      averageRating: 4.1,
      summaryText: "This is a summary of all crawled sources.",
    });

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
    const newPost = createPost(testUserId, {
      categoryId: testCategoryId,
      locationName: "Location 2",
      overallNote: "Note 2",
    });

    const summary = upsertCrawlSummary(testUserId, newPost.id, {
      totalCount: 5,
      summaryText: "Summary without rating.",
    });

    expect(summary.averageRating).toBeNull();
    expect(summary.totalCount).toBe(5);
  });
});
