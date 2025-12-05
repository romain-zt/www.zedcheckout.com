# Task 03: Create Qualification Component

## Objective
Create a new React component to filter non-qualified prospects immediately after the Hero section.

## New File
- `components/Qualification.tsx`

## Component Specifications

### Design
- Full-width section with `background: var(--light-gray)`
- Max-width: 800px centered
- Padding: 60px vertical (40px on mobile)
- Border-radius: 16px for inner card
- Subtle box-shadow

### Content Structure
```
Title: "Cette solution n'est PAS pour tout le monde"

❌ Disqualifiers (red):
- CA < 50K€/an
- Trafic < 1,000 visiteurs/mois
- Déjà sur Shopify Plus
- Taux de conversion satisfaisant

✅ Validation text

CTA Button: "Faire le diagnostic gratuit"
```

### Technical Requirements
- Use `useTranslations('qualification')` for i18n
- TypeScript with proper types
- Responsive design (2 cols desktop, 1 col mobile)
- CTA scrolls to `#waitlist`
- Follow project's CSS variable pattern
- Match styling of other components (EconomicJustification, Choices)

### Integration
Update `app/[locale]/page.tsx`:
- Import Qualification component
- Insert after `<Hero />` component

## Success Criteria
- [ ] Component renders without errors
- [ ] i18n works for FR and EN
- [ ] Responsive on mobile
- [ ] CTA scrolls to waitlist
- [ ] Styling matches design system
- [ ] TypeScript has no errors

