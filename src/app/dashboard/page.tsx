import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listPostsByUser } from "@/lib/models/post";
import { getSubscriptionTier } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateMetadata as seo } from "@/lib/seo";

export const metadata = seo({
  title: "대시보드 — BlogCraft AI",
  description: "내 블로그 글을 관리하고 새 글을 작성하세요.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    // Stale session — redirect with logged_out param so middleware
    // clears the cookie instead of redirecting back here in a loop.
    redirect("/login?logged_out");
  }

  const posts = listPostsByUser(String(user.id));
  const tier = getSubscriptionTier(user.id);

  const stats = [
    { label: "전체 글", value: posts.length },
    { label: "작성 중", value: posts.filter((p) => p.status === "draft").length },
    { label: "완성됨", value: posts.filter((p) => p.status === "generated" || p.status === "exported").length },
  ];

  const tierLabels: Record<string, string> = {
    free: "무료",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  return (
    <div className="w-full py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              안녕하세요, {user.name}님
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              오늘도 멋진 블로그 글을 작성해 보세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {tierLabels[tier] ?? tier} 플랜
            </Badge>
            {tier === "free" && (
              <Button size="sm" asChild>
                <Link href="/pricing" className="no-underline">업그레이드</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-[var(--text)] mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent posts or empty state */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-16 gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 16 16" fill="none" className="text-[var(--accent)]">
                  <path
                    d="M13 2L9 6M3 10l4-4M3 13h3l7-7-3-3-7 7v3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
                  아직 작성한 글이 없어요
                </h2>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                  사진과 메모를 업로드하면 AI가 자연스러운 블로그 글을 만들어 드립니다.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard" className="no-underline">첫 글 작성하기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">최근 글</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.slice(0, 9).map((post) => {
                const statusLabels: Record<string, { text: string; variant: "default" | "secondary" | "outline" }> = {
                  draft: { text: "작성 중", variant: "secondary" },
                  generated: { text: "완성됨", variant: "default" },
                  exported: { text: "발행됨", variant: "outline" },
                };
                const status = statusLabels[post.status] ?? statusLabels.draft;

                return (
                  <Card key={post.id} className="group hover:border-[var(--accent)]/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">
                          {post.title || "제목 없음"}
                        </CardTitle>
                        <Badge variant={status.variant} className="flex-shrink-0 text-xs">
                          {status.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {post.locationName && (
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          📍 {post.locationName}
                        </p>
                      )}
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(post.updatedAt).toLocaleDateString("ko-KR")}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
