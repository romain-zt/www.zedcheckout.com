# Environment Variables

All environment variables required to run the zedcheckout monorepo apps. Every variable consumed by app code is read through its wrapper package (see `dependency-isolation` rule) — apps never read secrets directly.

## Full Variable Reference

| Variable | Required by | Required | Description |
|----------|-------------|----------|-------------|
| `DATABASE_URL` | admin, booking | Yes | Neon Postgres connection string |
| `STRIPE_SECRET_KEY` | booking | Yes | Stripe secret key (live or test mode) |
| `STRIPE_WEBHOOK_SECRET` | booking | Yes | Stripe webhook endpoint signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | booking | Yes | Stripe publishable key (client-side) |
| `RESEND_API_KEY` | booking | Yes | Resend transactional email API key |
| `POSTHOG_API_KEY` | booking, admin | Yes | PostHog server-side API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | booking | Yes | PostHog client-side API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | booking | No | PostHog host (defaults to `https://app.posthog.com`) |
| `SENTRY_DSN` | booking, admin | Yes | Sentry project DSN for error tracking |
| `AUTH_SECRET` | booking | Yes | 32-byte hex secret for magic-link JWT signing |
| `SHOPIFY_ADMIN_API_TOKEN` | booking | Yes | Shopify Admin API access token |
| `SHOPIFY_STORE_DOMAIN` | booking | Yes | Shopify store domain (e.g., `littlebiceps.myshopify.com`) |
| `PAYLOAD_SECRET` | admin | Yes | PayloadCMS encryption secret |
| `NODE_ENV` | all | Auto | Set automatically by Vercel (`production`, `development`) |

## Per-App Breakdown

### `apps/booking` (Next.js)

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `POSTHOG_API_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (optional)
- `SENTRY_DSN`
- `AUTH_SECRET`
- `SHOPIFY_ADMIN_API_TOKEN`
- `SHOPIFY_STORE_DOMAIN`

### `apps/admin` (PayloadCMS + Next.js)

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `POSTHOG_API_KEY`
- `SENTRY_DSN`

## Generating Secrets

```bash
# AUTH_SECRET — 32-byte hex
openssl rand -hex 32

# PAYLOAD_SECRET — 32-byte hex
openssl rand -hex 32
```

For third-party keys, obtain them from the respective dashboards:

- **Stripe**: <https://dashboard.stripe.com/apikeys>
- **Resend**: <https://resend.com/api-keys>
- **PostHog**: <https://app.posthog.com/project/settings>
- **Sentry**: Project Settings → Client Keys (DSN)
- **Shopify**: Admin → Apps → [your app] → API credentials

## Local Development Setup

### 1. Start Postgres

```bash
docker compose up -d
```

This starts a Postgres 16 container on port 5434 (to avoid conflicts with any local Postgres on 5432).

### 2. Create `.env.local`

```bash
cp .env.local.example .env.local
```

The defaults point to the Docker Postgres. Add your Stripe test keys if you want payment flows to work; otherwise the booking app falls back to InMemory test doubles.

### 3. Run migrations

```bash
pnpm --filter @zedslot/admin db:migrate
```

This runs `payload migrate` which creates all tables (Payload internal + business tables).

### 4. Apply EXCLUDE constraints (once after initial migration)

```bash
psql postgresql://zedslot:zedslot_dev@localhost:5434/zedslot < tooling/exclude-constraints.sql
```

### 5. Seed data

```bash
pnpm db:seed
```

Seeds Little Biceps V0 data: tenant, admin user (`admin@littlebiceps.com` / `changeme123!`), 4 practitioners, 2 rooms, 3 services, availability rules, global policy.

The seed is idempotent — safe to run multiple times.

### 6. Start dev servers

```bash
pnpm dev
```

- Booking app: http://localhost:3001
- Admin: http://localhost:3002 (login with `admin@littlebiceps.com` / `changeme123!`)

## Vercel Configuration

All variables must be set in the Vercel project dashboard under **Settings → Environment Variables**.

- Set variables for each environment: **Production**, **Preview**, **Development**.
- `NEXT_PUBLIC_*` variables are embedded at build time — changing them requires a redeploy.
- Server-only variables (e.g., `STRIPE_SECRET_KEY`) are available at runtime and do not require a rebuild when rotated.
- Use Vercel's **Sensitive** toggle for secrets to prevent them from appearing in build logs.
- For monorepo deployments, each app (booking, admin) is a separate Vercel project with its own set of environment variables.
