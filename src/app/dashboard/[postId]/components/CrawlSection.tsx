"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CrawlSource = {
  id: string;
  provider: string;
  sourceUrl: string | null;
  snippetText: string;
  rating: number | null;
};

type CrawlSummary = {
  id: string;
  totalCount: number;
  averageRating: number | null;
  summaryText: string;
};

const PROVIDER_LABELS: Record<string, string> = {
  naver: "네이버",
  kakao: "카카오",
  google: "구글",
  blog: "블로그",
};

export function CrawlSection({
  postId,
  crawlSummary,
  crawlSources,
  onCrawlUpdate,
}: {
  postId: string;
  crawlSummary: CrawlSummary | null;
  crawlSources: CrawlSource[];
  onCrawlUpdate: (summary: CrawlSummary, sources: CrawlSource[]) => void;
}) {
  const [crawling, setCrawling] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCrawl = async () => {
    setCrawling(true);
    const res = await fetch(`/api/posts/${postId}/crawl`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      onCrawlUpdate(data.summary, data.sources);
    }
    setCrawling(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">자료 수집</CardTitle>
          <Button size="sm" onClick={handleCrawl} disabled={crawling}>
            {crawling ? "수집 중..." : crawlSummary ? "재수집" : "자료 수집"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {crawlSummary ? (
          <div className="space-y-3">
            <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
              <p className="text-sm text-[var(--text-secondary)]">{crawlSummary.summaryText}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline">{crawlSummary.totalCount}개 수집</Badge>
                {crawlSummary.averageRating && (
                  <Badge variant="secondary">평균 {crawlSummary.averageRating}점</Badge>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? "소스 접기" : `소스 보기 (${crawlSources.length}건)`}
            </Button>

            {expanded && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {crawlSources.map((source) => (
                  <div
                    key={source.id}
                    className="p-2 rounded border border-[var(--border)] text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {PROVIDER_LABELS[source.provider] ?? source.provider}
                      </Badge>
                      {source.rating != null && (
                        <span className="text-[var(--text-muted)]">
                          {source.rating.toFixed(1)}점
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] line-clamp-2">
                      {source.snippetText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            자료 수집 버튼을 눌러 장소 관련 정보를 수집하세요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
