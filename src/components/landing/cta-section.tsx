import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function CtaSection({
  heading = "지금 바로 시작하세요",
  description = "사진 한 장으로 나만의 블로그 글을 완성하세요. 무료로 시작할 수 있습니다.",
  ctaText = "무료로 시작하기",
  ctaHref = "/signup",
}: CtaSectionProps) {
  return (
    <section className="w-full py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/10 via-purple-600/5 to-[var(--bg-card)] p-12 md:p-16 text-center">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.08] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">{heading}</h2>
            <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-xl mx-auto">{description}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="min-w-[200px] shadow-lg shadow-[var(--accent)]/25"
                asChild
              >
                <Link href={ctaHref} className="no-underline">
                  {ctaText}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="ml-1"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-[var(--text-muted)]">신용카드 불필요 · 언제든 취소 가능</p>
          </div>
        </div>
      </div>
    </section>
  );
}
