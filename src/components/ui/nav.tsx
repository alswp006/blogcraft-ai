"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing" className="no-underline">
              Pricing
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="no-underline">
                  Dashboard
                </Link>
              </Button>
              <div className="w-px h-4 bg-[var(--border)] mx-1" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] max-w-[120px] truncate">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-1 hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="no-underline">
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild className="ml-1">
                <Link href="/signup" className="no-underline">
                  무료 시작
                </Link>
              </Button>
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
          <Button variant="ghost" size="sm" asChild className="w-full justify-start">
            <Link href="/pricing" className="no-underline">
              Pricing
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                <Link href="/dashboard" className="no-underline">
                  Dashboard
                </Link>
              </Button>
              <div className="px-3 py-2 text-xs text-[var(--text-muted)] truncate">{user.email}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-[var(--danger)] hover:bg-[var(--danger-soft)]"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/login" className="no-underline">
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/signup" className="no-underline">
                  무료 시작
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
