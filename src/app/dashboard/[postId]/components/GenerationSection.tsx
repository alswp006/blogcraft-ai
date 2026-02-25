"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: string;
  title: string;
  locationName: string;
  overallNote: string;
  contentMarkdown: string;
  status: string;
  createdAt: number;
  updatedAt: number;
};

type PlagiarismCheck = {
  similarityScore: number;
  passed: number;
};

type SeoAnalysis = {
  keywordDensityScore: number;
  titleOptimizationScore: number;
  metaDescriptionScore: number;
  readabilityScore: number;
  internalLinksScore: number;
  overallScore: number;
  suggestions: string;
};

const SEO_LABELS: Record<string, string> = {
  keywordDensityScore: "키워드 밀도",
  titleOptimizationScore: "제목 최적화",
  metaDescriptionScore: "메타 설명",
  readabilityScore: "가독성",
  internalLinksScore: "내부 링크",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-muted)]">{score}점</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function GenerationSection({
  postId,
  post,
  plagiarismCheck,
  seoAnalysis,
  onGenerated,
}: {
  postId: string;
  post: Post;
  plagiarismCheck: PlagiarismCheck | null;
  seoAnalysis: SeoAnalysis | null;
  onGenerated: (data: {
    post: Post;
    plagiarismCheck: PlagiarismCheck;
    seoAnalysis: SeoAnalysis;
  }) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [promptNote, setPromptNote] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (isRegenerate: boolean) => {
    setGenerating(true);
    setError("");

    const url = isRegenerate
      ? `/api/posts/${postId}/regenerate`
      : `/api/posts/${postId}/generate`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptNote: promptNote.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      onGenerated(data);
      setPromptNote("");
    } else {
      const data = await res.json();
      setError(data.error || "생성 실패");
    }
    setGenerating(false);
  };

  const hasContent = post.status === "generated" || post.status === "exported";

  let suggestions: string[] = [];
  if (seoAnalysis?.suggestions) {
    try {
      suggestions = JSON.parse(seoAnalysis.suggestions);
    } catch {
      suggestions = [];
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">AI 글 생성</CardTitle>
          <div className="flex gap-2">
            {hasContent && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerate(true)}
                disabled={generating}
              >
                {generating ? "재생성 중..." : "재생성"}
              </Button>
            )}
            {!hasContent && (
              <Button
                size="sm"
                onClick={() => handleGenerate(false)}
                disabled={generating}
              >
                {generating ? "생성 중..." : "AI 글 생성"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Prompt Note for Regeneration */}
        {hasContent && (
          <div className="space-y-2">
            <Textarea
              placeholder="재생성 시 추가 요청사항 (예: 좀 더 친근한 톤으로 작성해주세요)"
              value={promptNote}
              onChange={(e) => setPromptNote(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Content Display */}
        {post.contentMarkdown ? (
          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-elevated)] p-4 rounded-lg max-h-96 overflow-y-auto">
            {post.contentMarkdown}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            아직 본문이 생성되지 않았습니다. AI 글 생성 버튼을 눌러 본문을 생성하세요.
          </p>
        )}

        {/* Analysis Results */}
        {(plagiarismCheck || seoAnalysis) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Plagiarism Check */}
            {plagiarismCheck && (
              <div className="p-3 bg-[var(--bg-elevated)] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text)]">표절 검사</span>
                  <Badge variant={plagiarismCheck.passed ? "default" : "destructive"}>
                    {plagiarismCheck.passed ? "통과" : "주의"}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  유사도: {plagiarismCheck.similarityScore}%
                </p>
              </div>
            )}

            {/* SEO Analysis */}
            {seoAnalysis && (
              <div className="p-3 bg-[var(--bg-elevated)] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text)]">SEO 분석</span>
                  <Badge variant={seoAnalysis.overallScore >= 60 ? "default" : "secondary"}>
                    {seoAnalysis.overallScore}점
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(SEO_LABELS).map(([key, label]) => (
                    <ScoreBar
                      key={key}
                      label={label}
                      score={seoAnalysis[key as keyof SeoAnalysis] as number}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <p className="text-xs font-medium text-[var(--text)] mb-2">개선 제안</p>
            <ul className="space-y-1">
              {suggestions.map((s, i) => (
                <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-2">
                  <span className="text-[var(--accent)]">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
