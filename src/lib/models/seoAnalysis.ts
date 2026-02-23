import { randomUUID } from "crypto";
import { queryOne, execute } from "@/lib/db";
import { isoNowMs } from "@/lib/time";

export type SeoAnalysis = {
  id: string;
  userId: string;
  postId: string;
  versionId: string;
  keywordDensityScore: number;
  titleOptimizationScore: number;
  metaDescriptionScore: number;
  readabilityScore: number;
  internalLinksScore: number;
  overallScore: number;
  suggestions: string; // JSON-serialized array of strings
  createdAt: number;
};

/**
 * Create an SEO analysis record for a post version.
 * Stores suggestions as a JSON array string.
 */
export function createSeoAnalysis(
  userId: string,
  postId: string,
  versionId: string,
  data: {
    keywordDensityScore: number;
    titleOptimizationScore: number;
    metaDescriptionScore: number;
    readabilityScore: number;
    internalLinksScore: number;
    overallScore: number;
    suggestions: string[];
  },
): SeoAnalysis {
  const id = randomUUID();
  const now = isoNowMs();
  const suggestionsJson = JSON.stringify(data.suggestions);

  execute(
    "INSERT INTO seo_analyses (id, userId, postId, versionId, keywordDensityScore, titleOptimizationScore, metaDescriptionScore, readabilityScore, internalLinksScore, overallScore, suggestions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    postId,
    versionId,
    data.keywordDensityScore,
    data.titleOptimizationScore,
    data.metaDescriptionScore,
    data.readabilityScore,
    data.internalLinksScore,
    data.overallScore,
    suggestionsJson,
    now,
  );

  return {
    id,
    userId,
    postId,
    versionId,
    keywordDensityScore: data.keywordDensityScore,
    titleOptimizationScore: data.titleOptimizationScore,
    metaDescriptionScore: data.metaDescriptionScore,
    readabilityScore: data.readabilityScore,
    internalLinksScore: data.internalLinksScore,
    overallScore: data.overallScore,
    suggestions: suggestionsJson,
    createdAt: now,
  };
}

/**
 * Get the latest SEO analysis for a post version.
 */
export function getLatestSeoAnalysis(
  userId: string,
  postId: string,
  versionId: string,
): SeoAnalysis | null {
  return (
    queryOne<SeoAnalysis>(
      "SELECT * FROM seo_analyses WHERE userId = ? AND postId = ? AND versionId = ? ORDER BY createdAt DESC, rowid DESC LIMIT 1",
      userId,
      postId,
      versionId,
    ) ?? null
  );
}

/**
 * Get an SEO analysis by ID.
 */
export function getSeoAnalysisById(analysisId: string): SeoAnalysis | null {
  return (
    queryOne<SeoAnalysis>("SELECT * FROM seo_analyses WHERE id = ?", analysisId) ??
    null
  );
}
