# [SPEC] Go-live Checklist

## Meta
- **Status:** Validated
- **Classification:** 4. Manual V1
- **Target:** zedslot
- **Author:** Agent
- **Date:** 2026-05-03

## Problem

After all tracks complete and CI is green, there's a series of manual/infra steps to ship the V0 pilot to production for Little Biceps. Without a documented checklist:
- Steps get missed or done out of order
- DNS propagation issues cause downtime
- Missing environment variables cause runtime failures
- No verification that the system actually works in production

## Solution

A sequential checklist of go-live steps with verification gates between each step.

## Scope

### In Scope
- DNS configuration for `book.littlebiceps.com` → Vercel
- DNS configuration for `admin.zedslot.com` → Vercel (if needed for V0)
- Neon production database setup
- Run migrations on prod
- Run seed on prod
- Set all environment variables in Vercel
- Smoke test on production
- Rollback plan

### Out of Scope
- SSL certificate provisioning — Vercel handles this automatically for custom domains
- CDN configuration — Vercel includes CDN
- Load balancer setup — not needed at V0 scale
- Monitoring dashboards — Sentry and PostHog SaaS dashboards are sufficient
- Customer communication / launch announcement

## Technical Design

### Pre-flight Checks

Before starting go-live:
- [ ] All 8 tracks (A through H) merged to main
- [ ] CI passes on main
- [ ] All specs marked `Implemented`
- [ ] Stripe account in live mode with correct webhook endpoint configured
- [ ] Resend domain verified for transactional emails
- [ ] PostHog project created with API key
- [ ] Sentry project created with DSN

### Go-live Sequence

**Step 1: Neon Database**
- Create production database on Neon
- Note connection string for `DATABASE_URL`
- Verify: `psql $DATABASE_URL -c 'SELECT 1'`

**Step 2: Environment Variables (Vercel)**
Set in both `apps/booking` and `apps/admin` projects:
- `DATABASE_URL` — Neon connection string
- `STRIPE_SECRET_KEY` — live mode
- `STRIPE_WEBHOOK_SECRET` — from webhook endpoint config
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — live mode
- `RESEND_API_KEY`
- `POSTHOG_API_KEY` (server-side)
- `NEXT_PUBLIC_POSTHOG_KEY` (client-side)
- `NEXT_PUBLIC_POSTHOG_HOST`
- `SENTRY_DSN`
- `AUTH_SECRET` — random 32-byte hex for magic-link JWT
- Verify: all vars set, no typos

**Step 3: Deploy `apps/admin`**
- Push to main or trigger deploy
- Payload runs `payload migrate` during build — creates all tables
- Verify: admin login at deployed URL works

**Step 4: EXCLUDE Constraints**
- Verify EXCLUDE constraints were applied during migration
- `psql $DATABASE_URL -c "\d bookings"` — check for `no_room_overlap` and `no_resource_overlap`

**Step 5: Run Seed**
- `DATABASE_URL=<prod> pnpm db:seed`
- Verify: `psql $DATABASE_URL -c "SELECT slug FROM tenants"` returns `littlebiceps`

**Step 6: Deploy `apps/booking`**
- Push to main or trigger deploy
- Verify: booking app loads at deployed URL

**Step 7: DNS**
- `book.littlebiceps.com` — CNAME → Vercel project domain for `apps/booking`
- `admin.zedslot.com` — CNAME → Vercel project domain for `apps/admin` (if V0)
- Verify: `dig book.littlebiceps.com CNAME` resolves correctly
- Wait for DNS propagation (up to 48h, typically minutes)

**Step 8: Smoke Test**
- [ ] Load `book.littlebiceps.com` — booking page renders
- [ ] Select a service — practitioner list loads
- [ ] Pick a slot — time picker shows availability
- [ ] Complete a test booking with Stripe test card — confirmation screen appears
- [ ] Check Stripe dashboard — payment shows
- [ ] Check admin — booking appears
- [ ] Cancel the test booking — refund processes
- [ ] Switch Stripe to live mode (if not already)
- [ ] Do one real booking + immediate cancel to verify the full pipeline

### Rollback Plan

If critical issues found after go-live:
1. DNS: Remove CNAME record → users see DNS error (fast, <5min)
2. Vercel: Revert to previous deployment via Vercel dashboard
3. Database: No automatic rollback — manual recovery via `payload migrate:reset` if schema is corrupted

### API / Interfaces

No code changes. Infrastructure and configuration only.

### Dependencies

| Service | Account needed |
|---------|---------------|
| Vercel | Project for `apps/booking` + `apps/admin` |
| Neon | Production database |
| Stripe | Live mode account + webhook |
| Resend | Verified domain |
| PostHog | Project + API key |
| Sentry | Project + DSN |
| DNS provider | Access to Little Biceps domain DNS |

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| DNS not propagated when user visits `book.littlebiceps.com` | DNS error / timeout — retry after propagation |
| Seed script run on a database that already has Little Biceps data | Idempotent — no duplicates, no errors |
| Stripe webhook endpoint URL is wrong | Bookings get stuck in `pending` — webhook verification fails, cron expires them after TTL |
| `payload migrate` fails during Vercel build | Build fails — deployment doesn't go live, previous version stays active |
| Environment variable missing in Vercel | App crashes on first request using that var — caught immediately in smoke test |

## Definition of Done

- [ ] DNS resolves `book.littlebiceps.com` to Vercel-hosted `apps/booking`
- [ ] Admin accessible at deployed URL with Payload login
- [ ] Migrations applied — all tables exist, EXCLUDE constraints verified
- [ ] Seed data present — Little Biceps tenant, services, resources, rooms
- [ ] Smoke test passes — full booking + cancel cycle on production
- [ ] Stripe webhook receives events and updates booking status
- [ ] Error tracking active — test exception appears in Sentry
- [ ] Analytics active — test event appears in PostHog

## Open Questions

- [x] Is `admin.zedslot.com` the final admin domain for V0, or should it be `admin.littlebiceps.com`? — **`admin.zedslot.com`**
- [x] Should we do a "soft launch" (invite-only) before opening `book.littlebiceps.com` publicly? — **Yes, soft launch first.**
