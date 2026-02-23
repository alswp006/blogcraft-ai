"use client";

import { useState } from "react";
import Link from "next/link";

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

const stripeEnabled = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function PricingSection({ plans }: PricingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!stripeEnabled) return;
    setLoading(priceId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  };

  const isFree = (price: string) => price === "₩0" || price === "Free" || price === "무료";
  const isCustom = (price: string) => price === "맞춤" || price === "Custom";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative rounded-2xl flex flex-col transition-all duration-300 ${
            plan.highlighted
              ? "border-2 border-[var(--accent)] bg-[var(--bg-card)] shadow-2xl shadow-[var(--accent)]/15 hover:shadow-[var(--accent)]/25"
              : "border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30 hover:shadow-xl hover:shadow-black/20"
          }`}
        >
          {plan.highlighted && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 text-xs font-semibold rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30">
                Most Popular
              </span>
            </div>
          )}

          <div className={`p-6 md:p-8 flex flex-col flex-1 ${plan.highlighted ? "pt-10" : ""}`}>
            <div className="space-y-1 mb-5">
              <h3 className="text-base font-semibold text-[var(--text)]">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {plan.description}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className={`text-3xl font-bold ${plan.highlighted ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
                  {plan.price}
                </span>
                {!isFree(plan.price) && !isCustom(plan.price) && (
                  <span className="text-sm text-[var(--text-muted)] mb-1">/월</span>
                )}
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-[var(--accent)]" : "text-[var(--success)]"}`}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <div>
              {!stripeEnabled ? (
                <Link
                  href="/signup"
                  className={`block text-center text-sm font-semibold px-6 py-3 rounded-xl no-underline transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent)]/25"
                      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                  }`}
                >
                  {isFree(plan.price) ? "무료로 시작하기" : isCustom(plan.price) ? "영업팀 문의" : "시작하기"}
                </Link>
              ) : isFree(plan.price) ? (
                <Link
                  href="/signup"
                  className="block text-center text-sm font-medium px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all duration-200"
                >
                  무료로 시작하기
                </Link>
              ) : isCustom(plan.price) ? (
                <a
                  href="mailto:sales@blogcraft.ai"
                  className="block text-center text-sm font-medium px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-elevated)] hover:text-[var(--text)] transition-all duration-200"
                >
                  영업팀 문의
                </a>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={loading === plan.priceId}
                  className={`w-full text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    plan.highlighted
                      ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent)]/25"
                      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.priceId ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      이동 중...
                    </span>
                  ) : "시작하기"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
