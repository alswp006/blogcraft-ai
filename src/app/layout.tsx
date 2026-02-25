import "./globals.css";
import { Nav } from "@/components/ui/nav";
import { AdProvider } from "@/components/ad-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { StructuredData } from "@/components/structured-data";
import { generateMetadata as seo } from "@/lib/seo";

export const metadata = seo({
  title: "BlogCraft AI — AI 블로그 작성 도구",
  description: "사진과 메모로 내 말투를 학습한 AI가 10분 만에 자연스러운 블로그 글을 만들고, SEO 최적화와 수익화까지 자동으로 도와줍니다.",
  path: "/",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <StructuredData />
        <AdProvider>
          <AnalyticsProvider>
            <Nav />
            <main className="relative pt-16">
              {children}
            </main>
          </AnalyticsProvider>
        </AdProvider>
      </body>
    </html>
  );
}
