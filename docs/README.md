# ZedCheckout / zedslot — Product Documentation

Internal product & engineering docs for the **zedslot** booking pilot (V0) and the broader **zedcheckout** platform.

> Public marketing copy on `www.zedcheckout.com` is deliberately vague and never names Shopify publicly. **These docs are internal** and may name Shopify, customers, technical implementation details, etc., freely.

## Layout

| Path | Purpose |
|---|---|
| `docs/vision.md` | The North Star — who we serve, the wedge, non-goals, success signals, future-features pipeline. |
| `docs/features/` | One Markdown file per Feature. Each Feature is a big capability that decomposes into Stories. |
| `docs/stories/` | One file per user-facing shippable Story. Each Story decomposes into one or more technical Specs (added later). |
| `docs/architecture/` | Cross-cutting architecture documents (e.g., `zedslot-v0.md` — the V0 booking pilot architecture). |

## Work hierarchy

```
Vision → Feature → Story → Spec → Task
```

A Spec is the technical contract for a Story. A Task is a concrete unit of implementation work. V0 is currently at the **Story** level (specs come next via the writing-plans flow).

## Status of V0 (booking pilot)

- Vision: drafted (`docs/vision.md`)
- Feature: `docs/features/booking-pilot.md` (Proposed → Active on PRD approval)
- Future Feature stub: `docs/features/native-loyalty-pack-credit.md` (V0.1)
- Stories: 13 stubs in `docs/stories/` (P0 + P1 only; future stories live in the Vision until their Feature is opened)
- Architecture: `docs/architecture/zedslot-v0.md`
- Specs: not yet written. Will be created via the writing-plans flow once the PRD is approved.
