# [STORY] Tenant settings

## Meta
- **Status:** Draft
- **Feature link:** `docs/features/booking-pilot.md`
- **Priority:** P1
- **Created:** 2026-05-03

## User Statement

> As an admin, I can configure tenant-level settings — timezone, languages, default locale, branding (logo, primary color), institute address — so the booking subdomain matches my shop's identity and operates in my timezone.

## Acceptance Criteria

- [ ] PayloadCMS Tenant Settings global (singleton): `displayName`, `timezone` (IANA, e.g., `Europe/Paris`), `defaultLocale`, `locales[]`, `branding: { logoUrl, primaryColorHex, secondaryColorHex }`, `address: { line1, line2, postalCode, city, country }`, `contactEmail`, `contactPhone`.
- [ ] Booking subdomain reads tenant settings on every request (cached with revalidation tag, invalidated on settings change).
- [ ] Timezone change applies immediately to new bookings; existing bookings retain their `startsAt` (stored as UTC) and continue to display correctly.
- [ ] Language change reflects in customer-facing UI immediately (no rebuild required for content; copy is i18n-keyed).
- [ ] Branding is applied to: booking subdomain (logo header, button colors, primary headings), confirmation/reminder emails (logo + accent color).
- [ ] Address surfaced on confirmation screen, confirmation email, and as schema.org metadata for SEO.

## Specs

- [ ] `specs/tenant-settings-global.md` — Payload global schema, validation
- [ ] `specs/branding-application.md` — how branding flows from DB to UI + email templates
- [ ] `specs/i18n-strategy.md` — message catalog, fallback, dynamic locale switching

## Out of Scope (for this Story)

- Multi-location per tenant (V1+).
- Custom domains beyond CNAME (e.g., zedslot-managed DNS provisioning) — V1 multi-tenant SaaS extraction Feature.
- Custom CSS or template customization — V2.
- Multi-currency (V2).

## Definition of Shipped

- [ ] All Specs implemented and merged.
- [ ] Little Biceps' actual branding (logo, navy + salmon palette from `tailwind.config.js` reference) configured end-to-end.
- [ ] Both FR and EN configured; QA verified.
- [ ] Timezone test: changing tenant timezone correctly shifts displayed slots without changing stored `startsAt` UTC values.
