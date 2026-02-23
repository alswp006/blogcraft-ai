import { randomUUID } from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type StyleProfile = {
  id: string;
  userId: string;
  categoryId: string;
  profileJson: string;
  sampleCount: number;
  createdAt: number;
  updatedAt: number;
};

export function getStyleProfile(
  userId: string,
  categoryId: string,
): StyleProfile | null {
  return (
    queryOne<StyleProfile>(
      "SELECT * FROM style_profiles WHERE userId = ? AND categoryId = ?",
      userId,
      categoryId,
    ) ?? null
  );
}

export function upsertStyleProfile(
  userId: string,
  categoryId: string,
  data: {
    profileJson: string;
    sampleCount: number;
  },
): StyleProfile {
  const id = randomUUID();
  const now = isoNowMs();

  execute(
    `INSERT INTO style_profiles (id, userId, categoryId, profileJson, sampleCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(userId, categoryId) DO UPDATE SET
       profileJson = excluded.profileJson,
       sampleCount = excluded.sampleCount,
       updatedAt = excluded.updatedAt`,
    id,
    userId,
    categoryId,
    data.profileJson,
    data.sampleCount,
    now,
    now,
  );

  // Fetch and return the upserted row
  const profile = queryOne<StyleProfile>(
    "SELECT * FROM style_profiles WHERE userId = ? AND categoryId = ?",
    userId,
    categoryId,
  );

  if (!profile) {
    throw new Error("Failed to upsert style profile");
  }

  return profile;
}
