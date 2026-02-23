import { randomUUID } from "crypto";
import { query, queryOne, execute, getDb } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type CrawlSummary = {
  id: string;
  userId: string;
  postId: string;
  totalCount: number;
  averageRating: number | null;
  summaryText: string;
  createdAt: number;
};

/**
 * Upsert a crawl summary for a post.
 * If a row for (userId, postId) already exists, it is updated.
 * Otherwise, a new row is inserted.
 * Returns the final row (always exactly 1 per user+post).
 */
export function upsertCrawlSummary(
  userId: string,
  postId: string,
  data: {
    totalCount: number;
    averageRating?: number | null;
    summaryText: string;
  },
): CrawlSummary {
  const db = getDb();
  const now = isoNowMs();

  const upsert = db.transaction(() => {
    // Check if row exists
    const existing = queryOne<CrawlSummary>(
      "SELECT * FROM crawl_summaries WHERE userId = ? AND postId = ?",
      userId,
      postId,
    );

    if (existing) {
      // Update existing row
      execute(
        "UPDATE crawl_summaries SET totalCount = ?, averageRating = ?, summaryText = ? WHERE userId = ? AND postId = ?",
        data.totalCount,
        data.averageRating ?? null,
        data.summaryText,
        userId,
        postId,
      );
      return existing.id;
    } else {
      // Insert new row
      const id = randomUUID();
      execute(
        "INSERT INTO crawl_summaries (id, userId, postId, totalCount, averageRating, summaryText, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        id,
        userId,
        postId,
        data.totalCount,
        data.averageRating ?? null,
        data.summaryText,
        now,
      );
      return id;
    }
  });

  const id = upsert();

  // Fetch and return the final row
  const row = queryOne<CrawlSummary>(
    "SELECT * FROM crawl_summaries WHERE userId = ? AND postId = ?",
    userId,
    postId,
  );

  return row!;
}

/**
 * Get a crawl summary for a post by userId and postId.
 * Returns null if not found.
 */
export function getCrawlSummaryByPost(userId: string, postId: string): CrawlSummary | null {
  return queryOne<CrawlSummary>(
    "SELECT * FROM crawl_summaries WHERE userId = ? AND postId = ?",
    userId,
    postId,
  ) ?? null;
}
