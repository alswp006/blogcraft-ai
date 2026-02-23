import { getCurrentUser, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    // Clear any stale session cookie before redirecting.
    // The "logged_out" param tells middleware not to redirect back here.
    await destroySession();
    redirect("/login?logged_out");
  }

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="w-full py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Dashboard</h1>
          <p className="text-base text-[var(--text-secondary)]">
            Welcome back, {user.name || user.email}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
            <p className="text-3xl font-bold text-[var(--text)]">0</p>
            <p className="text-sm text-[var(--text-muted)]">Total Posts</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
            <p className="text-3xl font-bold text-[var(--text)]">0</p>
            <p className="text-sm text-[var(--text-muted)]">Published</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
            <p className="text-3xl font-bold text-[var(--text)]">0</p>
            <p className="text-sm text-[var(--text-muted)]">Drafts</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-2">
            <p className="text-3xl font-bold text-[var(--accent)]">Free</p>
            <p className="text-sm text-[var(--text-muted)]">Plan</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-6">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-[var(--text-muted)]">Email</p>
              <p className="text-base text-[var(--text)]">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--text-muted)]">Name</p>
              <p className="text-base text-[var(--text)]">{user.name || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[var(--text-muted)]">Joined</p>
              <p className="text-base text-[var(--text)]">{joinDate}</p>
            </div>
          </div>
        </div>

        {/* Empty State — Blog Posts */}
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]/50 py-20 text-center space-y-4">
          <div className="text-4xl mb-4">
            <span aria-hidden="true">&#9997;&#65039;</span>
          </div>
          <h3 className="text-xl font-semibold text-[var(--text)]">No blog posts yet</h3>
          <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto">
            Start creating AI-powered blog posts. Upload photos and notes, and let AI craft natural content in your voice.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm no-underline hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25"
            >
              Create Your First Post
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
