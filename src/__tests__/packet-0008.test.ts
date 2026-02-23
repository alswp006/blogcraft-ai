import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import {
  createPostVersionNext,
  getLatestPostVersion,
  getPostVersionById,
  listPostVersions,
} from "@/lib/models/postVersion";
import {
  createPlagiarismCheck,
  getLatestPlagiarismCheck,
  getPlagiarismCheckById,
} from "@/lib/models/plagiarismCheck";
import {
  createSeoAnalysis,
  getLatestSeoAnalysis,
  getSeoAnalysisById,
} from "@/lib/models/seoAnalysis";
import { createPost } from "@/lib/models/post";
import { createCategory } from "@/lib/models/category";
import { getDb } from "@/lib/db";

function withSavepoint(name: string, fn: () => void): void {
  const db = getDb();
  db.exec(`SAVEPOINT ${name}`);
  try {
    fn();
  } finally {
    db.exec(
      `ROLLBACK TO SAVEPOINT ${name}; RELEASE SAVEPOINT ${name};`
    );
  }
}

function insertTestUser(email: string): string {
  const db = getDb();
  const r = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?,?,?)")
    .run(email, "testhash", "Test");
  return String(r.lastInsertRowid);
}

describe("PostVersion Model", () => {
  let userId: string;
  let categoryId: string;
  let postId: string;

  beforeEach(() => {
    // Setup test data with proper user
    const ts = Date.now();
    userId = insertTestUser(`pv-${ts}-${randomUUID()}@test.com`);
    categoryId = createCategory(userId, {
      name: "test-cat-" + randomUUID(),
    }).id;
    postId = createPost(userId, {
      categoryId,
      locationName: "Test Location",
      overallNote: "Test note",
    }).id;
  });

  it("createPostVersionNext creates versionNumber 1 when none exist", () => {
    const version = createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
      promptNote: "Initial note",
    });

    expect(version.versionNumber).toBe(1);
    expect(version.title).toBe("Version 1");
    expect(version.promptNote).toBe("Initial note");
  });

  it("createPostVersionNext increments versionNumber on second call", () => {
    const v1 = createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
    });

    const v2 = createPostVersionNext(userId, postId, {
      title: "Version 2",
      contentMarkdown: "Content for version 2. " + "x".repeat(200),
    });

    expect(v1.versionNumber).toBe(1);
    expect(v2.versionNumber).toBe(2);
  });

  it("both version 1 and 2 remain in database after second call", () => {
    createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
    });

    createPostVersionNext(userId, postId, {
      title: "Version 2",
      contentMarkdown: "Content for version 2. " + "x".repeat(200),
    });

    const versions = listPostVersions(userId, postId);
    expect(versions).toHaveLength(2);
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[1].versionNumber).toBe(2);
  });

  it("getLatestPostVersion returns null when no versions exist", () => {
    const version = getLatestPostVersion(userId, postId);
    expect(version).toBeNull();
  });

  it("getLatestPostVersion returns the highest versionNumber", () => {
    createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
    });

    const v2 = createPostVersionNext(userId, postId, {
      title: "Version 2",
      contentMarkdown: "Content for version 2. " + "x".repeat(200),
    });

    const latest = getLatestPostVersion(userId, postId);
    expect(latest).not.toBeNull();
    expect(latest!.versionNumber).toBe(2);
    expect(latest!.id).toBe(v2.id);
  });

  it("getPostVersionById retrieves a specific version", () => {
    const v1 = createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
    });

    const retrieved = getPostVersionById(v1.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.versionNumber).toBe(1);
    expect(retrieved!.title).toBe("Version 1");
  });

  it("createPostVersionNext defaults promptNote to empty string", () => {
    const version = createPostVersionNext(userId, postId, {
      title: "Version 1",
      contentMarkdown: "Content for version 1. " + "x".repeat(200),
    });

    expect(version.promptNote).toBe("");
  });
});

describe("PlagiarismCheck Model", () => {
  let userId: string;
  let categoryId: string;
  let postId: string;
  let versionId: string;

  beforeEach(() => {
    const ts = Date.now();
    userId = insertTestUser(`pc-${ts}-${randomUUID()}@test.com`);
    categoryId = createCategory(userId, {
      name: "test-cat-" + randomUUID(),
    }).id;
    postId = createPost(userId, {
      categoryId,
      locationName: "Test Location",
      overallNote: "Test note",
    }).id;

    const version = createPostVersionNext(userId, postId, {
      title: "Test Version",
      contentMarkdown: "Content for test. " + "x".repeat(200),
    });
    versionId = version.id;
  });

  it("createPlagiarismCheck stores comparedSourceIds as JSON string", () => {
    const sourceIds = ["source-1", "source-2", "source-3"];
    const check = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 42,
      comparedSourceIds: sourceIds,
      passed: false,
    });

    expect(check.comparedSourceIds).toBe(JSON.stringify(sourceIds));
    const parsed = JSON.parse(check.comparedSourceIds);
    expect(parsed).toEqual(sourceIds);
  });

  it("createPlagiarismCheck converts passed boolean to 0/1", () => {
    const checkPassed = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 10,
      comparedSourceIds: [],
      passed: true,
    });

    const checkFailed = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 95,
      comparedSourceIds: [],
      passed: false,
    });

    expect(checkPassed.passed).toBe(1);
    expect(checkFailed.passed).toBe(0);
  });

  it("getLatestPlagiarismCheck returns the most recent check", () => {
    const check1 = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 30,
      comparedSourceIds: ["a", "b"],
      passed: true,
    });

    const check2 = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 50,
      comparedSourceIds: ["c", "d"],
      passed: false,
    });

    const latest = getLatestPlagiarismCheck(userId, postId, versionId);
    expect(latest!.id).toBe(check2.id);
    expect(latest!.similarityScore).toBe(50);
  });

  it("getPlagiarismCheckById retrieves a specific check", () => {
    const check = createPlagiarismCheck(userId, postId, versionId, {
      similarityScore: 75,
      comparedSourceIds: ["x", "y"],
      passed: true,
    });

    const retrieved = getPlagiarismCheckById(check.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.similarityScore).toBe(75);
  });

  it("getLatestPlagiarismCheck returns null when no checks exist", () => {
    const check = getLatestPlagiarismCheck(userId, postId, versionId);
    expect(check).toBeNull();
  });
});

describe("SeoAnalysis Model", () => {
  let userId: string;
  let categoryId: string;
  let postId: string;
  let versionId: string;

  beforeEach(() => {
    const ts = Date.now();
    userId = insertTestUser(`sa-${ts}-${randomUUID()}@test.com`);
    categoryId = createCategory(userId, {
      name: "test-cat-" + randomUUID(),
    }).id;
    postId = createPost(userId, {
      categoryId,
      locationName: "Test Location",
      overallNote: "Test note",
    }).id;

    const version = createPostVersionNext(userId, postId, {
      title: "Test Version",
      contentMarkdown: "Content for test. " + "x".repeat(200),
    });
    versionId = version.id;
  });

  it("createSeoAnalysis stores suggestions as JSON string", () => {
    const suggestions = ["Add more keywords", "Improve title length", "Fix readability"];
    const analysis = createSeoAnalysis(userId, postId, versionId, {
      keywordDensityScore: 75,
      titleOptimizationScore: 80,
      metaDescriptionScore: 85,
      readabilityScore: 70,
      internalLinksScore: 65,
      overallScore: 75,
      suggestions,
    });

    expect(analysis.suggestions).toBe(JSON.stringify(suggestions));
    const parsed = JSON.parse(analysis.suggestions);
    expect(parsed).toEqual(suggestions);
  });

  it("createSeoAnalysis stores all score fields correctly", () => {
    const analysis = createSeoAnalysis(userId, postId, versionId, {
      keywordDensityScore: 65,
      titleOptimizationScore: 72,
      metaDescriptionScore: 88,
      readabilityScore: 79,
      internalLinksScore: 61,
      overallScore: 73,
      suggestions: [],
    });

    expect(analysis.keywordDensityScore).toBe(65);
    expect(analysis.titleOptimizationScore).toBe(72);
    expect(analysis.metaDescriptionScore).toBe(88);
    expect(analysis.readabilityScore).toBe(79);
    expect(analysis.internalLinksScore).toBe(61);
    expect(analysis.overallScore).toBe(73);
  });

  it("getLatestSeoAnalysis returns the most recent analysis", () => {
    const analysis1 = createSeoAnalysis(userId, postId, versionId, {
      keywordDensityScore: 50,
      titleOptimizationScore: 50,
      metaDescriptionScore: 50,
      readabilityScore: 50,
      internalLinksScore: 50,
      overallScore: 50,
      suggestions: ["First suggestion"],
    });

    const analysis2 = createSeoAnalysis(userId, postId, versionId, {
      keywordDensityScore: 90,
      titleOptimizationScore: 90,
      metaDescriptionScore: 90,
      readabilityScore: 90,
      internalLinksScore: 90,
      overallScore: 90,
      suggestions: ["Second suggestion"],
    });

    const latest = getLatestSeoAnalysis(userId, postId, versionId);
    expect(latest!.id).toBe(analysis2.id);
    expect(latest!.overallScore).toBe(90);
  });

  it("getSeoAnalysisById retrieves a specific analysis", () => {
    const analysis = createSeoAnalysis(userId, postId, versionId, {
      keywordDensityScore: 80,
      titleOptimizationScore: 80,
      metaDescriptionScore: 80,
      readabilityScore: 80,
      internalLinksScore: 80,
      overallScore: 80,
      suggestions: ["Improve"],
    });

    const retrieved = getSeoAnalysisById(analysis.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.overallScore).toBe(80);
  });

  it("getLatestSeoAnalysis returns null when no analyses exist", () => {
    const analysis = getLatestSeoAnalysis(userId, postId, versionId);
    expect(analysis).toBeNull();
  });
});
