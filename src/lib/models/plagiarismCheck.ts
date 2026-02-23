import { randomUUID } from "crypto";
import { queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type PlagiarismCheck = {
  id: string;
  userId: string;
  postId: string;
  versionId: string;
  similarityScore: number;
  comparedSourceIds: string; // JSON-serialized array of strings
  passed: number; // 0 or 1
  createdAt: number;
};

/**
 * Create a plagiarism check record for a post version.
 * Stores comparedSourceIds as a JSON array string.
 */
export function createPlagiarismCheck(
  userId: string,
  postId: string,
  versionId: string,
  data: {
    similarityScore: number;
    comparedSourceIds: string[];
    passed: boolean;
  },
): PlagiarismCheck {
  const id = randomUUID();
  const now = isoNowMs();
  const comparedSourceIdsJson = JSON.stringify(data.comparedSourceIds);
  const passedInt = data.passed ? 1 : 0;

  execute(
    "INSERT INTO plagiarism_checks (id, userId, postId, versionId, similarityScore, comparedSourceIds, passed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    postId,
    versionId,
    data.similarityScore,
    comparedSourceIdsJson,
    passedInt,
    now,
  );

  return {
    id,
    userId,
    postId,
    versionId,
    similarityScore: data.similarityScore,
    comparedSourceIds: comparedSourceIdsJson,
    passed: passedInt,
    createdAt: now,
  };
}

/**
 * Get the latest plagiarism check for a post version.
 */
export function getLatestPlagiarismCheck(
  userId: string,
  postId: string,
  versionId: string,
): PlagiarismCheck | null {
  return (
    queryOne<PlagiarismCheck>(
      "SELECT * FROM plagiarism_checks WHERE userId = ? AND postId = ? AND versionId = ? ORDER BY createdAt DESC LIMIT 1",
      userId,
      postId,
      versionId,
    ) ?? null
  );
}

/**
 * Get a plagiarism check by ID.
 */
export function getPlagiarismCheckById(checkId: string): PlagiarismCheck | null {
  return (
    queryOne<PlagiarismCheck>(
      "SELECT * FROM plagiarism_checks WHERE id = ?",
      checkId,
    ) ?? null
  );
}
