import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumGateProps {
  children: React.ReactNode;
  hasAccess: boolean;
  featureName?: string;
}

export function PremiumGate({ children, hasAccess, featureName = "이 기능" }: PremiumGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="border-[var(--accent)]/30 bg-gradient-to-br from-[var(--bg-card)] to-[var(--accent-soft)]">
      <CardContent className="flex flex-col items-center text-center py-12 px-8 gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
            프리미엄 기능
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            {featureName}은(는) Pro 이상 플랜에서 사용 가능합니다. 업그레이드하여 모든 기능을 이용하세요.
          </p>
        </div>

        <Button asChild>
          <Link href="/pricing" className="no-underline">
            플랜 업그레이드
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
