import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDb, execute } from "@/lib/db";
import {
  getMonetizationTip,
  upsertMonetizationTip,
  type MonetizationTip,
} from "@/lib/models/monetizationTip";
import { createCategory } from "@/lib/models/category";
import { createUser } from "@/lib/models/user";

describe("MonetizationTip Model (packet-0009)", () => {
  let userId: string;
  let categoryId: string;

  beforeEach(async () => {
    const db = getDb();

    // Clear test data
    db.exec(`
      DELETE FROM monetization_tips;
      DELETE FROM categories;
      DELETE FROM users;
    `);

    // Create test user
    const user = await createUser("test@example.com", "password123", "Test User");
    userId = user.id.toString();

    // Create test category
    const category = createCategory(userId, { name: "Test Category" });
    categoryId = category.id;
  });

  afterEach(() => {
    const db = getDb();
    db.exec(`
      DELETE FROM monetization_tips;
      DELETE FROM categories;
      DELETE FROM users;
    `);
  });

  describe("getMonetizationTip", () => {
    it("returns null when no tip exists", () => {
      const tip = getMonetizationTip(userId, categoryId);
      expect(tip).toBeNull();
    });

    it("returns tip with matching userId and categoryId after upsert", () => {
      const tipData = {
        recommendedMethod: "Affiliate Marketing",
        tipText: "Focus on high-commission affiliate programs",
      };

      upsertMonetizationTip(userId, categoryId, tipData);

      const tip = getMonetizationTip(userId, categoryId);
      expect(tip).not.toBeNull();
      expect(tip!.userId).toBe(userId);
      expect(tip!.categoryId).toBe(categoryId);
      expect(tip!.recommendedMethod).toBe(tipData.recommendedMethod);
      expect(tip!.tipText).toBe(tipData.tipText);
    });

    it("returns null for different categoryId", () => {
      upsertMonetizationTip(userId, categoryId, {
        recommendedMethod: "Sponsorship",
        tipText: "Build a strong audience first",
      });

      // Create another category
      const category2 = createCategory(userId, { name: "Another Category" });

      const tip = getMonetizationTip(userId, category2.id);
      expect(tip).toBeNull();
    });
  });

  describe("upsertMonetizationTip", () => {
    it("creates a new tip on first upsert", () => {
      const tipData = {
        recommendedMethod: "Ad Network",
        tipText: "Join Google AdSense for passive income",
      };

      const tip = upsertMonetizationTip(userId, categoryId, tipData);

      expect(tip.userId).toBe(userId);
      expect(tip.categoryId).toBe(categoryId);
      expect(tip.recommendedMethod).toBe(tipData.recommendedMethod);
      expect(tip.tipText).toBe(tipData.tipText);
      expect(typeof tip.id).toBe("string");
      expect(typeof tip.createdAt).toBe("number");
      expect(typeof tip.updatedAt).toBe("number");
      expect(tip.createdAt > 0).toBe(true);
      expect(tip.updatedAt > 0).toBe(true);
    });

    it("returns integer timestamps in milliseconds", () => {
      const beforeMs = Date.now();

      const tip = upsertMonetizationTip(userId, categoryId, {
        recommendedMethod: "Donations",
        tipText: "Set up a Ko-fi or Patreon account",
      });

      const afterMs = Date.now();

      expect(Number.isInteger(tip.createdAt)).toBe(true);
      expect(Number.isInteger(tip.updatedAt)).toBe(true);
      expect(tip.createdAt >= beforeMs).toBe(true);
      expect(tip.createdAt <= afterMs).toBe(true);
      expect(tip.updatedAt >= beforeMs).toBe(true);
      expect(tip.updatedAt <= afterMs).toBe(true);
    });

    it("updates existing tip on second upsert for same user+category", async () => {
      const tip1Data = {
        recommendedMethod: "Affiliate Marketing",
        tipText: "Start with niche affiliates",
      };

      const tip1 = upsertMonetizationTip(userId, categoryId, tip1Data);
      const createdAt1 = tip1.createdAt;
      const id1 = tip1.id;

      // Wait a moment to ensure updatedAt could be different
      await new Promise((resolve) => setTimeout(resolve, 2));

      const tip2Data = {
        recommendedMethod: "Sponsorship",
        tipText: "Partner with relevant brands",
      };

      const tip2 = upsertMonetizationTip(userId, categoryId, tip2Data);

      // Should have same ID (updated, not inserted)
      expect(tip2.id).toBe(id1);
      expect(tip2.createdAt).toBe(createdAt1);
      expect(tip2.updatedAt >= tip1.updatedAt).toBe(true);
      expect(tip2.recommendedMethod).toBe(tip2Data.recommendedMethod);
      expect(tip2.tipText).toBe(tip2Data.tipText);

      // Verify only one row exists in database
      const db = getDb();
      const countResult = db
        .prepare(
          "SELECT COUNT(*) as count FROM monetization_tips WHERE userId = ? AND categoryId = ?",
        )
        .get(userId, categoryId) as { count: number };
      expect(countResult.count).toBe(1);
    });

    it("ensures unique constraint prevents duplicate (userId, categoryId) pairs", () => {
      const tipData = {
        recommendedMethod: "Ad Network",
        tipText: "Use multiple ad networks",
      };

      upsertMonetizationTip(userId, categoryId, tipData);

      // Try to insert a second tip with same user+category via raw SQL
      const db = getDb();
      expect(() => {
        execute(
          `INSERT INTO monetization_tips (id, userId, categoryId, recommendedMethod, tipText, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          "another-id",
          userId,
          categoryId,
          "Different Method",
          "Different tip",
          Date.now(),
          Date.now(),
        );
      }).toThrow();

      // Verify only one row exists
      const countResult = db
        .prepare(
          "SELECT COUNT(*) as count FROM monetization_tips WHERE userId = ? AND categoryId = ?",
        )
        .get(userId, categoryId) as { count: number };
      expect(countResult.count).toBe(1);
    });

    it("maintains separate tips for different categories", () => {
      const category2 = createCategory(userId, { name: "Category 2" });

      const tip1 = upsertMonetizationTip(userId, categoryId, {
        recommendedMethod: "Affiliate Marketing",
        tipText: "Focus on tech products",
      });

      const tip2 = upsertMonetizationTip(userId, category2.id, {
        recommendedMethod: "Sponsorship",
        tipText: "Partner with lifestyle brands",
      });

      // Both tips should exist independently
      expect(tip1.id).not.toBe(tip2.id);
      expect(getMonetizationTip(userId, categoryId)).not.toBeNull();
      expect(getMonetizationTip(userId, category2.id)).not.toBeNull();

      const db = getDb();
      const countResult = db
        .prepare("SELECT COUNT(*) as count FROM monetization_tips WHERE userId = ?")
        .get(userId) as { count: number };
      expect(countResult.count).toBe(2);
    });

    it("maintains separate tips for different users", async () => {
      const user2 = await createUser("test2@example.com", "password123", "Test User 2");
      const userId2 = user2.id.toString();

      const tip1 = upsertMonetizationTip(userId, categoryId, {
        recommendedMethod: "Affiliate Marketing",
        tipText: "User 1 tip",
      });

      const tip2 = upsertMonetizationTip(userId2, categoryId, {
        recommendedMethod: "Sponsorship",
        tipText: "User 2 tip",
      });

      // Both tips should exist independently
      expect(tip1.id).not.toBe(tip2.id);
      expect(getMonetizationTip(userId, categoryId)!.tipText).toBe("User 1 tip");
      expect(getMonetizationTip(userId2, categoryId)!.tipText).toBe("User 2 tip");

      const db = getDb();
      const countResult = db
        .prepare("SELECT COUNT(*) as count FROM monetization_tips")
        .get() as { count: number };
      expect(countResult.count).toBe(2);
    });
  });
});
