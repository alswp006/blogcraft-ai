import { PricingSection } from "@/components/pricing-section";
import type { Plan } from "@/components/pricing-section";
import { generateMetadata as seo } from "@/lib/seo";

export const metadata = seo({
  title: "Pricing",
  description: "Choose the plan that works for you. Start free, upgrade when you need more.",
  path: "/pricing",
});

const plans: Plan[] = [
  {
    name: "Free",
    price: "Free",
    description: "Get started with the basics",
    features: [
      "3 AI blog posts per month",
      "Basic SEO suggestions",
      "Community support",
      "1 blog project",
    ],
    priceId: "",
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professionals who need more",
    features: [
      "Unlimited AI blog posts",
      "Advanced SEO optimization",
      "Priority support",
      "Unlimited projects",
      "Voice style learning",
      "Advanced analytics",
    ],
    priceId: "price_pro_monthly",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "All Pro features",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Team collaboration",
    ],
    priceId: "price_enterprise",
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="w-full py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text)]">
              Simple, transparent pricing
            </h1>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] max-w-lg mx-auto">
              Choose the plan that works for you. Start free, upgrade as you grow.
            </p>
          </div>
          <PricingSection plans={plans} />
        </div>
      </section>
    </div>
  );
}
