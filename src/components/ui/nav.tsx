"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
}

export function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline group">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/25 group-hover:opacity-90 transition-opacity">
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
            <span className="font-semibold text-[var(--text)] text-base">BlogCraft AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing" className="no-underline">요금제</Link>
            </Button>
            {user && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="no-underline">대시보드</Link>
              </Button>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-semibold text-white">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] max-w-[120px] truncate">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login" className="no-underline">로그인</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup" className="no-underline">무료 시작</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            <span
              className={cn(
                "block w-5 h-0.5 bg-[var(--text)] transition-all duration-300 origin-center",
                menuOpen && "rotate-45 translate-y-2"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 bg-[var(--text)] transition-all duration-300",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 bg-[var(--text)] transition-all duration-300 origin-center",
                menuOpen && "-rotate-45 -translate-y-2"
              )}
            />
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            menuOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link href="/pricing" className="no-underline" onClick={() => setMenuOpen(false)}>요금제</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="justify-start">
                  <Link href="/dashboard" className="no-underline" onClick={() => setMenuOpen(false)}>대시보드</Link>
                </Button>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-semibold text-white">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMenuOpen(false); }} className="justify-start">
                  로그아웃
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/login" className="no-underline" onClick={() => setMenuOpen(false)}>로그인</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/signup" className="no-underline" onClick={() => setMenuOpen(false)}>무료 시작</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
