"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = { id: string; name: string; description: string | null };
type LearningSample = {
  id: string;
  sourceType: string;
  sourceUrl: string | null;
  rawText: string;
  createdAt: number;
};
type StyleProfile = {
  id: string;
  profileJson: string;
  sampleCount: number;
  updatedAt: number;
};
type MonetizationTip = {
  id: string;
  recommendedMethod: string;
  tipText: string;
  updatedAt: number;
};

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  const [category, setCategory] = useState<Category | null>(null);
  const [samples, setSamples] = useState<LearningSample[]>([]);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [tip, setTip] = useState<MonetizationTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Learning sample form
  const [sampleText, setSampleText] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [addingSample, setAddingSample] = useState(false);
  const [sampleError, setSampleError] = useState("");

  // Style profile
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Monetization tip form
  const [tipMethod, setTipMethod] = useState("");
  const [tipText, setTipText] = useState("");
  const [savingTip, setSavingTip] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/categories`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/categories/${categoryId}/learning-samples`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/categories/${categoryId}/style-profile`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/categories/${categoryId}/monetization-tip`).then((r) => r.ok ? r.json() : null),
    ]).then(([catData, samplesData, profileData, tipData]) => {
      const cat = catData?.categories?.find((c: Category) => c.id === categoryId);
      if (!cat) { setNotFound(true); setLoading(false); return; }
      setCategory(cat);
      setSamples(samplesData?.samples ?? []);
      setProfile(profileData?.profile ?? null);
      if (tipData?.tip) {
        setTip(tipData.tip);
        setTipMethod(tipData.tip.recommendedMethod);
        setTipText(tipData.tip.tipText);
      }
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [categoryId]);

  const handleAddSample = async (e: React.FormEvent) => {
    e.preventDefault();
    setSampleError("");
    if (sampleText.length < 200) {
      setSampleError("본문은 200자 이상이어야 합니다.");
      return;
    }

    setAddingSample(true);
    const res = await fetch(`/api/categories/${categoryId}/learning-samples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType: sampleUrl ? "url" : "file",
        sourceUrl: sampleUrl || null,
        rawText: sampleText,
      }),
    });

    if (res.ok) {
      const { sample } = await res.json();
      setSamples((prev) => [sample, ...prev]);
      setSampleText("");
      setSampleUrl("");
    } else {
      const data = await res.json();
      setSampleError(data.error || "추가 실패");
    }
    setAddingSample(false);
  };

  const handleDeleteSample = async (sampleId: string) => {
    const res = await fetch(`/api/categories/${categoryId}/learning-samples/${sampleId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSamples((prev) => prev.filter((s) => s.id !== sampleId));
    }
  };

  const handleGenerateProfile = async () => {
    setProfileError("");
    setGeneratingProfile(true);
    const res = await fetch(`/api/categories/${categoryId}/style-profile/generate`, {
      method: "POST",
    });
    if (res.ok) {
      const { profile: newProfile } = await res.json();
      setProfile(newProfile);
    } else {
      const data = await res.json();
      setProfileError(data.error || "생성 실패");
    }
    setGeneratingProfile(false);
  };

  const handleSaveTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipMethod.trim() || !tipText.trim()) return;
    setSavingTip(true);
    const res = await fetch(`/api/categories/${categoryId}/monetization-tip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendedMethod: tipMethod.trim(), tipText: tipText.trim() }),
    });
    if (res.ok) {
      const { tip: newTip } = await res.json();
      setTip(newTip);
    }
    setSavingTip(false);
  };

  if (loading) {
    return <div className="w-full py-20 text-center text-[var(--text-muted)]">불러오는 중...</div>;
  }

  if (notFound || !category) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-[var(--text-muted)] mb-4">카테고리를 찾을 수 없습니다.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/categories" className="no-underline">카테고리 목록</Link>
        </Button>
      </div>
    );
  }

  let profileDisplay = null;
  if (profile) {
    try {
      profileDisplay = JSON.parse(profile.profileJson);
    } catch {
      profileDisplay = profile.profileJson;
    }
  }

  return (
    <div className="w-full py-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/categories" className="no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              카테고리
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-[var(--text)]">{category.name}</h1>
        </div>

        {category.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-6">{category.description}</p>
        )}

        <div className="space-y-8">
          {/* Learning Samples Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">학습 샘플 ({samples.length}개)</CardTitle>
                <Badge variant={samples.length >= 5 ? "default" : "secondary"}>
                  {samples.length >= 5 ? "학습 가능" : `${5 - samples.length}개 더 필요`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Sample Form */}
              <form onSubmit={handleAddSample} className="space-y-3 p-4 bg-[var(--bg-elevated)] rounded-lg">
                <Input
                  placeholder="출처 URL (선택)"
                  value={sampleUrl}
                  onChange={(e) => setSampleUrl(e.target.value)}
                />
                <Textarea
                  placeholder="블로그 글 본문을 붙여넣기 하세요 (200자 이상)"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  rows={5}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{sampleText.length}자</span>
                  <div className="flex items-center gap-2">
                    {sampleError && <span className="text-xs text-red-500">{sampleError}</span>}
                    <Button type="submit" size="sm" disabled={addingSample}>
                      {addingSample ? "추가 중..." : "샘플 추가"}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Sample List */}
              {samples.length > 0 && (
                <div className="space-y-2">
                  {samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {sample.sourceType === "url" ? "URL" : "파일"}
                          </Badge>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(sample.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                          {sample.rawText.slice(0, 150)}...
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSample(sample.id)}
                        className="text-[var(--text-muted)] hover:text-red-500 shrink-0"
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Profile Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">스타일 프로필</CardTitle>
                <Button
                  size="sm"
                  onClick={handleGenerateProfile}
                  disabled={samples.length < 5 || generatingProfile}
                >
                  {generatingProfile ? "분석 중..." : profile ? "재생성" : "스타일 분석"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profileError && (
                <p className="text-sm text-red-500 mb-3">{profileError}</p>
              )}
              {profile && profileDisplay ? (
                <div className="space-y-3">
                  <div className="text-xs text-[var(--text-muted)] mb-2">
                    샘플 {profile.sampleCount}개 기반 · {new Date(profile.updatedAt).toLocaleDateString("ko-KR")}
                  </div>
                  {typeof profileDisplay === "object" ? (
                    <div className="grid gap-2">
                      {Object.entries(profileDisplay).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm">
                          <span className="font-medium text-[var(--text)] min-w-[120px]">{key}:</span>
                          <span className="text-[var(--text-secondary)]">
                            {Array.isArray(value) ? (value as string[]).join(", ") : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap bg-[var(--bg-elevated)] p-3 rounded-lg">
                      {String(profileDisplay)}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  {samples.length < 5
                    ? "학습 샘플을 5개 이상 추가하면 스타일 분석이 가능합니다."
                    : "스타일 분석 버튼을 눌러 프로필을 생성하세요."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Monetization Tip Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">수익화 팁</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTip} className="space-y-3">
                <Input
                  placeholder="추천 수익화 방법 (예: 애드센스, 체험단, 협찬)"
                  value={tipMethod}
                  onChange={(e) => setTipMethod(e.target.value)}
                  maxLength={60}
                />
                <Textarea
                  placeholder="수익화 팁 내용"
                  value={tipText}
                  onChange={(e) => setTipText(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <Button type="submit" size="sm" disabled={savingTip}>
                  {savingTip ? "저장 중..." : tip ? "수정" : "저장"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
