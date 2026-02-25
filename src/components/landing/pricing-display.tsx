import { PricingSection } from "@/components/pricing-section";

const DEFAULT_PLANS = [
  {
    name: "무료",
    price: "₩0",
    description: "블로그를 시작하는 분들을 위한 플랜",
    features: [
      "월 5개 게시물",
      "기본 AI 글 작성",
      "SEO 기본 최적화",
      "이미지 업로드",
    ],
    priceId: "",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₩19,900",
    description: "활발하게 블로그를 운영하는 분들을 위한 플랜",
    features: [
      "무제한 게시물",
      "고급 AI 글 작성",
      "SEO 고급 최적화",
      "말투 학습 기능",
      "수익화 지원",
      "분석 대시보드",
      "우선 고객 지원",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "맞춤",
    description: "팀 및 기업 고객을 위한 맞춤형 플랜",
    features: [
      "Pro 플랜 모든 기능",
      "팀 멤버 관리",
      "API 접근",
      "전담 계정 매니저",
      "맞춤 통합",
      "SLA 보장",
    ],
    priceId: "",
    highlighted: false,
  },
];

export function PricingDisplay() {
  return <PricingSection plans={DEFAULT_PLANS} />;
}
