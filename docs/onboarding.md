# Agent Onboarding — zedslot / zedcheckout

> First read for any agent (or human) landing on this repo.
> Read time: ~3 minutes.

## What this repo is

The product space for **zedcheckout** (SaaS umbrella) and its first product, **zedslot** (booking).

Currently contains:
- **Marketing site** at the repo root (Next.js 14, i18n FR/EN) — deployed at `www.zedcheckout.com`. Public copy is deliberately vague; never names Shopify or specific customers.
- **PRD for zedslot V0** in `docs/` — vision, feature, stories, architecture for the V0 booking pilot at Little Biceps.
- **Cursor OS scaffold** in `.agents/`, `.cursor/`, `templates/`, `CONTEXT.md` — agent rules, modes, commands, hooks, skills.

Not yet contains: the zedslot product code itself. That gets built into a Turborepo monorepo (see `docs/architecture/zedslot-v0.md`); migration plan for the marketing site into `apps/web` is deferred to the implementation plan.

## Where things live

| Path | Purpose |
|---|---|
| `CONTEXT.md` | The shared domain language. **Read first** if you're going to write anything. |
| `docs/vision.md` | North Star, wedge, non-goals, future-features pipeline. |
| `docs/features/` | One file per Feature (V0 = `booking-pilot.md`). |
| `docs/stories/` | One file per user-facing Story (13 stubs for V0). |
| `docs/architecture/zedslot-v0.md` | V0 architecture: monorepo, packages, data model, concurrency, integrations. |
| `specs/` | Technical contracts for stories. To be created via `/spec`. Currently empty. |
| `tasks/` | Active implementation tasks. Ephemeral; created via `/plan`. |
| `.cursor/rules/` | Behavioral contracts loaded by the agent. |
| `.cursor/commands/` | Slash commands (`/strategize`, `/feature`, `/story`, `/spec`, `/plan`, `/implement`, `/review`, `/test`, `/health`). |
| `.cursor/hooks/` | Event-driven automation (format on edit, design-token guard, mode trace). |
| `.agents/skills/` | Skills installed via the skills.sh ecosystem. |
| `templates/` | Starting points for new artifacts (vision, feature, story, spec, task, rule, skill). |
| `docs/references.md` | Curated authoritative docs for every external dependency + pre-installed skills + MCP servers. |

## Work hierarchy

```
Vision → Feature → Story → Spec → Task
```

| Stage | Command | Status |
|---|---|---|
| Vision | `/strategize` | ✅ Drafted (`docs/vision.md`) |
| Feature | `/feature` | ✅ V0 drafted (`docs/features/booking-pilot.md`) |
| Stories | `/story` | ✅ 13 V0 stubs in `docs/stories/` |
| Specs | `/spec` | ⏳ Not started — next stop |
| Tasks | `/plan` | ⏳ Not started |
| Code | `/implement` | ⏳ Blocked on validated specs |

## Always-loaded rules (read these to understand agent behavior)

- `.cursor/rules/core/coordinator.mdc` — agent modes, mode transitions, hard rules
- `.cursor/rules/core/discipline.mdc` — anti-hallucination, token economy, honest communication
- `.cursor/rules/core/scope-control.mdc` — classification (Reusable Primitive / Project Primitive / etc.) before implementation
- `.cursor/rules/core/dependency-isolation.mdc` — **zedslot-specific** — every external SDK wrapped, design tokens for UI, no leaking deps into domain code
- `.cursor/rules/core/external-docs.mdc` — **zedslot-specific** — consult `docs/references.md` before implementing against any external library; never hallucinate APIs

## Domain-loaded rules (loaded only when working in that area)

- `.cursor/rules/domain/payments.mdc` — loaded when editing Stripe / billing / checkout / refund code
- `.cursor/rules/domain/booking.mdc` — **zedslot-specific** — loaded when editing booking / slot / availability / room / resource / reservation code

## Pilot context (the why)

- **Pilot customer:** Little Biceps (`https://littlebiceps.com`) — Parisian wellness institute.
- **Existing baseline:** Shopify + BookThatApp + a hand-rolled custom checkout that already produces **+48% conversion lift** vs the default flow.
- **The wedge to preserve:** no Shopify cart + custom Stripe payment UI + guest by default + mobile-first.
- **The pilot must not regress this**, while adding: pack-credit redemption, room-aware booking, admin policy management, refund-to-source, double-booking guarantees.

## Reading order if you're new to the codebase

1. `CONTEXT.md` (5 min) — the language.
2. `docs/onboarding.md` — this file.
3. `docs/vision.md` (3 min) — the why.
4. `docs/features/booking-pilot.md` (10 min) — the V0 scope.
5. `docs/architecture/zedslot-v0.md` (15 min) — the how.
6. `docs/stories/*.md` — read whichever Story you're about to spec/implement.

## Pre-implementation gates

Before writing any product code:

1. The story's spec must be at status `Validated` (read `.cursor/rules/agents/planner.mdc` for spec lifecycle).
2. The dependency-isolation rule applies (see above).
3. If the work touches Stripe / payments → `payments.mdc` rules apply (autonomy = L1, draft only).
4. If the work touches booking / slots / rooms → `booking.mdc` rules apply (autonomy = L1).
5. Tests come first (TDD skill loaded, see `.agents/skills/tdd/SKILL.md`).
