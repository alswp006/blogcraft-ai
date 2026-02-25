/**
 * Trigram-based cosine similarity plagiarism checker.
 * Threshold: 70% similarity = flagged.
 */

export type PlagiarismResult = {
  similarityScore: number; // 0-100
  passed: boolean;
  comparedSourceIds: string[];
};

export function checkPlagiarism(
  generatedText: string,
  sources: { id: string; snippetText: string }[],
): PlagiarismResult {
  if (sources.length === 0) {
    return { similarityScore: 0, passed: true, comparedSourceIds: [] };
  }

  const generatedTrigrams = getTrigrams(generatedText);
  let maxSimilarity = 0;
  const comparedSourceIds: string[] = [];

  for (const source of sources) {
    const sourceTrigrams = getTrigrams(source.snippetText);
    const similarity = cosineSimilarity(generatedTrigrams, sourceTrigrams);
    const similarityPct = Math.round(similarity * 100);

    if (similarityPct > 10) {
      comparedSourceIds.push(source.id);
    }

    if (similarityPct > maxSimilarity) {
      maxSimilarity = similarityPct;
    }
  }

  return {
    similarityScore: maxSimilarity,
    passed: maxSimilarity < 70,
    comparedSourceIds,
  };
}

function getTrigrams(text: string): Map<string, number> {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const trigrams = new Map<string, number>();

  for (let i = 0; i <= normalized.length - 3; i++) {
    const trigram = normalized.slice(i, i + 3);
    trigrams.set(trigram, (trigrams.get(trigram) ?? 0) + 1);
  }

  return trigrams;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  if (a.size === 0 || b.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [key, valA] of a) {
    normA += valA * valA;
    const valB = b.get(key);
    if (valB !== undefined) {
      dotProduct += valA * valB;
    }
  }

  for (const valB of b.values()) {
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
