# Task 04: Extend Waitlist Form

## Objective
Add qualification fields to the waitlist form to pre-qualify prospects before booking calls.

## File to Modify
- `components/Waitlist.tsx`

## New Form Fields (Add Before Existing Fields)

### 1. Annual Revenue Select
```typescript
name: "annualRevenue"
required: true
options:
  - "< 50K€/an" (shows warning)
  - "50K - 150K€/an"
  - "150K - 500K€/an"
  - "500K€+/an"
```

### 2. Monthly Traffic Select
```typescript
name: "monthlyTraffic"
required: true
options:
  - "< 1,000 visiteurs/mois" (shows warning)
  - "1,000 - 5,000"
  - "5,000 - 20,000"
  - "20,000+"
```

### 3. Shopify Plus Status Radio
```typescript
name: "isShopifyPlus"
required: true
options:
  - "Oui" (shows warning)
  - "Non"
```

### 4. Preferred Option Select
```typescript
name: "preferredOption"
required: true
options:
  - "Option 1 (0€ → 2%)"
  - "Option 2 (2,990€ → 0%)"
  - "Pas sûr, je veux en discuter"
```

## Client-Side Validation Logic

### Warning Display
If any disqualifying condition:
- Show: "⚠️ Votre profil ne correspond pas aux critères actuels. Vous pouvez quand même envoyer votre demande."
- Change submit button text to: "Envoyer quand même"
- Style warnings in red with icon

### Disqualifying Conditions
- Annual revenue < 50K
- Monthly traffic < 1,000
- Shopify Plus = Yes

## Styling Requirements
- Warnings: red border on select, red text with ⚠️ icon
- Smooth fade-in animation for warnings
- Maintain existing form styling
- Mobile responsive

## i18n Updates
Add new translation keys to waitlist section:
- Field labels
- Options
- Warning messages

## Success Criteria
- [ ] All 4 new fields render correctly
- [ ] Warnings show for disqualifying answers
- [ ] Form still submits (captures all data)
- [ ] Submit button text changes appropriately
- [ ] Mobile responsive
- [ ] i18n works for FR and EN

