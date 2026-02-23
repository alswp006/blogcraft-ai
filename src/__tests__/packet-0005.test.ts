import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDb, execute, queryOne } from "@/lib/db";
import {
  createLearningSample,
  countLearningSamplesForCategory,
  type LearningSample,
} from "@/lib/models/learningSample";
import {
  getStyleProfile,
  upsertStyleProfile,
  type StyleProfile,
} from "@/lib/models/styleProfile";
import { createCategory } from "@/lib/models/category";
import { createUser } from "@/lib/models/user";

describe("LearningSample & StyleProfile Models (packet-0005)", () => {
  let userId: string;
  let categoryId: string;

  beforeEach(async () => {
    // Create test user with unique email to avoid conflicts with parallel tests
    const user = await createUser(`test-p0005-${Date.now()}@example.com`, "password123", "Test User");
    userId = user.id.toString();

    // Create test category
    const category = createCategory(userId, { name: "Test Category" });
    categoryId = category.id;
  });

  afterEach(() => {
    const db = getDb();
    // Delete in FK order: children before parents, scoped to test user
    db.prepare("DELETE FROM learning_samples WHERE userId = ?").run(userId);
    db.prepare("DELETE FROM style_profiles WHERE userId = ?").run(userId);
    db.prepare("DELETE FROM categories WHERE userId = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  });

  describe("createLearningSample", () => {
    it("inserts a learning sample with URL source and returns correct fields", () => {
      const sample = createLearningSample(userId, categoryId, {
        sourceType: "url",
        sourceUrl: "https://example.com/article",
        rawText: "This is a sample text with at least 200 characters to meet the minimum length requirement for learning samples in the database schema validation rules. This is additional text to ensure we exceed the minimum length constraint that enforces between 200 and 200000 characters.",
      });

      expect(sample).toMatchObject({
        sourceType: "url",
        sourceUrl: "https://example.com/article",
        fileName: null,
      });
      expect(sample.id).toBeDefined();
      expect(typeof sample.createdAt).toBe("number");
      expect(sample.createdAt > 0).toBe(true);
      expect(sample.rawText).toBe(
        "This is a sample text with at least 200 characters to meet the minimum length requirement for learning samples in the database schema validation rules.",
      );
    });

    it("inserts a learning sample with file source and returns correct fields", () => {
      const sample = createLearningSample(userId, categoryId, {
        sourceType: "file",
        fileName: "document.pdf",
        rawText: "This is another sample text with at least 200 characters to meet the minimum length requirement for learning samples stored as files in the database schema. We need to add more content to ensure the text is long enough to satisfy the database constraints for this learning material.",
      });

      expect(sample).toMatchObject({
        sourceType: "file",
        fileName: "document.pdf",
        sourceUrl: null,
      });
      expect(sample.id).toBeDefined();
      expect(typeof sample.createdAt).toBe("number");
      expect(sample.createdAt > 0).toBe(true);
    });

    it("returns createdAt as integer milliseconds", () => {
      const beforeMs = Date.now();
      const sample = createLearningSample(userId, categoryId, {
        sourceType: "url",
        sourceUrl: "https://example.com",
        rawText: "Sample text content with sufficient length to pass the database constraints and validation rules for this type of learning material. This text needs to be over two hundred characters long, so we continue adding more content here to ensure the minimum length is met.",
      });
      const afterMs = Date.now();

      expect(Number.isInteger(sample.createdAt)).toBe(true);
      expect(sample.createdAt >= beforeMs).toBe(true);
      expect(sample.createdAt <= afterMs).toBe(true);
    });
  });

  describe("countLearningSamplesForCategory", () => {
    it("returns 0 for empty category", () => {
      const count = countLearningSamplesForCategory(userId, categoryId);
      expect(count).toBe(0);
    });

    it("increases by 1 after each successful insert", () => {
      const initialCount = countLearningSamplesForCategory(userId, categoryId);
      expect(initialCount).toBe(0);

      createLearningSample(userId, categoryId, {
        sourceType: "url",
        sourceUrl: "https://example.com/1",
        rawText: "First sample with sufficient length requirement being met by including enough characters in this text field. We need this to be long enough to pass the minimum character requirement of two hundred characters for the database.",
      });

      const afterFirst = countLearningSamplesForCategory(userId, categoryId);
      expect(afterFirst).toBe(1);

      createLearningSample(userId, categoryId, {
        sourceType: "file",
        fileName: "file.txt",
        rawText: "Second sample with sufficient length requirement being met by including enough characters in this text field.",
      });

      const afterSecond = countLearningSamplesForCategory(userId, categoryId);
      expect(afterSecond).toBe(2);
    });
  });

  describe("getStyleProfile", () => {
    it("returns null when profile does not exist", () => {
      const profile = getStyleProfile(userId, categoryId);
      expect(profile).toBeNull();
    });

    it("returns profile with matching userId and categoryId after upsert", () => {
      const profileJson = JSON.stringify({ tone: "formal", style: "academic" });
      upsertStyleProfile(userId, categoryId, {
        profileJson,
        sampleCount: 5,
      });

      const profile = getStyleProfile(userId, categoryId);
      expect(profile).not.toBeNull();
      expect(profile!.userId).toBe(userId);
      expect(profile!.categoryId).toBe(categoryId);
      expect(profile!.profileJson).toBe(profileJson);
      expect(profile!.sampleCount).toBe(5);
    });
  });

  describe("upsertStyleProfile", () => {
    it("creates a new profile on first upsert", () => {
      const profileJson = JSON.stringify({ tone: "casual" });
      const profile = upsertStyleProfile(userId, categoryId, {
        profileJson,
        sampleCount: 3,
      });

      expect(profile.userId).toBe(userId);
      expect(profile.categoryId).toBe(categoryId);
      expect(profile.profileJson).toBe(profileJson);
      expect(profile.sampleCount).toBe(3);
      expect(typeof profile.createdAt).toBe("number");
      expect(typeof profile.updatedAt).toBe("number");
    });

    it("updates existing profile on second upsert for same user+category", async () => {
      const profileJson1 = JSON.stringify({ tone: "casual" });
      const profile1 = upsertStyleProfile(userId, categoryId, {
        profileJson: profileJson1,
        sampleCount: 3,
      });

      const createdAt1 = profile1.createdAt;

      // Wait a moment to ensure updatedAt could be different
      await new Promise((resolve) => setTimeout(resolve, 2));

      const profileJson2 = JSON.stringify({ tone: "formal", style: "professional" });
      const profile2 = upsertStyleProfile(userId, categoryId, {
        profileJson: profileJson2,
        sampleCount: 7,
      });

      // Should have same ID (updated, not inserted)
      expect(profile2.id).toBe(profile1.id);
      expect(profile2.createdAt).toBe(createdAt1);
      expect(profile2.updatedAt >= profile1.updatedAt).toBe(true);
      expect(profile2.profileJson).toBe(profileJson2);
      expect(profile2.sampleCount).toBe(7);

      // Verify only one row exists in database
      const db = getDb();
      const countResult = db
        .prepare("SELECT COUNT(*) as count FROM style_profiles WHERE userId = ? AND categoryId = ?")
        .get(userId, categoryId) as { count: number };
      expect(countResult.count).toBe(1);
    });

    it("ensures unique constraint on (userId, categoryId) after upserts", () => {
      upsertStyleProfile(userId, categoryId, {
        profileJson: JSON.stringify({ tone: "casual" }),
        sampleCount: 3,
      });

      upsertStyleProfile(userId, categoryId, {
        profileJson: JSON.stringify({ tone: "formal" }),
        sampleCount: 5,
      });

      // Count rows in database for this user+category
      const db = getDb();
      const countResult = db
        .prepare("SELECT COUNT(*) as count FROM style_profiles WHERE userId = ? AND categoryId = ?")
        .get(userId, categoryId) as { count: number };
      expect(countResult.count).toBe(1);
    });
  });
});
