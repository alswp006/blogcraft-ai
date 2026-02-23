import { getCurrentUser, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    await destroySession();
    redirect("/login?logged_out");
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      value: "0",
      label: "전체 게시물",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: "text-[var(--text)]",
      iconBg: "bg-[var(--bg-elevated)]",
    },
    {
      value: "0",
      label: "발행됨",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "text-[var(--success)]",
      iconBg: "bg-[var(--success-soft)]",
    },
    {
      value: "0",
      label: "임시저장",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: "text-[var(--warning)]",
      iconBg: "bg-[var(--warning-soft)]",
    },
    {
      value: "Free",
      label: "현재 플랜",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: "text-[var(--accent)]",
      iconBg: "bg-[var(--accent-soft)]",
    },
  ];

  return (
    <section className="w-full py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">대시보드</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              돌아오셨군요, <span className="text-[var(--text)] font-medium">{user.name || user.email}</span>님
            </p>
          </div>
          <Link
            href="/pricing"
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] hover:text-[var(--text)] transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            업그레이드
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} ${stat.color} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/15 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[var(--accent)]">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">{user.name || "이름 미설정"}</h2>
              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[var(--border)]">
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">이메일</p>
              <p className="text-sm text-[var(--text)]">{user.email}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">이름</p>
              <p className="text-sm text-[var(--text)]">{user.name || "미설정"}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">가입일</p>
              <p className="text-sm text-[var(--text)]">{joinDate}</p>
            </div>
          </div>
        </div>

        {/* Empty State — Blog Posts */}
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-[var(--text)]">아직 게시물이 없습니다</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              사진과 메모를 업로드하고 AI와 함께 첫 번째 블로그 글을 작성해보세요.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              첫 게시물 작성하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
