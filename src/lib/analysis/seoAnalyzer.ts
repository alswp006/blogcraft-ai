export type SeoScores = {
  keywordDensityScore: number;
  titleOptimizationScore: number;
  metaDescriptionScore: number;
  readabilityScore: number;
  internalLinksScore: number;
  overallScore: number;
  suggestions: string[];
};

export function analyzeSeo(
  title: string,
  contentMarkdown: string,
  locationName: string,
): SeoScores {
  const suggestions: string[] = [];
  const keyword = locationName.toLowerCase();
  const contentLower = contentMarkdown.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Keyword Density (target: 1-3%)
  const words = contentLower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keywordOccurrences = contentLower.split(keyword).length - 1;
  const keywordDensity = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0;

  let keywordDensityScore: number;
  if (keywordDensity >= 1 && keywordDensity <= 3) {
    keywordDensityScore = 90 + Math.round(Math.random() * 10);
  } else if (keywordDensity > 0.5) {
    keywordDensityScore = 60 + Math.round(Math.random() * 20);
  } else {
    keywordDensityScore = 30 + Math.round(Math.random() * 20);
    suggestions.push(`"${locationName}" 키워드를 본문에 더 자연스럽게 포함시켜 주세요.`);
  }

  // 2. Title Optimization
  let titleOptimizationScore = 50;
  if (titleLower.includes(keyword)) {
    titleOptimizationScore += 25;
  } else {
    suggestions.push(`제목에 "${locationName}" 키워드를 포함시켜 주세요.`);
  }
  if (title.length >= 10 && title.length <= 60) {
    titleOptimizationScore += 25;
  } else if (title.length > 60) {
    suggestions.push("제목이 너무 깁니다. 60자 이내로 줄여주세요.");
  } else {
    suggestions.push("제목이 너무 짧습니다. 10자 이상으로 작성해주세요.");
  }

  // 3. Meta Description (first 160 chars of content)
  const firstParagraph = contentMarkdown.split("\n\n")[0] ?? "";
  let metaDescriptionScore = 50;
  if (firstParagraph.length >= 50 && firstParagraph.length <= 160) {
    metaDescriptionScore = 85 + Math.round(Math.random() * 15);
  } else if (firstParagraph.length >= 30) {
    metaDescriptionScore = 60 + Math.round(Math.random() * 15);
  } else {
    suggestions.push("첫 단락을 50-160자 사이로 작성하면 메타 설명으로 활용하기 좋습니다.");
  }

  // 4. Readability
  const paragraphs = contentMarkdown.split("\n\n").filter(Boolean);
  const headings = contentMarkdown.match(/^#{1,3}\s/gm) ?? [];
  let readabilityScore = 50;

  if (paragraphs.length >= 5) readabilityScore += 15;
  if (headings.length >= 2) readabilityScore += 15;
  else suggestions.push("소제목(##)을 2개 이상 사용하면 가독성이 향상됩니다.");

  if (wordCount >= 300) readabilityScore += 10;
  else suggestions.push("본문을 300단어 이상으로 작성해주세요.");

  if (wordCount >= 500) readabilityScore += 10;

  // 5. Internal Links
  const linkCount = (contentMarkdown.match(/\[.*?\]\(.*?\)/g) ?? []).length;
  let internalLinksScore: number;
  if (linkCount >= 2) {
    internalLinksScore = 80 + Math.round(Math.random() * 20);
  } else if (linkCount >= 1) {
    internalLinksScore = 50 + Math.round(Math.random() * 20);
    suggestions.push("내부 링크를 1개 더 추가하면 SEO에 도움이 됩니다.");
  } else {
    internalLinksScore = 20 + Math.round(Math.random() * 20);
    suggestions.push("관련 글이나 참고 링크를 본문에 추가해주세요.");
  }

  // Clamp all scores
  keywordDensityScore = clamp(keywordDensityScore, 0, 100);
  titleOptimizationScore = clamp(titleOptimizationScore, 0, 100);
  metaDescriptionScore = clamp(metaDescriptionScore, 0, 100);
  readabilityScore = clamp(readabilityScore, 0, 100);
  internalLinksScore = clamp(internalLinksScore, 0, 100);

  const overallScore = Math.round(
    (keywordDensityScore +
      titleOptimizationScore +
      metaDescriptionScore +
      readabilityScore +
      internalLinksScore) /
      5,
  );

  return {
    keywordDensityScore,
    titleOptimizationScore,
    metaDescriptionScore,
    readabilityScore,
    internalLinksScore,
    overallScore,
    suggestions,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
