import { randomUUID } from "crypto";
import { query, queryOne, execute, getDb } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type CrawlSource = {
  id: string;
  userId: string;
  postId: string;
  provider: "naver" | "kakao" | "google" | "blog";
  sourceUrl: string | null;
  snippetText: string;
  rating: number | null;
  createdAt: number;
};

/**
 * Insert multiple crawl sources in a single transaction.
 * Each source row receives a UUID id and integer timestamp (createdAt).
 * Returns the array of inserted rows.
 */
export function insertCrawlSources(
  userId: string,
  postId: string,
  sources: Array<{
    provider: "naver" | "kakao" | "google" | "blog";
    sourceUrl?: string | null;
    snippetText: string;
    rating?: number | null;
  }>,
): CrawlSource[] {
  const db = getDb();
  const now = isoNowMs();
  const inserted: CrawlSource[] = [];

  const insert = db.transaction(() => {
    for (const source of sources) {
      const id = randomUUID();
      execute(
        "INSERT INTO crawl_sources (id, userId, postId, provider, sourceUrl, snippetText, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        id,
        userId,
        postId,
        source.provider,
        source.sourceUrl ?? null,
        source.snippetText,
        source.rating ?? null,
        now,
      );

      inserted.push({
        id,
        userId,
        postId,
        provider: source.provider,
        sourceUrl: source.sourceUrl ?? null,
        snippetText: source.snippetText,
        rating: source.rating ?? null,
        createdAt: now,
      });
    }
  });

  insert();
  return inserted;
}

/**
 * List all crawl sources for a post, sorted by createdAt ASC.
 * Scoped to userId to prevent cross-user data leaks.
 */
export function listCrawlSources(userId: string, postId: string): CrawlSource[] {
  return query<CrawlSource>(
    "SELECT * FROM crawl_sources WHERE userId = ? AND postId = ? ORDER BY createdAt ASC",
    userId,
    postId,
  );
}
