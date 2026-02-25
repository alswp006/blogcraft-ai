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

export function updatePost(
  postId: string,
  userId: string,
  data: Partial<Pick<Post, "title" | "overallNote" | "contentMarkdown" | "status">>,
): Post | null {
  const post = queryOne<Post>("SELECT * FROM posts WHERE id = ? AND userId = ?", postId, userId);
  if (!post) return null;

  const now = isoNowMs();
  const title = data.title ?? post.title;
  const overallNote = data.overallNote ?? post.overallNote;
  const contentMarkdown = data.contentMarkdown ?? post.contentMarkdown;
  const status = data.status ?? post.status;

  execute(
    "UPDATE posts SET title = ?, overallNote = ?, contentMarkdown = ?, status = ?, updatedAt = ? WHERE id = ? AND userId = ?",
    title, overallNote, contentMarkdown, status, now, postId, userId,
  );

  return { ...post, title, overallNote, contentMarkdown, status, updatedAt: now };
}

export function deletePost(postId: string, userId: string): boolean {
  const result = execute("DELETE FROM posts WHERE id = ? AND userId = ?", postId, userId);
  return result.changes > 0;
}

export function listPostsByUser(userId: string): Post[] {
  return query<Post>(
    "SELECT * FROM posts WHERE userId = ? ORDER BY updatedAt DESC",
    userId,
  );
}
