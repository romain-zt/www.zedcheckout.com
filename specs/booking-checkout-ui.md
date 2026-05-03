# [SPEC] Booking Checkout UI — Single-Page Mobile-First Flow

## Meta
- **Status:** Validated
- **Classification:** 2. Project Primitive
- **Target:** zedslot V0
- **Story:** Implements the customer-facing hosted checkout page at `/`
- **Author:** Agent (Spec + Implementer)
- **Date:** 2026-05-03

## Problem

The booking app (`apps/booking`) has a full backend (API routes, handlers, domain logic, booking engine) but no customer-facing UI. Visitors to `book.<merchant>.com` see nothing. We need the mobile-first scrollable checkout page that is the product's wedge — no cart, no Shopify, guest-by-default, one-page flow.

## Solution

A single Next.js 15 App Router page at `/` in `apps/booking` that renders a linear top-to-bottom flow: service picker → practitioner picker → slot picker → customer info → pack credit affordance → Stripe Payment Element → confirmation screen. All steps visible on one scrollable page (no multi-page wizard). State managed client-side with React state. API data fetched via `fetch()` to existing API routes.

## Scope

### In Scope
- `packages/ui` — create the shared UI package with shadcn-style primitives + CVA variants (Card, Button, Input, Skeleton, Badge, ScrollArea, Spinner)
- Service picker — cards from `GET /api/services`, locale-aware `name` (fr/en), price in EUR
- Practitioner picker — filtered by selected service's `eligibleResourceIds` (returned from services API), auto-select if single eligible
- Slot picker — next 14 days from `GET /api/slots?serviceId=X&resourceId=Y`, grouped by day with horizontal scrollable day tabs
- Customer info form — name, email, phone (minimal, no account)
- "Use my pack credit" affordance — triggers magic-link auth via `POST /api/auth/magic-link` + `GET /api/auth/verify?token=X`, then `GET /api/customer/balance`
- Stripe Payment Element — card + Apple Pay + Google Pay, using `clientSecret` from `POST /api/bookings` response
- Confirmation screen — booking details + "add to calendar" links (ICS download, Google Calendar URL, Apple Calendar URL) using `generateICS`/`generateGoogleCalendarUrl`/`generateAppleCalendarUrl` from `@zedslot/booking-engine`
- Booking status polling — after payment, poll `GET /api/bookings/{id}` for `pending` → `confirmed`/`failed`
- PostHog funnel events — typed event tracking (no direct PostHog import; inline analytics helper in the app for now since `packages/analytics` doesn't exist yet)
- Services API response extended to include `eligibleResourceIds` + `eligibleRoomIds` for client-side filtering
- Resources API route (`GET /api/resources`) to fetch practitioner names

### Out of Scope
- Manage/cancel/reschedule page (separate track)
- Email templates (separate spec, already validated)
- Admin UI
- A/B testing harness
- Native `packages/analytics` package (V0.1)
- Shopify order writeback

## Technical Design

### Component Tree

```
app/layout.tsx (html, body, Tailwind globals, Stripe Elements provider)
app/page.tsx (server component: bootstrap, render <BookingFlow />)
components/
  BookingFlow.tsx (client component: main state machine)
  ServicePicker.tsx (service cards grid)
  PractitionerPicker.tsx (resource selection)
  SlotPicker.tsx (day tabs + time grid)
  CustomerForm.tsx (name, email, phone)
  PackCreditSection.tsx (magic-link auth + balance display)
  PaymentSection.tsx (Stripe Payment Element)
  ConfirmationScreen.tsx (booking details + calendar links)
  BookingStatusPoller.tsx (polls booking status)
```

### API Changes

#### `GET /api/services` — extend response
Add `eligibleResourceIds` and `eligibleRoomIds` to each service in the response.

#### `GET /api/resources?ids=X,Y,Z` — new route
Returns resources by IDs (for practitioner names).

#### `GET /api/bookings/{id}` — new route
Returns booking status for polling.

### State Machine (Client)

```
idle → service_selected → practitioner_selected → slot_selected →
  → customer_info_filled → payment_ready →
  → POST /api/bookings → slot_held →
  → Stripe confirm → polling → confirmed | failed
```

### Dependencies
- `@zedslot/ui` — new package (created in this PR)
- `@zedslot/domain` — entity types
- `@zedslot/booking-engine` — calendar URL generators (used in confirmation)
- `@stripe/stripe-js` + `@stripe/react-stripe-js` — Stripe Elements (added to `apps/booking` only)
- Existing API routes in `apps/booking/src/app/api/`

### Idempotency
- Service/slot/resource fetches are GET → safe to retry
- `POST /api/bookings` uses existing idempotency (same booking returned if pending exists)
- Stripe Payment Element handles its own retry logic

## Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| No services available | Empty state message |
| Single practitioner for service | Auto-selected, picker hidden |
| No slots available in 14 days | "No availability" message |
| Slot taken between pick and payment | 409 from API → show "slot taken" + suggest next |
| Payment fails | Show error, allow retry on same hold |
| 3DS required | Stripe handles redirect; polling picks up confirmation |
| Network error during fetch | Show retry button |
| Pack credit ≥ total | No Stripe element shown; confirm immediately |
| Magic-link not yet clicked | Show "check your email" + polling for session |
| Browser closed mid-payment | Hold expires at 15min; no charge |
| Apple Pay unavailable | Payment Element falls back to card |
| Mobile viewport < 320px | Graceful scaling, no horizontal overflow |

## Definition of Done

- [ ] `packages/ui` created with Card, Button, Input, Skeleton, Badge, ScrollArea, Spinner primitives
- [ ] `apps/booking` has `layout.tsx` with Tailwind + global styles
- [ ] `apps/booking` has `page.tsx` at `/` rendering the booking flow
- [ ] Service picker displays services from API with locale-aware names and prices
- [ ] Practitioner picker filters by service eligibility, auto-selects single
- [ ] Slot picker shows 14 days grouped by day with scrollable tabs
- [ ] Customer form collects name, email, phone with validation
- [ ] Pack credit section: magic-link flow + balance display
- [ ] Stripe Payment Element renders with clientSecret
- [ ] Confirmation screen shows booking details + calendar links
- [ ] Booking status polling works (pending → confirmed)
- [ ] Analytics events tracked at each funnel step
- [ ] Mobile-first verified: 320px, 375px, 768px, 1024px
- [ ] 44px minimum touch targets
- [ ] No direct SDK imports (Stripe in app is OK — it's a UI-only SDK)
- [ ] TypeScript strict, no `any`

## Open Questions

- [x] `packages/analytics` doesn't exist yet — inline analytics helper in app for now, extract later (confirmed by absence of package)
- [x] `packages/ui` doesn't exist — create it as part of this work (confirmed by task requirements)
- [x] Stripe.js is a client-side SDK, not a server SDK — direct import in booking app is acceptable per dependency-isolation (Stripe server SDK is in `packages/payments`)
