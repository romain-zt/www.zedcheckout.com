# Task 07: Verify All Component Integrations

## Objective
Audit all remaining components to ensure they reflect conservative promises and remove any fake stats.

## Files to Check

### 1. Hero.tsx
- [ ] Verify subtitle shows "+20%" (not +30-40%)
- [ ] Check tag is correct
- [ ] Confirm CTAs are appropriate
- [ ] Review i18n key usage

### 2. EconomicJustification.tsx
- [ ] Ensure ROI calculations are conservative
- [ ] Verify no inflated promises
- [ ] Check wording is authentic
- [ ] Confirm i18n keys match updated messages

### 3. Offers.tsx
- [ ] Verify both options show "+20%" promise
- [ ] Check presale pricing (2,990€)
- [ ] Ensure "20 places" badge is present
- [ ] Confirm CTAs lead to waitlist

### 4. Choices.tsx
- [ ] Review option descriptions
- [ ] Ensure no aggressive sales copy
- [ ] Verify pricing consistency

### 5. Process.tsx
- [ ] Confirm 5-step process is clear
- [ ] Check timeline is realistic
- [ ] Verify CTA is "Booker l'appel"

### 6. ROICalculator.tsx
- [ ] Verify calculations use +20% baseline
- [ ] Check default values are reasonable
- [ ] Ensure calculator is functional

## Specific Checks

### Remove/Replace
- ❌ Any mention of "Baymard Institute"
- ❌ Conversion promises > +20%
- ❌ Fake testimonials
- ❌ Inflated statistics
- ❌ Authority signals that aren't earned

### Verify
- ✅ All CTAs lead to #waitlist
- ✅ Pricing is consistent (2,990€ presale)
- ✅ 20 places limit mentioned
- ✅ Phase 0 / early adopter messaging
- ✅ Conservative promises throughout

## Component Order in page.tsx
Verify correct order:
1. Hero
2. **Qualification** (new)
3. EconomicJustification
4. Choices
5. Notice
6. Story (updated)
7. Process
8. ROICalculator
9. Offers
10. Waitlist (updated)
11. Footer

## Success Criteria
- [ ] All components use updated i18n
- [ ] No promises > +20% anywhere
- [ ] No fake stats remain
- [ ] Component order is correct
- [ ] All CTAs work properly
- [ ] Visual consistency maintained
- [ ] No TypeScript errors

