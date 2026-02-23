import { PricingSection } from "@/components/pricing-section";
import type { Plan } from "@/components/pricing-section";
import { generateMetadata as seo } from "@/lib/seo";
import Link from "next/link";

export const metadata = seo({
  title: "요금제 — BlogCraft AI",
  description: "무료로 시작하고 필요할 때 업그레이드하세요. 신용카드 없이 시작 가능.",
  path: "/pricing",
});

const plans: Plan[] = [
  {
    name: "무료",
    price: "₩0",
    description: "블로그를 시작하는 분께 딱 맞는 플랜",
    features: [
      "월 3회 AI 블로그 작성",
      "기본 SEO 제안",
      "커뮤니티 지원",
      "1개 블로그 프로젝트",
    ],
    priceId: "",
  },
  {
    name: "Pro",
    price: "₩19,000",
    description: "더 많은 게시물과 고급 기능이 필요한 분께",
    features: [
      "무제한 AI 블로그 작성",
      "고급 SEO 최적화",
      "우선 지원",
      "무제한 프로젝트",
      "말투 학습 기능",
      "고급 분석 대시보드",
    ],
    priceId: "price_pro_monthly",
    highlighted: true,
  },
  {
    name: "기업",
    price: "맞춤",
    description: "팀과 조직을 위한 엔터프라이즈 솔루션",
    features: [
      "Pro 플랜 모든 기능 포함",
      "전담 계정 관리자",
      "맞춤 연동 개발",
      "SLA 보장",
      "팀 협업 기능",
    ],
    priceId: "price_enterprise",
  },
];

const faq = [
  {
    q: "무료 플랜은 어떤 기능을 제공하나요?",
    a: "월 3회의 AI 블로그 작성, 기본 SEO 제안, 1개의 블로그 프로젝트를 무료로 사용할 수 있습니다.",
  },
  {
    q: "언제든지 취소할 수 있나요?",
    a: "네, 언제든지 취소 가능합니다. 취소 후에도 남은 구독 기간 동안은 Pro 기능을 계속 사용할 수 있습니다.",
  },
  {
    q: "결제는 어떻게 이루어지나요?",
    a: "신용카드 또는 체크카드로 결제하실 수 있습니다. 모든 결제는 Stripe를 통해 안전하게 처리됩니다.",
  },
  {
    q: "기업 플랜은 어떻게 신청하나요?",
    a: "영업팀에 문의하시면 팀 규모와 필요에 맞는 맞춤 견적을 받으실 수 있습니다.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="w-full py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent" />
        <div className="absolute inset-0 hero-grid-bg opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/8 border border-[var(--accent)]/20 text-xs text-[var(--accent)]">
              투명한 요금제
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight gradient-text">
              심플한 요금제
            </h1>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] max-w-lg mx-auto">
              무료로 시작하고, 성장에 맞게 업그레이드하세요.
            </p>
          </div>
          <PricingSection plans={plans} />
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-20 md:py-28 bg-[var(--bg-elevated)]/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)]">자주 묻는 질문</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-5">
            {faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8 hover:border-[var(--border-hover)] transition-colors duration-200">
                <h3 className="text-base font-semibold text-[var(--text)] mb-3">{item.q}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-[var(--text-muted)] mb-6">
              더 궁금한 점이 있으신가요?
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
