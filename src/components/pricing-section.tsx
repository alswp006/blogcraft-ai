"use client";

import { useState } from "react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-2xl border bg-[var(--bg-card)] p-6 md:p-8 flex flex-col hover:shadow-lg transition-all duration-300 ${
            plan.highlighted
              ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/10"
              : "border-[var(--border)] hover:border-[var(--accent)]/30"
          }`}
        >
          {plan.highlighted && (
            <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-4">
              Most Popular
            </div>
          )}
          <h3 className="text-lg font-semibold text-[var(--text)]">
            {plan.name}
          </h3>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[var(--text)]">
              {plan.price}
            </span>
            {plan.price !== "Free" && plan.price !== "Custom" && (
              <span className="text-sm text-[var(--text-muted)] ml-1">/month</span>
            )}
          </div>
          {plan.description && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              {plan.description}
            </p>
          )}
          <ul className="mt-6 space-y-3 flex-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="text-sm text-[var(--text-secondary)] flex items-start gap-3"
              >
                <span className="text-[var(--success)] mt-0.5 shrink-0">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {!stripeEnabled ? (
              <span className="block text-center text-sm text-[var(--text-muted)] py-3 rounded-xl border border-[var(--border)]">
                Coming Soon
              </span>
            ) : plan.price === "Free" ? (
              <span className="block text-center text-sm text-[var(--text-muted)] py-3 rounded-xl border border-[var(--border)]">
                Current Plan
              </span>
            ) : plan.price === "Custom" ? (
              <a
                href="mailto:sales@example.com"
                className="block text-center text-sm px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium no-underline hover:bg-[var(--bg-card)] transition-all duration-200"
              >
                Contact Sales
              </a>
            ) : (
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full text-sm px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  plan.highlighted
                    ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent)]/25"
                    : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.priceId ? "Redirecting..." : "Get Started"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
