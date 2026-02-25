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
    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-[var(--bg)]">
      {/* Grid background */}
      <div className="absolute inset-0 hero-grid-bg opacity-60" />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500 opacity-[0.05] blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Announcement badge */}
          <div className="inline-flex mb-6">
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
            <Button size="lg" asChild className="min-w-[160px]">
              <Link href={ctaHref} className="no-underline">{ctaText}</Link>
            </Button>
            {secondaryCtaText && secondaryCtaHref && (
              <Button size="lg" variant="outline" asChild className="min-w-[160px]">
                <Link href={secondaryCtaHref} className="no-underline">{secondaryCtaText}</Link>
              </Button>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap gap-8 justify-center items-center">
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
      </div>
    </section>
  );
}
