"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("카테고리 이름을 입력하세요."); return; }

    setCreating(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      await fetchCategories();
    } else {
      const data = await res.json();
      setError(data.error || "생성 실패");
    }
    setCreating(false);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("카테고리를 삭제하시겠습니까? 관련 학습 샘플과 스타일 프로필도 함께 삭제됩니다.")) return;
    setDeletingId(categoryId);
    const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
    if (res.ok) {
      await fetchCategories();
    }
    setDeletingId(null);
  };

  if (loading) {
    return <div className="w-full py-20 text-center text-[var(--text-muted)]">불러오는 중...</div>;
  }

  return (
    <div className="w-full py-10">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              대시보드
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-[var(--text)]">카테고리 관리</h1>
        </div>

        {/* Create Form */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">새 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                placeholder="카테고리 이름 (예: 맛집, 카페, 여행)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              <Input
                placeholder="설명 (선택)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? "생성 중..." : "카테고리 추가"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category List */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)] mb-2">아직 카테고리가 없습니다.</p>
            <p className="text-sm text-[var(--text-muted)]">위 폼에서 첫 번째 카테고리를 만들어 보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <Card key={cat.id} className="group">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/categories/${cat.id}`}
                        className="text-base font-medium text-[var(--text)] hover:text-[var(--accent)] no-underline transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {cat.description && (
                        <p className="text-sm text-[var(--text-muted)] mt-1 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {new Date(cat.createdAt).toLocaleDateString("ko-KR")}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="text-[var(--text-muted)] hover:text-red-500"
                      >
                        {deletingId === cat.id ? "삭제 중..." : "삭제"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
