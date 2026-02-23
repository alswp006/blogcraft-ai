# CLAUDE.md — Project Rules

## CRITICAL: STANDALONE Next.js app
- INDEPENDENT app, NOT monorepo. Only import from node_modules or src/
- No @ai-factory/*, drizzle-orm, @libsql/client. Check package.json first
- DB: use better-sqlite3, localStorage, or in-memory for MVP
- better-sqlite3 is a native module — NEVER change its version in package.json
- If you add new native modules (sharp, bcrypt, etc.), list them in dependencies so the pipeline can rebuild them
- ALWAYS check existing code before creating new files — avoid duplicates

## CRITICAL: Edge Runtime Restrictions
- middleware.ts runs in Edge Runtime — it CANNOT import anything that uses Node.js modules (fs, path, crypto, better-sqlite3, bcryptjs)
- middleware.ts should ONLY check cookies via request.cookies.get() — NEVER import from lib/auth.ts or lib/db.ts
- API routes and Server Components run in Node.js runtime — they CAN import anything
- If you need auth checks in middleware, use ONLY cookie-based checks, never DB queries

## CRITICAL: Next.js 15 Breaking Changes
- Route params are now async: `{ params }: { params: Promise<{ id: string }> }` then `const { id } = await params;`
- searchParams are also async: `{ searchParams }: { searchParams: Promise<{ q?: string }> }`
- NEVER use `params.id` directly — always await first
- Server Actions must be in files with "use server" or inline with "use server" directive

## CRITICAL: Client vs Server Components
- Hooks (useState, useEffect, useRef) require "use client" at the TOP of the file
- Event handlers (onClick, onChange, onSubmit) require "use client"
- Server Components CANNOT use hooks or event handlers
- When in doubt, add "use client" — it's safer than missing it

## Commands
- pnpm install --ignore-workspace / build / typecheck / test / dev
- IMPORTANT: Always use --ignore-workspace with pnpm to avoid monorepo interference
- Build: npx next build --experimental-app-only (verify it passes before finishing)
- IMPORTANT: Always use --experimental-app-only with next build to avoid Turbopack Pages Router errors in Next.js 15.5+
- Typecheck: npx tsc --noEmit (fix ALL errors before finishing)

## Testing
- Write tests in src/__tests__/packet-{id}.test.ts alongside your implementation
- Use vitest: import {describe,it,expect,beforeEach,afterEach} from "vitest"
- Use @/ alias for imports (vitest resolves @/ → src/)
- Run pnpm test + pnpm typecheck before finishing

### Test Best Practices (CRITICAL — follow these to avoid failures)
- DB cleanup: In afterEach/beforeEach, delete child tables BEFORE parent tables (foreign key order)
  Example: db.prepare("DELETE FROM posts").run(); THEN db.prepare("DELETE FROM categories").run();
- Test isolation: Each test must create its own test data — never depend on data from other tests
- Test isolation: Use user-scoped cleanup (WHERE userId = ?) instead of global DELETE FROM — tests run in PARALLEL so global deletes destroy other test files' data
- Test isolation: Each test within a describe block must set up its own data — never assume data from a prior test still exists
- Unique data: Use UNIQUE emails per test FILE (e.g., `test-p0001-${Date.now()}@example.com`) to avoid UNIQUE constraint violations across parallel test files
- Never use hardcoded IDs (e.g., "test-category-1") in raw SQL — always use actual IDs returned from create functions
- better-sqlite3: All DB calls are SYNCHRONOUS — use db.prepare().run(), NOT await db.prepare().run()
- Timestamps: Never rely on insertion order for "latest" queries — add `rowid DESC` as tiebreaker in ORDER BY clauses (e.g., ORDER BY createdAt DESC, rowid DESC)
- API route tests: Use new Request() with proper headers, test both success and error cases
- Auth in tests: Use createSessionToken(userId) from @/lib/auth — set it as cookie header in Request

## CRITICAL: Auth Cookie Pattern
- Cookie name is "session_token" — this is set by createSession() in src/lib/auth.ts
- Middleware checks cookies via request.cookies.get("session_token") — MUST match
- Signup returns status 201, Login returns status 200
- If template auth already exists (src/lib/auth.ts), use createSession()/destroySession() — do NOT reimplement
- For NEW API routes that need auth, read cookie from request headers:
  ```
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session_token=([^;]+)/);
  const token = match?.[1] ?? null;
  // Then validate: import { getSessionUserId } from "@/lib/auth"
  const userId = token ? getSessionUserId(token) : null;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```
- NEVER change the cookie name — middleware.ts, auth.ts, and all API routes must agree on "session_token"
- For tests: use createSessionToken(userId) from @/lib/auth to create test sessions without cookies() API

## Code Style
- TypeScript strict, Next.js 15 App Router, all files in src/
- Tailwind CSS only (no inline styles), no .eslintrc files
- All imports must resolve — verify with pnpm typecheck

## Common Build Error Prevention
- Every 'use client' component that imports a Server Component will fail — restructure
- Dynamic imports with `import()` in client components must use next/dynamic
- Image component: use next/image with width+height or fill prop
- Link component: import from next/link, no nested <a> tags
- Forms: use native form + server action, or "use client" + fetch
- JSON imports: add "resolveJsonModule": true in tsconfig if needed
- Missing types: check @types/ packages are in devDependencies

## Design System — MANDATORY (follow exactly)

### Page Layout Architecture
CRITICAL PATTERN — every page must follow this structure:
- Page wrapper: NO max-width, NO horizontal padding (allows full-width sections)
- Each section: full-width wrapper + constrained content inside
  `<section className="w-full py-20"><div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">{content}</div></section>`
- Hero sections: w-full min-h-[70vh] flex items-center, gradient bg spans full width
- NEVER put max-w-* or px-* on the outermost page element
- NEVER wrap the entire page in a single narrow container

### Responsive Design
- Mobile first: default styles for mobile, then md: and lg: breakpoints
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (never fixed columns)
- Text: text-3xl md:text-4xl lg:text-5xl for hero headlines
- Padding: px-4 md:px-6 lg:px-8 inside content containers
- Hide/show: hidden md:block for desktop-only elements
- Stack on mobile: flex flex-col md:flex-row

### Colors (CSS vars ONLY — never hardcode hex values)
- bg: var(--bg), var(--bg-elevated), var(--bg-card), var(--bg-input)
- border: var(--border), var(--border-hover)
- text: var(--text), var(--text-secondary), var(--text-muted)
- accent: var(--accent), var(--accent-soft)
- semantic: var(--success-soft), var(--danger-soft), var(--warning-soft)

### Typography Hierarchy (use exactly these, not custom sizes)
- Hero headline: text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight
- Page title: text-3xl font-bold tracking-tight
- Section heading: text-2xl font-semibold tracking-tight
- Card title: text-lg font-semibold
- Body: text-base leading-relaxed text-[var(--text-secondary)]
- Small/meta: text-sm text-[var(--text-muted)]
- NEVER use plain unsized text — always specify size

### Components (import from @/components/ui/)
- Button: default/secondary/ghost/destructive, sizes: sm/default/lg
- Card: CardHeader/CardTitle/CardDescription/CardContent/CardFooter
- Input, Textarea, Badge(default/success/error/warning)

### Cards & Containers
- Base: rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8
- Hover: hover:shadow-lg hover:border-[var(--accent)]/30 transition-all duration-300
- Feature cards: add icon with colored bg (rounded-xl w-12 h-12 flex items-center justify-center bg-[var(--accent)]/10 text-xl mb-4)
- Stat cards: large number (text-3xl font-bold) + label below (text-sm text-[var(--text-muted)])

### Buttons (NEVER leave unstyled)
- Primary: bg-[var(--accent)] text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent)]/25
- Secondary: border border-[var(--border)] rounded-xl px-6 py-3 font-medium hover:bg-[var(--bg-card)] transition-colors
- Ghost: rounded-xl px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors
- ALL buttons must have: rounded corners, padding, hover state, transition

### Section Spacing
- Between major sections: py-20 md:py-28
- Between heading and content: mb-12
- Card grid gaps: gap-6 md:gap-8
- Form field gaps: space-y-4
- Text block gaps: space-y-3

### Landing Page Blueprint (follow for landing/home page)
1. Hero: w-full min-h-[70vh] flex items-center, subtle gradient bg (bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent), centered content, headline + subtitle + 2 buttons (primary + ghost)
2. How It Works: py-20, section heading centered, 3-col grid, numbered steps (text-6xl font-bold text-[var(--accent)]/10 absolute), icon + title + description
3. Features: py-20 bg-[var(--bg-elevated)]/50, 2x2 or 3-col grid of feature cards with icons
4. CTA: py-20, rounded-2xl bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 mx-6, centered headline + button
5. Footer: py-12 border-t, grid grid-cols-2 md:grid-cols-4 gap-8, column headers text-sm font-semibold mb-3, links text-sm text-[var(--text-muted)] hover:text-[var(--text)]

### Auth Pages Blueprint
- Centered: min-h-screen flex items-center justify-center
- Card: max-w-md w-full rounded-2xl border p-8 shadow-lg
- Form: space-y-4, labels text-sm font-medium mb-1, inputs w-full rounded-xl border p-3
- Submit: w-full rounded-xl py-3 bg-[var(--accent)] text-white font-medium
- Cross-link: text-center text-sm mt-4, link in text-[var(--accent)]

### Dashboard Blueprint
- Layout: flex (sidebar optional) + main content area
- Top: stat cards in grid grid-cols-2 md:grid-cols-4 gap-4
- Content: data cards/tables below stats
- Empty state: py-20 text-center, icon (text-4xl mb-4) + heading + description + CTA button

### Visual Polish
- Gradient text (hero only): bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent
- Subtle grid bg (hero): CSS background-image with radial-gradient dots
- ALL interactive elements: transition-all duration-200
- ALL clickable elements: cursor-pointer + hover state
- Icons: Use lucide-react. size-4 inline, size-5 buttons, size-8 empty states, size-12 hero features
- Loading: animate-pulse with rounded bg-[var(--border)]
- Empty: centered layout with icon + heading + CTA

### ANTI-PATTERNS (FORBIDDEN — these make apps look like AI-generated slop)
- ❌ Content not filling viewport width (narrow box with empty sides)
- ❌ Putting max-w-* on the page wrapper instead of inside sections
- ❌ Cards without hover effects or transitions
- ❌ Buttons without rounded corners, shadows, or hover states
- ❌ No spacing between sections (content crammed together)
- ❌ Same text size everywhere (no hierarchy)
- ❌ Footer as plain list of links (no columns or structure)
- ❌ Forms without labels, proper spacing, or styled inputs
- ❌ Plain dark/white background with no texture or gradient anywhere
- ❌ Missing responsive breakpoints (looks bad on mobile)

## Navigation
- Every page reachable from header nav. Login<->Signup cross-linked.
- Layout at src/app/layout.tsx — UPDATE it, don't recreate.
- Nav component at src/components/ui/nav.tsx — add links for new pages here.

## Final Checklist (run before finishing)
1. pnpm typecheck — zero errors
2. pnpm test — all tests pass
3. npx next build — builds successfully
4. No "use client" missing warnings
5. No unresolved imports

## Preserved Template Rules


## Pre-built Auth (DO NOT RECREATE)
- src/lib/auth.ts — cookie sessions + bcrypt
- src/lib/models/user.ts — user CRUD
- src/app/api/auth/{login,signup,logout,me}/route.ts — API routes
- src/app/{login,signup}/page.tsx — UI pages
- src/middleware.ts — route protection (/dashboard/* requires auth)
- To add new protected routes: update PROTECTED_PREFIXES in middleware.ts

## Navigation
- Every page reachable from header nav. Login<->Signup cross-linked.
- Layout at src/app/layout.tsx — UPDATE it, don't recreate.
- Nav component at src/components/ui/nav.tsx — add links for new pages here.



## Pre-built Payments & Subscriptions (DO NOT RECREATE)
- src/lib/stripe.ts — Stripe SDK wrapper (lazy-loaded, safe when STRIPE_SECRET_KEY is empty)
  - createCheckoutSession(), createPortalSession(), getSubscription(), constructWebhookEvent()
  - isStripeConfigured() — returns false if no key, features gracefully degrade
- src/lib/subscription.ts — Subscription management
  - getSubscriptionTier(userId) — returns "free" | "pro" | "enterprise"
  - canAccessFeature(userId, featureKey) — checks tier vs feature config
  - upsertSubscription(), deactivateSubscription()
- src/config/features.ts — Feature gating config (FEATURE_MAP + hasAccess helper)
- src/app/api/payments/checkout/route.ts — POST, creates Stripe Checkout session
- src/app/api/payments/portal/route.ts — POST, creates Stripe billing portal
- src/app/api/payments/webhook/route.ts — POST, handles Stripe webhook events
- src/app/api/payments/access/route.ts — GET, checks feature access for current user
- src/app/pricing/page.tsx — Pricing page with tier comparison
- src/components/premium-gate.tsx — Wraps premium content, shows upgrade prompt for free users
- src/components/pricing-section.tsx — Reusable pricing cards component
- To add premium features: add entry to FEATURE_MAP in src/config/features.ts
- Stripe keys are optional — app works without them (all features free)

## Pre-built Landing Page Components (USE these, do NOT recreate)
- src/components/landing/hero-section.tsx — HeroSection({ headline, subheadline, ctaText, ctaHref, secondaryCtaText, secondaryCtaHref })
- src/components/landing/feature-grid.tsx — FeatureGrid({ features: { icon, title, description }[] })
- src/components/landing/cta-section.tsx — CtaSection({ headline, description, ctaText, ctaHref })
- src/components/landing/footer.tsx — Footer component
- src/components/landing/pricing-display.tsx — PricingDisplay component
- When building the landing page, import and compose these components — do NOT write raw HTML/JSX

## Pre-built SEO & Analytics (DO NOT RECREATE)
- src/lib/seo.ts — generateMetadata({ title, description, path, ogImage }) for Next.js metadata
  - Generates OG image URL via /api/og endpoint automatically
  - Use in page exports: export const metadata = generateMetadata({ title: "Page" })
- src/app/robots.ts — robots.txt generation
- src/app/sitemap.ts — sitemap.xml generation
- src/app/api/og/route.tsx — Dynamic OG image generation
- src/components/structured-data.tsx — JSON-LD structured data
- src/lib/analytics.ts — Google Analytics: track(event, props), trackPageView(url), isAnalyticsConfigured()
- src/components/analytics-provider.tsx — GA script injection (auto-disabled when no GA_ID)
- src/components/ad-provider.tsx — AdSense integration (auto-disabled when no client ID)
- src/components/ad-unit.tsx — Ad placement component
- All analytics/ads are optional — auto-disabled when env vars are empty

## TDD (CRITICAL)
- Template tests (e.g., auth.test.ts) define required exports — read their imports to understand what modules to create
- If a template test has bugs (wrong imports, missing setup), you CAN fix it
- Always run pnpm test to ensure all tests pass after your changes
- When writing new tests, follow the Test Best Practices section above