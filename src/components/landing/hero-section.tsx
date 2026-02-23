import Link from "next/link";

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
  ctaText = "Get Started",
  ctaHref = "/signup",
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[70vh] flex items-center bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 hero-grid-bg opacity-50" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full flex flex-col items-center text-center space-y-8 py-20 md:py-28">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {headline}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-[var(--text-secondary)] max-w-2xl">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href={ctaHref}
            className="px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-medium text-base no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
          >
            {ctaText}
          </Link>
          {secondaryCtaText && secondaryCtaHref && (
            <Link
              href={secondaryCtaHref}
              className="px-8 py-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-base no-underline hover:bg-[var(--bg-card)] transition-colors"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
