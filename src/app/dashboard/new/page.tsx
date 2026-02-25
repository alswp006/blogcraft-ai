"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string };

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [overallNote, setOverallNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!locationName.trim()) {
      setError("장소명을 입력해주세요.");
      return;
    }
    if (!overallNote.trim()) {
      setError("메모를 입력해주세요.");
      return;
    }
    if (!categoryId && !newCategoryName.trim()) {
      setError("카테고리를 선택하거나 새로 만들어주세요.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create post
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId || undefined,
          categoryName: newCategoryName.trim() || undefined,
          locationName: locationName.trim(),
          overallNote: overallNote.trim(),
        }),
      });

      if (!postRes.ok) {
        const d = await postRes.json();
        setError(d.error ?? "글 생성에 실패했습니다.");
        setSubmitting(false);
        return;
      }

      const { post } = await postRes.json();

      // 2. Upload photos
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("memo", "");
        await fetch(`/api/posts/${post.id}/photos`, {
          method: "POST",
          body: formData,
        });
      }

      // 3. Redirect to post detail
      router.push(`/dashboard/${post.id}`);
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
  };

  const isNewCategory = categoryId === "__new__";

  return (
    <div className="w-full py-10">
      <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              뒤로
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-[var(--text)]">새 글 작성</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Category */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (e.target.value !== "__new__") setNewCategoryName("");
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                >
                  <option value="">카테고리 선택...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="__new__">+ 새 카테고리 만들기</option>
                </select>
                {isNewCategory && (
                  <Input
                    placeholder="새 카테고리 이름"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">장소</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="예: 을지로 카페거리, 제주 협재해수욕장"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Note */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">메모</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="글에 포함하고 싶은 내용, 느낌, 키워드 등을 자유롭게 적어주세요."
                  value={overallNote}
                  onChange={(e) => setOverallNote(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">사진</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  사진 추가
                </Button>

                {files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {files.map((file, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-[var(--border)] aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[var(--text-muted)]">
                  {files.length > 0 ? `${files.length}장 선택됨` : "선택된 사진 없음 (선택사항)"}
                </p>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? "생성 중..." : "글 생성하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
