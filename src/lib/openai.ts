import type OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (_openai) return _openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const OpenAILib = require("openai").default as typeof import("openai").default;
  _openai = new OpenAILib({ apiKey: key });
  return _openai;
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateStyleProfile(
  samples: { rawText: string }[],
): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const sampleTexts = samples
    .map((s, i) => `--- 샘플 ${i + 1} ---\n${s.rawText.slice(0, 2000)}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `당신은 블로그 글 스타일 분석 전문가입니다. 주어진 블로그 샘플들을 분석하여 글쓰기 스타일 프로필을 JSON으로 생성합니다.

반드시 다음 JSON 구조로 응답하세요:
{
  "tone": "글의 전반적인 톤 (예: 친근한, 전문적인, 캐주얼한)",
  "sentenceStyle": "문장 스타일 특징",
  "vocabularyLevel": "어휘 수준 (초급/중급/고급)",
  "paragraphStructure": "단락 구성 패턴",
  "expressionPatterns": ["자주 사용되는 표현 패턴들"],
  "emojiUsage": "이모지 사용 빈도와 패턴",
  "headingStyle": "제목/소제목 스타일",
  "photoDescriptionStyle": "사진 설명 방식",
  "callToAction": "독자 참여 유도 패턴",
  "uniqueTraits": ["이 작성자만의 고유한 특징들"]
}`,
      },
      {
        role: "user",
        content: `다음 블로그 샘플들의 글쓰기 스타일을 분석해주세요:\n\n${sampleTexts}`,
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? "{}";
}

export async function generatePostContent(params: {
  styleProfile: string;
  locationName: string;
  overallNote: string;
  photos: { originalFileName: string; memo: string }[];
  crawlSummary?: string;
  crawlSources?: { provider: string; snippetText: string }[];
  promptNote?: string;
}): Promise<{ title: string; contentMarkdown: string }> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error("OpenAI API key is not configured");
  }

  const photoDescriptions = params.photos
    .map((p, i) => `사진 ${i + 1}: ${p.memo || p.originalFileName}`)
    .join("\n");

  const crawlInfo = params.crawlSummary
    ? `\n\n참고 자료 요약:\n${params.crawlSummary}`
    : "";

  const sourceSnippets = params.crawlSources?.length
    ? `\n\n수집된 정보:\n${params.crawlSources.map((s) => `[${s.provider}] ${s.snippetText}`).join("\n")}`
    : "";

  const additionalNote = params.promptNote
    ? `\n\n추가 요청: ${params.promptNote}`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `당신은 블로그 글 작성 전문가입니다. 주어진 스타일 프로필에 맞춰 장소 리뷰 블로그 글을 작성합니다.

반드시 다음 JSON 구조로 응답하세요:
{
  "title": "블로그 글 제목",
  "contentMarkdown": "마크다운 형식의 블로그 글 본문 (1500-3000자)"
}

글 작성 규칙:
- 스타일 프로필의 톤과 표현 패턴을 따를 것
- 사진 설명을 자연스럽게 본문에 통합
- SEO를 고려한 제목과 소제목 사용
- 장소명을 자연스럽게 반복 (키워드 밀도)
- 수집된 정보를 참고하되 표절하지 않을 것`,
      },
      {
        role: "user",
        content: `스타일 프로필:\n${params.styleProfile}\n\n장소: ${params.locationName}\n작성자 메모: ${params.overallNote}\n\n사진 목록:\n${photoDescriptions}${crawlInfo}${sourceSnippets}${additionalNote}`,
      },
    ],
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || params.locationName,
      contentMarkdown: parsed.contentMarkdown || "",
    };
  } catch {
    return { title: params.locationName, contentMarkdown: content };
  }
}
