import { randomUUID } from "crypto";
import { query, queryOne, execute, getDb } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type Photo = {
  id: string;
  userId: string;
  postId: string;
  originalFileName: string;
  storedFilePath: string;
  memo: string;
  sortOrder: number;
  createdAt: number;
};

export function listPhotosByPost(userId: string, postId: string): Photo[] {
  return query<Photo>(
    "SELECT * FROM photos WHERE userId = ? AND postId = ? ORDER BY sortOrder ASC",
    userId,
    postId,
  );
}

export function addPhotoWithNextSortOrder(
  userId: string,
  postId: string,
  data: { originalFileName: string; storedFilePath: string; memo: string },
): Photo {
  const id = randomUUID();
  const now = isoNowMs();

  const result = queryOne<{ maxSort: number | null }>(
    "SELECT MAX(sortOrder) as maxSort FROM photos WHERE postId = ?",
    postId,
  );
  const nextSortOrder = (result?.maxSort ?? 0) + 1;

  execute(
    "INSERT INTO photos (id, userId, postId, originalFileName, storedFilePath, memo, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    postId,
    data.originalFileName,
    data.storedFilePath,
    data.memo,
    nextSortOrder,
    now,
  );

  return {
    id,
    userId,
    postId,
    originalFileName: data.originalFileName,
    storedFilePath: data.storedFilePath,
    memo: data.memo,
    sortOrder: nextSortOrder,
    createdAt: now,
  };
}

/**
 * Bulk reorder photos for a post. orderedPhotoIds must contain the IDs
 * in the desired final order; sortOrder is assigned as 1-based index.
 * Scoped to userId to prevent cross-user data leaks.
 * Uses a large offset to avoid unique(postId,sortOrder) conflicts mid-update.
 */
export function reorderPhotos(
  userId: string,
  postId: string,
  orderedPhotoIds: string[],
): void {
  const db = getDb();

  const reorder = db.transaction(() => {
    // Shift all existing sort orders by a large offset to free up 1-N slots
    db.prepare(
      "UPDATE photos SET sortOrder = sortOrder + 1000 WHERE userId = ? AND postId = ?",
    ).run(userId, postId);

    // Assign new 1-based sort orders
    const stmt = db.prepare(
      "UPDATE photos SET sortOrder = ? WHERE id = ? AND userId = ? AND postId = ?",
    );
    for (let i = 0; i < orderedPhotoIds.length; i++) {
      stmt.run(i + 1, orderedPhotoIds[i], userId, postId);
    }
  });

  reorder();
}
