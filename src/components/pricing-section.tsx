"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Plan = {
  name: string;
  price: string;
  description?: string;
  features: string[];
  priceId: string;
  highlighted?: boolean;
};

interface PricingSectionProps {
  plans: Plan[];
}

function isFree(price: string) {
  return price === "₩0" || price === "0" || price.toLowerCase() === "free";
}

function isCustom(price: string) {
  return price === "맞춤" || price.toLowerCase() === "custom" || price.toLowerCase() === "contact";
}

export function PricingSection({ plans }: PricingSectionProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!priceId) return;
    setLoadingPlanId(priceId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      if (res.ok) {
        const data = await res.json() as { url?: string };
        if (data.url) window.location.href = data.url;
      } else {
        const err = await res.json() as { error?: string };
        alert(err.error ?? "결제를 시작할 수 없습니다.");
      }
    } catch {
      alert("오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={cn(
            "relative flex flex-col",
            plan.highlighted && "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10"
          )}
        >
          {plan.highlighted && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="px-3 py-1 text-xs font-semibold shadow-sm">
                가장 인기
              </Badge>
            </div>
          )}

          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
            )}
            <div className="mt-4">
              <span className="text-4xl font-bold text-[var(--text)]">{plan.price}</span>
              {!isFree(plan.price) && !isCustom(plan.price) && (
                <span className="text-[var(--text-muted)] text-sm ml-1">/월</span>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--success-soft)] flex items-center justify-center mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="var(--success)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-4">
            {isFree(plan.price) ? (
              <Button variant="outline" className="w-full" asChild>
                <a href="/signup" className="no-underline">무료로 시작하기</a>
              </Button>
            ) : isCustom(plan.price) ? (
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:hello@blogcraft.ai" className="no-underline">문의하기</a>
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loadingPlanId === plan.priceId}
              >
                {loadingPlanId === plan.priceId ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  "지금 시작하기"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
