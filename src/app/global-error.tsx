"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-[#08080e] text-[#eeeef5]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#eeeef5", marginBottom: "0.5rem" }}>
              오류가 발생했습니다
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#a6a6bc", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                background: "#6366f1",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 16px -4px rgba(99, 102, 241, 0.3)",
              }}
            >
              다시 시도하기
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
