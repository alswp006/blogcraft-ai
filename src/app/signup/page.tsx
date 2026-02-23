"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 no-underline hover:no-underline mb-6 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="text-base font-bold text-[var(--text)] tracking-tight">
              BlogCraft <span className="text-[var(--accent)]">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">계정 만들기</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">무료로 시작하세요. 신용카드 불필요.</p>
        </div>

        <Card className="shadow-xl shadow-black/20">
          <CardContent className="pt-6 space-y-6">
            {error && (
              <div className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상 입력하세요"
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    계정 생성 중...
                  </span>
                ) : "무료로 시작하기"}
              </Button>
            </form>

            <p className="text-center text-xs text-[var(--text-muted)] leading-relaxed">
              가입하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-[var(--text-muted)]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">로그인</Link>
        </p>
      </div>
    </div>
  );
}
