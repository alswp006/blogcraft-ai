import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  const links = {
    제품: [
      { label: "기능", href: "/#features" },
      { label: "요금제", href: "/pricing" },
      { label: "대시보드", href: "/dashboard" },
    ],
    계정: [
      { label: "로그인", href: "/login" },
      { label: "회원가입", href: "/signup" },
    ],
  };

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--bg-elevated)]/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
                  <path
                    d="M13 2L9 6M3 10l4-4M3 13h3l7-7-3-3-7 7v3z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semibold text-[var(--text)] text-lg">BlogCraft AI</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              사진과 메모로 AI가 자연스러운 블로그 글을 10분 만에 완성해 드립니다.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-5 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline hover:no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {year} BlogCraft AI. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Made with ❤️ for Korean bloggers
          </p>
        </div>
      </div>
    </footer>
  );
}
