import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({
  headline = "AI로 블로그 글 완성",
  subheadline = "사진과 메모만으로 내 말투를 학습한 AI가 자연스러운 블로그 글을 만들어 드립니다.",
  ctaText = "무료로 시작하기",
  ctaHref = "/signup",
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg)]">
      {/* Grid background */}
      <div className="absolute inset-0 hero-grid-bg opacity-60" />

      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500 opacity-[0.06] blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Announcement badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]">
              ✨ AI 블로그 작성 도구 — 베타 출시
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="gradient-text">{headline}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="min-w-[180px] shadow-lg shadow-[var(--accent)]/25">
              <Link href={ctaHref} className="no-underline">{ctaText}</Link>
            </Button>
            {secondaryCtaText && secondaryCtaHref && (
              <Button size="lg" variant="outline" asChild className="min-w-[180px]">
                <Link href={secondaryCtaHref} className="no-underline">{secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Editor mockup */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-[var(--bg-input)] text-xs text-[var(--text-muted)]">
                  blogcraft.ai/editor
                </div>
              </div>
              <div className="w-[52px]" />
            </div>

            {/* Editor content mockup */}
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[280px]">
              {/* Left sidebar */}
              <div className="hidden md:block md:col-span-1 border-r border-[var(--border)] p-4 space-y-3">
                <div className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">사진</div>
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[var(--border)] flex items-center justify-center text-2xl">📸</div>
                <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-[var(--border)] flex items-center justify-center text-2xl">🏞️</div>
                <div className="w-full h-8 rounded-lg border border-dashed border-[var(--border-hover)] flex items-center justify-center">
                  <span className="text-xs text-[var(--text-muted)]">+ 추가</span>
                </div>
              </div>

              {/* Main editor area */}
              <div className="md:col-span-3 p-6 space-y-4">
                <div className="h-7 w-3/4 rounded bg-[var(--text)]/10" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-[var(--text)]/6" />
                  <div className="h-4 w-full rounded bg-[var(--text)]/6" />
                  <div className="h-4 w-5/6 rounded bg-[var(--text)]/6" />
                </div>
                <div className="h-4 w-0" />
                <div className="space-y-2.5">
                  <div className="h-4 w-full rounded bg-[var(--text)]/6" />
                  <div className="h-4 w-full rounded bg-[var(--text)]/6" />
                  <div className="h-4 w-2/3 rounded bg-[var(--text)]/6" />
                </div>
              </div>

              {/* Right sidebar - AI assistant */}
              <div className="hidden md:block md:col-span-1 border-l border-[var(--border)] p-4">
                <div className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">AI 도우미</div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/20 p-3">
                    <div className="text-xs text-[var(--accent)] font-medium mb-1">말투 분석</div>
                    <div className="h-2 w-full rounded-full bg-[var(--accent)]/20">
                      <div className="h-2 w-4/5 rounded-full bg-[var(--accent)]" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-[var(--success-soft)] border border-[var(--success)]/20 p-3">
                    <div className="text-xs text-[var(--success)] font-medium mb-1">SEO 점수</div>
                    <div className="text-lg font-bold text-[var(--success)]">92</div>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-input)] border border-[var(--border)] p-3">
                    <div className="text-xs text-[var(--text-muted)] font-medium mb-1">예상 키워드</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">맛집</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">리뷰</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow under mockup */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-[var(--accent)] opacity-[0.06] blur-[80px] pointer-events-none" />
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-wrap gap-x-12 gap-y-4 justify-center items-center">
          {[
            { value: "10,000+", label: "활성 블로거" },
            { value: "150,000+", label: "게시물 작성" },
            { value: "10분", label: "평균 작성 시간" },
            { value: "98%", label: "만족도" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
