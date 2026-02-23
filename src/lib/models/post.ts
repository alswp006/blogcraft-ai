import { randomUUID } from "crypto";
import { query, queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type Post = {
  id: string;
  userId: string;
  categoryId: string;
  locationName: string;
  overallNote: string;
  title: string;
  contentMarkdown: string;
  status: "draft" | "generated" | "exported";
  createdAt: number;
  updatedAt: number;
};

export function createPost(
  userId: string,
  data: { categoryId: string; locationName: string; overallNote: string },
): Post {
  const id = randomUUID();
  const now = isoNowMs();

  execute(
    "INSERT INTO posts (id, userId, categoryId, locationName, overallNote, title, contentMarkdown, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    data.categoryId,
    data.locationName,
    data.overallNote,
    "",
    "",
    "draft",
    now,
    now,
  );

  return {
    id,
    userId,
    categoryId: data.categoryId,
    locationName: data.locationName,
    overallNote: data.overallNote,
    title: "",
    contentMarkdown: "",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function getPostById(postId: string): Post | null {
  return queryOne<Post>("SELECT * FROM posts WHERE id = ?", postId) ?? null;
}

export function listPostsByUser(userId: string): Post[] {
  return query<Post>(
    "SELECT * FROM posts WHERE userId = ? ORDER BY updatedAt DESC",
    userId,
  );
}
