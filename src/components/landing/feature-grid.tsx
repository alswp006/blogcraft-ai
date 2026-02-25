import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  heading?: string;
  subheading?: string;
  features: Feature[];
}

export function FeatureGrid({
  heading = "강력한 기능들",
  subheading = "블로그 작성의 모든 과정을 AI가 도와드립니다",
  features,
}: FeatureGridProps) {
  return (
    <section className="w-full py-24 relative">
      {/* Subtle top divider */}
      <div className="section-gradient-divider w-full absolute top-0" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--accent)] mb-3 uppercase tracking-widest">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-4">{heading}</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">{subheading}</p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 group cursor-default"
            >
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--accent)]/10 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
