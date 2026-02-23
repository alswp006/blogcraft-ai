import { randomUUID } from "crypto";
import { query, queryOne, execute, getDb } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type PostVersion = {
  id: string;
  userId: string;
  postId: string;
  versionNumber: number;
  promptNote: string;
  title: string;
  contentMarkdown: string;
  createdAt: number;
};

/**
 * Create the next version of a post.
 * Automatically increments versionNumber (starts at 1).
 * Uses a transaction to ensure uniqueness under concurrent calls.
 */
export function createPostVersionNext(
  userId: string,
  postId: string,
  data: {
    promptNote?: string;
    title: string;
    contentMarkdown: string;
  },
): PostVersion {
  const db = getDb();
  const now = isoNowMs();

  let version: PostVersion | null = null;

  const createVersion = db.transaction(() => {
    // Find the highest version number for this post
    const maxRow = queryOne<{ maxVersion: number | null }>(
      "SELECT MAX(versionNumber) as maxVersion FROM post_versions WHERE postId = ?",
      postId,
    );

    const nextVersionNumber = (maxRow?.maxVersion ?? 0) + 1;
    const id = randomUUID();

    execute(
      "INSERT INTO post_versions (id, userId, postId, versionNumber, promptNote, title, contentMarkdown, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      id,
      userId,
      postId,
      nextVersionNumber,
      data.promptNote ?? "",
      data.title,
      data.contentMarkdown,
      now,
    );

    version = {
      id,
      userId,
      postId,
      versionNumber: nextVersionNumber,
      promptNote: data.promptNote ?? "",
      title: data.title,
      contentMarkdown: data.contentMarkdown,
      createdAt: now,
    };
  });

  createVersion();
  return version!;
}

/**
 * Get the latest version of a post (highest versionNumber).
 * Returns null if no versions exist.
 */
export function getLatestPostVersion(
  userId: string,
  postId: string,
): PostVersion | null {
  return (
    queryOne<PostVersion>(
      "SELECT * FROM post_versions WHERE userId = ? AND postId = ? ORDER BY versionNumber DESC LIMIT 1",
      userId,
      postId,
    ) ?? null
  );
}

/**
 * Get a specific version by ID.
 */
export function getPostVersionById(versionId: string): PostVersion | null {
  return queryOne<PostVersion>(
    "SELECT * FROM post_versions WHERE id = ?",
    versionId,
  ) ?? null;
}

/**
 * List all versions of a post in order.
 */
export function listPostVersions(
  userId: string,
  postId: string,
): PostVersion[] {
  return query<PostVersion>(
    "SELECT * FROM post_versions WHERE userId = ? AND postId = ? ORDER BY versionNumber ASC",
    userId,
    postId,
  );
}
