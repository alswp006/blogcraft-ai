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
    <section className="w-full min-h-[70vh] flex items-center bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full flex flex-col items-center text-center space-y-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text)] max-w-3xl leading-tight">
          {headline}
        </h1>
        <p className="text-lg leading-relaxed text-[var(--text-secondary)] max-w-xl">
          {subheadline}
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href={ctaHref}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
          >
            {ctaText}
          </Link>
          {secondaryCtaText && secondaryCtaHref && (
            <Link
              href={secondaryCtaHref}
              className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm no-underline hover:bg-[var(--bg-card)] transition-colors"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
