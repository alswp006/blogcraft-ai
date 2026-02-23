import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaText = "무료로 시작하기",
  ctaHref = "/signup",
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/8 via-[var(--accent)]/3 to-transparent" />
      <div className="absolute inset-0 hero-grid-bg opacity-40" />
      {/* Decorative glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full flex flex-col items-center text-center space-y-8 py-24 md:py-32">
        {/* Badge */}
        <Badge variant="outline" className="px-4 py-2 rounded-full border-[var(--accent)]/25 bg-[var(--accent)]/8 text-[var(--accent)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse inline-block mr-2" />
          AI 말투 학습 기능 출시
        </Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-tight gradient-text">
          {headline}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-[var(--text-secondary)] max-w-2xl">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button asChild size="lg" className="px-8 py-4 h-auto text-base shadow-xl shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5">
            <Link href={ctaHref} className="no-underline">
              {ctaText}
            </Link>
          </Button>
          {secondaryCtaText && secondaryCtaHref && (
            <Button asChild variant="outline" size="lg" className="px-8 py-4 h-auto text-base border-[var(--border-hover)] hover:border-[var(--accent)]/30">
              <Link href={secondaryCtaHref} className="no-underline">
                {secondaryCtaText}
              </Link>
            </Button>
          )}
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-6 pt-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)]">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            신용카드 불필요
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)]">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            무료 플랜 제공
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--success)]">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            10분 만에 시작
          </span>
        </div>
      </div>
    </section>
  );
}
