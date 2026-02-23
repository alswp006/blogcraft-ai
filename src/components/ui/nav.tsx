"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-transparent bg-[var(--bg)]/60 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline hover:no-underline group"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 group-hover:shadow-[var(--accent)]/50 transition-shadow duration-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[var(--text)] tracking-tight">
            BlogCraft <span className="text-[var(--accent)]">AI</span>
          </span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-5 bg-[var(--text-secondary)] rounded-full transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-[var(--text-secondary)] rounded-full transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-[var(--text-secondary)] rounded-full transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/pricing"
            className="px-3 py-2 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-200"
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-200"
              >
                Dashboard
              </Link>
              <div className="w-px h-4 bg-[var(--border)] mx-1" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-lg transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="ml-1 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-opacity shadow-md shadow-[var(--accent)]/25"
              >
                무료 시작
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4 space-y-1">
          <Link
            href="/pricing"
            className="flex items-center px-3 py-2.5 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] hover:bg-[var(--bg-card)] rounded-lg transition-all duration-200"
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2.5 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] hover:bg-[var(--bg-card)] rounded-lg transition-all duration-200"
              >
                Dashboard
              </Link>
              <div className="px-3 py-2 text-xs text-[var(--text-muted)] truncate">{user.email}</div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-lg transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 text-center text-sm px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-opacity shadow-md shadow-[var(--accent)]/25"
              >
                무료 시작
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
