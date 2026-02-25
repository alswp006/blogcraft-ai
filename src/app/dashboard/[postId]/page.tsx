"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { use } from "react";
import { PhotosSection } from "./components/PhotosSection";
import { CrawlSection } from "./components/CrawlSection";
import { GenerationSection } from "./components/GenerationSection";
import { ExportSection } from "./components/ExportSection";

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

type Photo = {
  id: string;
  originalFileName: string;
  storedFilePath: string;
  memo: string;
  sortOrder: number;
};

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

const STATUS_MAP: Record<string, { text: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { text: "작성 중", variant: "secondary" },
  generated: { text: "완성됨", variant: "default" },
  exported: { text: "발행됨", variant: "outline" },
};

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [crawlSummary, setCrawlSummary] = useState<CrawlSummary | null>(null);
  const [crawlSources, setCrawlSources] = useState<CrawlSource[]>([]);
  const [plagiarismCheck, setPlagiarismCheck] = useState<PlagiarismCheck | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setPost(d.post);
          setPhotos(d.photos ?? []);
          setCrawlSummary(d.crawlSummary ?? null);
          setCrawlSources(d.crawlSources ?? []);
          setPlagiarismCheck(d.plagiarismCheck ?? null);
          setSeoAnalysis(d.seoAnalysis ?? null);
          setTitleDraft(d.post.title);
          setNoteDraft(d.post.overallNote);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [postId]);

  const saveField = async (data: Record<string, string>) => {
    setSaving(true);
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { post: updated } = await res.json();
      setPost(updated);
    }
    setSaving(false);
  };

  const handleTitleSave = () => {
    setEditingTitle(false);
    if (titleDraft !== post?.title) {
      saveField({ title: titleDraft });
    }
  };

  const handleNoteSave = () => {
    setEditingNote(false);
    if (noteDraft !== post?.overallNote) {
      saveField({ overallNote: noteDraft });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center text-[var(--text-muted)]">불러오는 중...</div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-[var(--text-muted)] mb-4">글을 찾을 수 없습니다.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="no-underline">대시보드로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const status = STATUS_MAP[post.status] ?? STATUS_MAP.draft;

  return (
    <div className="w-full py-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              대시보드
            </Link>
          </Button>
          <Badge variant={status.variant}>{status.text}</Badge>
          {saving && <span className="text-xs text-[var(--text-muted)]">저장 중...</span>}
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            {editingTitle ? (
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => { if (e.key === "Enter") handleTitleSave(); }}
                className="text-2xl font-bold"
                placeholder="제목을 입력하세요"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => { setTitleDraft(post.title); setEditingTitle(true); }}
                className="text-2xl font-bold text-[var(--text)] cursor-text hover:bg-[var(--bg-elevated)] rounded-lg px-2 py-1 -mx-2 transition-colors"
              >
                {post.title || <span className="text-[var(--text-muted)]">제목을 입력하세요</span>}
              </h1>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>📍</span>
            <span>{post.locationName}</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-muted)]">
              {new Date(post.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>

          {/* Photos (drag-drop) */}
          <PhotosSection
            postId={postId}
            photos={photos}
            onPhotosChange={setPhotos}
          />

          {/* Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">메모</CardTitle>
            </CardHeader>
            <CardContent>
              {editingNote ? (
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onBlur={handleNoteSave}
                  rows={4}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => { setNoteDraft(post.overallNote); setEditingNote(true); }}
                  className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap cursor-text hover:bg-[var(--bg-elevated)] rounded-lg p-2 -m-2 transition-colors min-h-[60px]"
                >
                  {post.overallNote || <span className="text-[var(--text-muted)]">메모를 입력하세요</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crawl */}
          <CrawlSection
            postId={postId}
            crawlSummary={crawlSummary}
            crawlSources={crawlSources}
            onCrawlUpdate={(summary, sources) => {
              setCrawlSummary(summary);
              setCrawlSources(sources);
            }}
          />

          {/* AI Generation + Analysis */}
          <GenerationSection
            postId={postId}
            post={post}
            plagiarismCheck={plagiarismCheck}
            seoAnalysis={seoAnalysis}
            onGenerated={(data) => {
              setPost(data.post);
              setPlagiarismCheck(data.plagiarismCheck);
              setSeoAnalysis(data.seoAnalysis);
              setTitleDraft(data.post.title);
            }}
          />

          {/* Export */}
          <ExportSection
            postId={postId}
            status={post.status}
            hasPhotos={photos.length > 0}
          />

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-[var(--border)]">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)]">정말 삭제하시겠습니까?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "삭제 중..." : "삭제"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  취소
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="text-[var(--text-muted)]">
                글 삭제
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
