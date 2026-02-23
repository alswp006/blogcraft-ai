import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
}

const defaultColumns: FooterColumn[] = [
  {
    title: "서비스",
    links: [
      { label: "기능 소개", href: "/#features" },
      { label: "요금제", href: "/pricing" },
      { label: "대시보드", href: "/dashboard" },
    ],
  },
  {
    title: "리소스",
    links: [
      { label: "블로그", href: "/#" },
      { label: "도움말", href: "/#" },
      { label: "고객 지원", href: "/#" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "소개", href: "/#" },
      { label: "개인정보처리방침", href: "/#" },
      { label: "이용약관", href: "/#" },
    ],
  },
  {
    title: "계정",
    links: [
      { label: "회원가입", href: "/signup" },
      { label: "로그인", href: "/login" },
    ],
  },
];

export function Footer({ columns, copyright }: FooterProps) {
  const cols = columns || defaultColumns;
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline group w-fit">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-[var(--text)] tracking-tight">
                BlogCraft <span className="text-[var(--accent)]">AI</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              AI로 더 쉽고 빠르게 블로그를 운영하세요.
            </p>
          </div>

          {/* Link columns */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((col) => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            {copyright || `© ${year} BlogCraft AI. All rights reserved.`}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Made with ♥ in Korea
          </p>
        </div>
      </div>
    </footer>
  );
}
