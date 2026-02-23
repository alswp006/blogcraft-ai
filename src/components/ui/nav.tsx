"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-base font-bold no-underline hover:no-underline text-[var(--text)] tracking-tight">
          BlogCraft AI
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-colors duration-200">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-colors duration-200">
                Dashboard
              </Link>
              <span className="text-sm text-[var(--text-muted)]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all duration-200 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 rounded-xl bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4 space-y-3">
          <Link href="/pricing" className="block text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-colors py-2">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-colors py-2">
                Dashboard
              </Link>
              <div className="text-sm text-[var(--text-muted)] py-2">{user.email}</div>
              <button
                onClick={handleLogout}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-all duration-200 cursor-pointer text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 text-center text-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] no-underline hover:bg-[var(--bg-card)] transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
