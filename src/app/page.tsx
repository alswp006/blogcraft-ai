import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { PricingDisplay } from "@/components/landing/pricing-display";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { generateMetadata as seo } from "@/lib/seo";

export const metadata = seo({
  title: "BlogCraft AI — AI 블로그 작성 도구",
  description:
    "사진과 메모로 내 말투를 학습한 AI가 10분 만에 자연스러운 블로그 글을 만들고, SEO 최적화와 수익화까지 자동으로 도와줍니다.",
  path: "/",
});

const FEATURES = [
  {
    icon: "📸",
    title: "사진으로 글 시작",
    description:
      "사진을 업로드하면 AI가 장소와 상황을 분석해 자연스러운 도입부를 작성합니다.",
  },
  {
    icon: "🤖",
    title: "AI 자동 글 작성",
    description:
      "메모 몇 줄이면 SEO에 최적화된 완성도 높은 블로그 글이 10분 만에 완성됩니다.",
  },
  {
    icon: "✍️",
    title: "말투 학습",
    description:
      "내 기존 글을 학습해 나만의 말투와 문체로 자연스럽게 글을 생성합니다.",
  },
  {
    icon: "📊",
    title: "SEO 자동 최적화",
    description:
      "키워드 분석, 메타 태그, 구조화 데이터까지 검색 엔진 최적화를 자동으로 처리합니다.",
  },
  {
    icon: "💰",
    title: "수익화 지원",
    description:
      "애드센스 배치 최적화와 제휴 링크 삽입으로 블로그 수익화를 도와드립니다.",
  },
  {
    icon: "📈",
    title: "분석 대시보드",
    description:
      "조회수, 유입 키워드, 수익 현황을 한눈에 파악할 수 있는 대시보드를 제공합니다.",
  },
];

export default function HomePage() {
  return (
    <>
      <div className="-mt-16">
        <HeroSection
          headline="AI로 블로그 글 완성"
          subheadline="사진과 메모만으로 내 말투를 학습한 AI가 자연스러운 블로그 글을 만들어 드립니다."
          ctaText="무료로 시작하기"
          ctaHref="/signup"
          secondaryCtaText="기능 살펴보기"
          secondaryCtaHref="/#features"
        />
      </div>

      {/* How it works */}
      <section className="w-full py-24 relative">
        <div className="section-gradient-divider w-full absolute top-0" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[var(--accent)] mb-3 uppercase tracking-widest">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
              3단계로 완성
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              복잡한 과정 없이 간단하게 블로그 글을 완성하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "사진 & 메모 업로드",
                description: "방문한 장소의 사진과 간단한 메모를 올려주세요.",
                gradient: "from-blue-500/20 to-indigo-500/20",
              },
              {
                step: "02",
                title: "AI가 글 작성",
                description: "내 말투로 SEO에 최적화된 블로그 글을 자동 생성합니다.",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                step: "03",
                title: "수정 & 발행",
                description: "생성된 글을 확인하고 수정한 뒤 바로 발행하세요.",
                gradient: "from-emerald-500/20 to-teal-500/20",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
                )}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} border border-[var(--border)] text-xl font-bold text-[var(--text)] mb-5`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="features">
        <FeatureGrid features={FEATURES} />
      </div>

      {/* Pricing */}
      <section className="w-full py-24 relative">
        <div className="section-gradient-divider w-full absolute top-0" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[var(--accent)] mb-3 uppercase tracking-widest">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">
              합리적인 요금제
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              무료로 시작하고, 필요에 따라 업그레이드하세요
            </p>
          </div>
          <PricingDisplay />
        </div>
      </section>

      <CtaSection />
      <Footer />
    </>
  );
}
