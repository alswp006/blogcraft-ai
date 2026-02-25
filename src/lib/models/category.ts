import { randomUUID } from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type Category = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

export function createCategory(
  userId: string,
  data: { name: string; description?: string | null },
): Category {
  const id = randomUUID();
  const now = isoNowMs();

  execute(
    "INSERT INTO categories (id, userId, name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
    id,
    userId,
    data.name,
    data.description ?? null,
    now,
    now,
  );

  return {
    id,
    userId,
    name: data.name,
    description: data.description ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getCategoryById(categoryId: string): Category | null {
  return queryOne<Category>("SELECT * FROM categories WHERE id = ?", categoryId) ?? null;
}

export function listCategoriesByUser(userId: string): Category[] {
  return query<Category>(
    "SELECT * FROM categories WHERE userId = ? ORDER BY updatedAt DESC",
    userId,
  );
}

export function deleteCategory(categoryId: string, userId: string): boolean {
  // Foreign key CASCADE deletes related data (learning_samples, style_profiles, monetization_tips)
  // Posts reference categoryId but we keep them (they become orphaned — acceptable for MVP)
  const result = execute(
    "DELETE FROM categories WHERE id = ? AND userId = ?",
    categoryId,
    userId,
  );
  return result.changes > 0;
}
