import { describe, it, expect } from "vitest";
import { getDb } from "@/lib/db";
import { createCategory, getCategoryById, listCategoriesByUser } from "@/lib/models/category";

function withSavepoint(name: string, fn: () => void): void {
  const db = getDb();
  db.exec(`SAVEPOINT ${name}`);
  try {
    fn();
  } finally {
    db.exec(`ROLLBACK TO SAVEPOINT ${name}; RELEASE SAVEPOINT ${name};`);
  }
}

function insertTestUser(email: string): string {
  const db = getDb();
  const r = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)")
    .run(email, "testhash", "Test");
  return String(r.lastInsertRowid);
}

const TS = Date.now();

describe("createCategory", () => {
  it("returns a row with non-empty string id and integer timestamps", () => {
    withSavepoint("cc_happy", () => {
      const userId = insertTestUser(`cc-${TS}@test.com`);
      const cat = createCategory(userId, { name: "Travel", description: "My travels" });

      expect(typeof cat.id).toBe("string");
      expect(cat.id.length).toBeGreaterThan(0);
      expect(Number.isInteger(cat.createdAt)).toBe(true);
      expect(Number.isInteger(cat.updatedAt)).toBe(true);
      expect(cat.createdAt).toBeGreaterThan(0);
      expect(cat.userId).toBe(userId);
      expect(cat.name).toBe("Travel");
      expect(cat.description).toBe("My travels");
    });
  });

  it("throws a unique constraint error for duplicate (userId, name)", () => {
    withSavepoint("cc_dup", () => {
      const userId = insertTestUser(`dup-${TS}@test.com`);
      createCategory(userId, { name: "Food" });

      expect(() => createCategory(userId, { name: "Food" })).toThrow();
    });
  });
});

describe("getCategoryById", () => {
  it("returns null when the category does not exist", () => {
    expect(getCategoryById("nonexistent-id")).toBeNull();
  });

  it("returns the row with correct id and userId when found", () => {
    withSavepoint("gc_happy", () => {
      const userId = insertTestUser(`gc-${TS}@test.com`);
      const created = createCategory(userId, { name: "Nature" });

      const found = getCategoryById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.userId).toBe(userId);
    });
  });
});

describe("listCategoriesByUser", () => {
  it("returns only rows for the given userId, sorted by updatedAt DESC", () => {
    withSavepoint("lc_sort", () => {
      const db = getDb();
      const userId1 = insertTestUser(`lc1-${TS}@test.com`);
      const userId2 = insertTestUser(`lc2-${TS}@test.com`);

      const now = Date.now();
      // Insert with explicit timestamps to control sort order
      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("lc-cat-old", userId1, "Alpha", now - 2000, now - 2000);
      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("lc-cat-new", userId1, "Beta", now - 1000, now - 1000);

      // userId2 category — must NOT appear in userId1's list
      db.prepare(
        "INSERT INTO categories (id,userId,name,createdAt,updatedAt) VALUES (?,?,?,?,?)"
      ).run("lc-cat-other", userId2, "Other", now, now);

      const results = listCategoriesByUser(userId1);

      expect(results.length).toBe(2);
      // Sorted descending: newer first
      expect(results[0].id).toBe("lc-cat-new");
      expect(results[1].id).toBe("lc-cat-old");
      // No rows from other user
      expect(results.every((r) => r.userId === userId1)).toBe(true);
    });
  });
});
