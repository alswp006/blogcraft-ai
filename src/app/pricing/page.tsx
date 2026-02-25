import { PricingDisplay } from "@/components/landing/pricing-display";
import { Footer } from "@/components/landing/footer";
import { generateMetadata as seo } from "@/lib/seo";

export const metadata = seo({
  title: "요금제 — BlogCraft AI",
  description: "BlogCraft AI의 무료, Pro, Enterprise 요금제를 비교하고 나에게 맞는 플랜을 선택하세요.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <section className="w-full py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
              합리적인 요금제
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              무료로 시작하고, 필요에 따라 업그레이드하세요. 신용카드 불필요.
            </p>
          </div>
          <PricingDisplay />
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-20 bg-[var(--bg-elevated)]/50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text)] text-center mb-10">
            자주 묻는 질문
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "무료 플랜에서 Pro로 업그레이드하면 기존 글은 어떻게 되나요?",
                a: "기존에 작성한 모든 글은 유지됩니다. 업그레이드 즉시 Pro 기능을 사용할 수 있습니다.",
              },
              {
                q: "구독을 취소하면 어떻게 되나요?",
                a: "결제 기간이 끝날 때까지 Pro 기능을 계속 사용할 수 있고, 이후 무료 플랜으로 전환됩니다.",
              },
              {
                q: "환불이 가능한가요?",
                a: "구독 후 7일 이내에 요청하시면 전액 환불해 드립니다.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
