import { randomUUID } from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type MonetizationTip = {
  id: string;
  userId: string;
  categoryId: string;
  recommendedMethod: string;
  tipText: string;
  createdAt: number;
  updatedAt: number;
};

export function getMonetizationTip(
  userId: string,
  categoryId: string,
): MonetizationTip | null {
  return (
    queryOne<MonetizationTip>(
      "SELECT * FROM monetization_tips WHERE userId = ? AND categoryId = ?",
      userId,
      categoryId,
    ) ?? null
  );
}

export function upsertMonetizationTip(
  userId: string,
  categoryId: string,
  data: {
    recommendedMethod: string;
    tipText: string;
  },
): MonetizationTip {
  const id = randomUUID();
  const now = isoNowMs();

  execute(
    `INSERT INTO monetization_tips (id, userId, categoryId, recommendedMethod, tipText, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(userId, categoryId) DO UPDATE SET
       recommendedMethod = excluded.recommendedMethod,
       tipText = excluded.tipText,
       updatedAt = excluded.updatedAt`,
    id,
    userId,
    categoryId,
    data.recommendedMethod,
    data.tipText,
    now,
    now,
  );

  // Fetch and return the upserted row
  const tip = queryOne<MonetizationTip>(
    "SELECT * FROM monetization_tips WHERE userId = ? AND categoryId = ?",
    userId,
    categoryId,
  );

  if (!tip) {
    throw new Error("Failed to upsert monetization tip");
  }

  return tip;
}
