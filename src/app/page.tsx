import { generateMetadata as seo } from "@/lib/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata = seo({
  title: "BlogCraft AI — AI 블로그 작성 도구",
  description: "사진과 메모로 내 말투를 학습한 AI가 10분 만에 자연스러운 블로그 글을 만들고, 검색 상위 노출과 수익화까지 돕는 도구",
  path: "/",
});

const stats = [
  { value: "10,000+", label: "활성 블로거" },
  { value: "150,000+", label: "발행된 게시물" },
  { value: "10분", label: "평균 작성 시간" },
  { value: "98%", label: "고객 만족도" },
];

export default function HomePage() {
  return (
    <div>
      <HeroSection
        headline="사진과 메모만으로 블로그 글 완성"
        subheadline="내 말투를 학습한 AI가 10분 만에 자연스러운 블로그 글을 만들고, SEO 최적화와 수익화까지 자동으로 도와줍니다."
        ctaText="무료로 시작하기"
        ctaHref="/signup"
        secondaryCtaText="로그인"
        secondaryCtaHref="/login"
      />

      {/* Stats Bar */}
      <section className="w-full border-y border-[var(--border)] bg-[var(--bg-elevated)]/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--border)]">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center space-y-2">
                <p className="text-3xl font-bold text-[var(--text)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/8 border border-[var(--accent)]/20 text-xs text-[var(--accent)] mb-2">
              간단한 3단계
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)]">
              3단계로 완성하는 블로그
            </h2>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] max-w-lg mx-auto">
              복잡한 과정 없이 간단하게 고품질 블로그 글을 작성하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                title: "사진 & 메모 업로드",
                desc: "블로그에 사용할 사진과 간단한 메모를 입력하세요. 키워드만으로도 충분합니다.",
              },
              {
                step: "02",
                title: "AI가 글 작성",
                desc: "내 말투를 학습한 AI가 자연스럽고 SEO에 최적화된 블로그 글을 자동 생성합니다.",
              },
              {
                step: "03",
                title: "발행 & 수익화",
                desc: "완성된 글을 검토하고 바로 발행하세요. 검색 상위 노출과 수익화를 도와줍니다.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8 space-y-4 hover:shadow-xl hover:shadow-black/20 hover:border-[var(--accent)]/25 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-7xl font-bold text-[var(--accent)]/8 absolute top-3 right-5 select-none leading-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid
        heading="강력한 기능들"
        subheading="블로그 작성부터 수익화까지 필요한 모든 것을 제공합니다."
        features={[
          {
            icon: "✍️",
            title: "AI 글 작성",
            description: "사진과 메모를 입력하면 내 말투에 맞는 자연스러운 블로그 글을 AI가 자동으로 작성합니다.",
          },
          {
            icon: "🔍",
            title: "SEO 최적화",
            description: "키워드 분석, 메타 태그, 구조화된 데이터를 자동 생성하여 검색 상위 노출을 도와줍니다.",
          },
          {
            icon: "💰",
            title: "수익화 지원",
            description: "광고 배치, 애드센스 연동, 트래픽 분석까지 블로그 수익화에 필요한 도구를 제공합니다.",
          },
          {
            icon: "🎙️",
            title: "말투 학습",
            description: "과거 글이나 음성 샘플로 내 고유한 글쓰기 스타일을 AI가 학습하여 진짜 내 글처럼 작성합니다.",
          },
          {
            icon: "🖼️",
            title: "이미지 최적화",
            description: "업로드한 사진을 자동으로 최적화하고, SEO에 맞는 alt 태그와 캡션을 생성합니다.",
          },
          {
            icon: "📊",
            title: "분석 대시보드",
            description: "조회수, 체류 시간, 전환율 등 핵심 지표를 한눈에 파악하고 콘텐츠 전략을 개선하세요.",
          },
        ]}
      />

      <CtaSection
        heading="지금 바로 시작하세요"
        description="무료로 가입하고 AI와 함께 첫 번째 블로그 글을 작성해보세요. 신용카드 필요 없습니다."
        ctaText="무료로 시작하기"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
