# External References

> Curated list of **authoritative documentation** for every external dependency in the zedslot/zedcheckout stack.
> Agents MUST consult these before implementing against an external library — see `.cursor/rules/core/external-docs.mdc`.

If you're using Cursor IDE: add the URLs below to `Settings → Indexing & Docs → Add new doc` to make them searchable via `@Docs <name>` inline.

## Architecture & Monorepo

| Layer | Tech | Canonical docs | Notes |
|---|---|---|---|
| Monorepo template / inspiration | **next-forge** | <https://www.next-forge.com/> | Reference for monorepo layout, feature flags, observability, and design-system patterns. **We don't fork it; we mirror its structure.** |
| Monorepo build system | **Turborepo** | <https://turborepo.com/docs> | Pipelines, remote cache, filter syntax, task dependencies. |
| Package manager | **pnpm workspaces** | <https://pnpm.io/workspaces> | Workspace protocol, catalog deps, hoisting rules. |

## Web framework

| Tech | Canonical docs | Notes |
|---|---|---|
| **Next.js 15 (App Router)** | <https://nextjs.org/docs> | Server Components, Server Actions, route handlers, caching, revalidation tags. |
| **React 19** | <https://react.dev/reference/react> | Hooks, Server Components patterns, `use` hook. |

## UI & design system

| Tech | Canonical docs | Notes |
|---|---|---|
| **shadcn/ui** | <https://ui.shadcn.com/docs> | Headless primitives we copy into `packages/ui` (not installed as a runtime dep). |
| **Tailwind CSS** | <https://tailwindcss.com/docs> | Utility framework. **Forbidden:** arbitrary-value classes for design tokens (`bg-[#1E2A47]`, `p-[13px]`) — see dependency-isolation rule. |
| **class-variance-authority (CVA)** | <https://cva.style/docs> | Variant API used in `packages/ui` for typed component variants. |
| **Lucide icons** | <https://lucide.dev/guide/packages/lucide-react> | Icon library — used through a `packages/ui/icons` re-export, never imported directly in apps. |
| **Framer Motion** (if needed) | <https://motion.dev/docs> | Already used in the marketing site (`www.zedcheckout.com`). |

## Database

| Tech | Canonical docs | Notes |
|---|---|---|
| **Drizzle ORM** | <https://orm.drizzle.team/docs/overview> | Schema definition, migrations, query builder. Used inside `packages/database` only. |
| **Drizzle Kit (migrations)** | <https://orm.drizzle.team/docs/kit-overview> | `drizzle-kit generate`, `migrate`, `push`. |
| **Postgres EXCLUDE constraints** | <https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-EXCLUDE> | The race-proof double-booking guarantee. |
| **Postgres `tstzrange` + GiST** | <https://www.postgresql.org/docs/current/rangetypes.html> | Time range types used by the EXCLUDE constraints. |
| **Neon** | <https://neon.tech/docs> | Hosted Postgres. Branching for preview envs. |

## Admin CMS

| Tech | Canonical docs | Notes |
|---|---|---|
| **PayloadCMS v3** | <https://payloadcms.com/docs> | Collections, globals, hooks, RBAC. v3 runs natively as a Next.js app. |
| **Payload Drizzle adapter** | <https://payloadcms.com/docs/database/postgres> | Use Drizzle as the DB adapter so the schema is shared with `packages/database`. |
| **Payload Admin Customization** | <https://payloadcms.com/docs/admin/components> | Custom blocks (calendar view, availability editor). |

## Payments

| Tech | Canonical docs | Notes |
|---|---|---|
| **Stripe API reference** | <https://docs.stripe.com/api> | Used inside `packages/payments` only. |
| **Stripe Payment Element** | <https://docs.stripe.com/payments/payment-element> | The default integration for the hosted checkout. Apple Pay + Google Pay surfaced first. |
| **Stripe Webhooks** | <https://docs.stripe.com/webhooks> | Signature verification is mandatory (see `payments.mdc`). |
| **Stripe Refunds** | <https://docs.stripe.com/refunds> | Refund-to-source allocation. |
| **Stripe idempotency keys** | <https://docs.stripe.com/api/idempotent_requests> | Mandatory on every create-call (see `payments.mdc`). |
| **Stripe MCP server** | (already configured in this Cursor environment) | Use `GetMcpTools` with `server: "Stripe"` to inspect available actions. |
| **Skill: `stripe-best-practices`** | `/root/.cursor/plugins/.../skills/stripe-best-practices/SKILL.md` | Pre-installed agent skill. |
| **Skill: `upgrade-stripe`** | `/root/.cursor/plugins/.../skills/upgrade-stripe/SKILL.md` | Pre-installed agent skill. |

## Shopify

| Tech | Canonical docs | Notes |
|---|---|---|
| **Shopify Admin GraphQL API** | <https://shopify.dev/docs/api/admin-graphql> | Order writeback, customer upsert, metafield writes. Used inside `packages/shopify` only. |
| **Shopify Customer Account API** | <https://shopify.dev/docs/api/customer> | Read-side only in V0 (pack/gift-card balance lookup); auth provider is magic-link. |
| **Shopify Webhooks** | <https://shopify.dev/docs/apps/build/webhooks> | Inbound from Shopify (customer/order changes). HMAC verification required. |
| **Shopify metafields** | <https://shopify.dev/docs/apps/build/custom-data/metafields> | Pack credit balance lives in a custom metafield in V0. |
| **Skill: `shopify-admin`** | (pre-installed) | Admin GraphQL API guidance. |
| **Skill: `shopify-customer`** | (pre-installed) | Customer Account API guidance. |
| **Skill: `shopify-onboarding-dev`** | (pre-installed) | App scaffolding. |

## Auth

| Tech | Canonical docs | Notes |
|---|---|---|
| **Magic-link auth pattern** | <https://auth.js.org/getting-started/authentication/email> | Reference; we implement our own thin layer in `packages/auth` (no full Auth.js install). |
| **PayloadCMS auth** | <https://payloadcms.com/docs/authentication/overview> | Used for the admin app. Built-in. |

## Email

| Tech | Canonical docs | Notes |
|---|---|---|
| **React Email** | <https://react.email/docs/introduction> | Component-based email templates in `packages/email`. |
| **Resend** | <https://resend.com/docs/introduction> | Transactional email sender. SDK wrapped in `packages/email`. |

## Feature flags & analytics

| Tech | Canonical docs | Notes |
|---|---|---|
| **PostHog Feature Flags** | <https://posthog.com/docs/feature-flags> | Server-side evaluation. Wrapped in `packages/feature-flags`. |
| **PostHog (product analytics)** | <https://posthog.com/docs/product-analytics> | Funnel events. Wrapped in `packages/analytics`. |
| **PostHog Node SDK** | <https://posthog.com/docs/libraries/node> | Server-side SDK. |

## Observability

| Tech | Canonical docs | Notes |
|---|---|---|
| **Sentry for Next.js** | <https://docs.sentry.io/platforms/javascript/guides/nextjs/> | Wrapped in `packages/observability`. PII scrubbing at SDK level. |
| **Sentry source maps** | <https://docs.sentry.io/platforms/javascript/sourcemaps/> | CI integration. |

## Hosting

| Tech | Canonical docs | Notes |
|---|---|---|
| **Vercel** | <https://vercel.com/docs> | Hosting for `apps/*`. |
| **Vercel Cron Jobs** | <https://vercel.com/docs/cron-jobs> | Reminder email scheduling, pending-booking cleanup. |
| **Vercel Edge Config** | <https://vercel.com/docs/edge-config> | Optional fallback for feature flags when PostHog is unreachable. |
| **Cloudflare for SaaS** (V1) | <https://developers.cloudflare.com/cloudflare-for-saas/> | Reference for V1 multi-tenant CNAME provisioning. |

## Testing

| Tech | Canonical docs | Notes |
|---|---|---|
| **Vitest** | <https://vitest.dev/guide/> | Default test runner across all packages. |
| **fast-check** (property-based) | <https://fast-check.dev/docs/> | Required for `packages/domain` and `packages/booking-engine` invariants. |
| **Playwright** | <https://playwright.dev/docs/intro> | E2E on `apps/booking`. |
| **Stripe test mode** | <https://docs.stripe.com/testing> | Contract tests for `packages/payments`. |

## CI / DX

| Tech | Canonical docs | Notes |
|---|---|---|
| **GitHub Actions** | <https://docs.github.com/en/actions> | CI pipelines. |
| **Turborepo Remote Cache** | <https://turborepo.com/docs/core-concepts/remote-caching> | Speed up CI; use Vercel's free remote cache for monorepos on Vercel. |
| **Biome** or **ESLint + Prettier** | <https://biomejs.dev/guides/getting-started/> / <https://eslint.org/docs/latest/> | Lint + format. To be decided in implementation plan. |
| **Changesets** | <https://github.com/changesets/changesets> | Version management for the internal packages. |

## Pre-installed agent skills (already loaded in this Cursor env)

These are already available — no additional install needed. Read each `SKILL.md` before invoking.

| Skill | Purpose |
|---|---|
| `brainstorming` | Idea → design → spec, with HARD-GATE before any code. |
| `writing-plans` | Spec → implementation plan. |
| `subagent-driven-development` | Execute independent plan tasks in parallel via subagents. |
| `executing-plans` | Sequential plan execution with review checkpoints. |
| `tdd` / `test-driven-development` | Red-green-refactor with property-based tests. |
| `systematic-debugging` | Repro → minimize → hypothesize → fix → regression-test. |
| `verification-before-completion` | No "done" claim without evidence. |
| `requesting-code-review` / `receiving-code-review` | Review hygiene. |
| `using-git-worktrees` | Isolated parallel work. |
| `finishing-a-development-branch` | Merge / PR / cleanup checkpoint. |
| `improve-codebase-architecture` | Deepening, interface design, language. |
| `dispatching-parallel-agents` | Parallel task fan-out. |
| `find-skills` | Discover skills by need. |
| `stripe-best-practices` | Stripe integration hygiene. |
| `shopify-admin` | Shopify Admin GraphQL guidance. |
| `shopify-customer` | Customer Account API guidance. |
| `shopify-onboarding-dev` | App scaffolding. |

Full list at the top of any agent invocation; or check `.agents/skills/`.

## MCP servers (already configured in this Cursor env)

These let agents query authoritative APIs at runtime instead of guessing.

| Server | Use for |
|---|---|
| `Stripe` | Inspect Stripe accounts, products, prices, payment intents at runtime. |
| `Figma` | Design system / Code Connect mappings (V1+ when we have a real design file). |

Use `GetMcpTools` with the server name to inspect available tools before calling.

## Documentation indexing in Cursor IDE (per-user setup)

To make these searchable inline via `@Docs <name>`:

1. Open Cursor IDE → `Settings` → `Indexing & Docs`
2. Click `+ Add new doc`
3. Paste each canonical URL from this file (start with the most-used: Next.js, Tailwind, shadcn, Drizzle, PayloadCMS, Stripe, Shopify Admin GraphQL, Stripe Payment Element)
4. Cursor will crawl and index; allow a few minutes per doc set

This is per-user / per-machine and not committed to the repo.

## Update protocol

When adding a new dependency:

1. Add the canonical docs URL to the table above (right section).
2. Add the package wrapper to `packages/` (per `.cursor/rules/core/dependency-isolation.mdc`).
3. Update `CONTEXT.md` stack table if it changes the stack story.
4. PR description must justify the addition (per scope-control rule).
