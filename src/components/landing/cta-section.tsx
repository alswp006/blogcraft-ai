import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  heading: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function CtaSection({
  heading,
  description,
  ctaText = "무료로 시작하기",
  ctaHref = "/signup",
}: CtaSectionProps) {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden p-10 md:p-16 text-center space-y-6">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/12 via-purple-600/8 to-[var(--accent)]/5" />
          <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--accent)]/10 blur-3xl rounded-full" />

          <div className="relative space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">
              {heading}
            </h2>
            {description && (
              <p className="text-base leading-relaxed text-[var(--text-secondary)] max-w-lg mx-auto">
                {description}
              </p>
            )}
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="px-8 shadow-xl shadow-[var(--accent)]/30 hover:-translate-y-0.5">
              <Link href={ctaHref} className="no-underline inline-flex items-center gap-2">
                {ctaText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
          <p className="relative text-xs text-[var(--text-muted)]">
            신용카드 없이 무료로 시작 · 언제든지 취소 가능
          </p>
        </div>
      </div>
    </section>
  );
}
