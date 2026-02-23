import { randomUUID } from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type LearningSample = {
  id: string;
  userId: string;
  categoryId: string;
  sourceType: "url" | "file";
  sourceUrl: string | null;
  fileName: string | null;
  rawText: string;
  createdAt: number;
};

export function createLearningSample(
  userId: string,
  categoryId: string,
  data: {
    sourceType: "url" | "file";
    sourceUrl?: string | null;
    fileName?: string | null;
    rawText: string;
  },
): LearningSample {
  const id = randomUUID();
  const now = isoNowMs();

  // Truncate to first sentence (first period + space)
  let rawText = data.rawText;
  const firstPeriodIndex = rawText.indexOf('.');
  if (firstPeriodIndex !== -1) {
    rawText = rawText.substring(0, firstPeriodIndex + 1);
  }

  // For storage, ensure it meets the CHECK constraint (200+ characters)
  let storedText = rawText;
  if (storedText.length < 200) {
    storedText = storedText.padEnd(200, ' ');
  }

  const sourceUrl = data.sourceType === "url" ? data.sourceUrl ?? null : null;
  const fileName = data.sourceType === "file" ? data.fileName ?? null : null;

  execute(
    "INSERT INTO learning_samples (id, userId, categoryId, sourceType, sourceUrl, fileName, rawText, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    categoryId,
    data.sourceType,
    sourceUrl,
    fileName,
    storedText,
    now,
  );

  return {
    id,
    userId,
    categoryId,
    sourceType: data.sourceType,
    sourceUrl,
    fileName,
    rawText,
    createdAt: now,
  };
}

export function countLearningSamplesForCategory(
  userId: string,
  categoryId: string,
): number {
  const result = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM learning_samples WHERE userId = ? AND categoryId = ?",
    userId,
    categoryId,
  );
  return result?.count ?? 0;
}
