# Task 08: Final Testing & Build Verification

## Objective
Comprehensive testing and build verification before deployment.

## Build Tests

### 1. Next.js Build
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] i18n compiles correctly

### 2. Development Server
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Hot reload works
- [ ] No console errors

## Functional Tests

### French Locale (fr-FR)
- [ ] Hero loads with correct copy
- [ ] Qualification section displays
- [ ] Story shows transparent case study
- [ ] Waitlist form shows all new fields
- [ ] Form submission works
- [ ] Warnings display for non-qualified inputs
- [ ] All CTAs scroll to correct sections
- [ ] Mobile responsive (test on small viewport)

### English Locale (en-EN)
- [ ] All same tests as French
- [ ] Translations are accurate
- [ ] No missing translation keys
- [ ] Currency symbols correct

## Form Testing

### Qualified Prospect Flow
Input data:
- Revenue: 150K - 500K€
- Traffic: 5,000 - 20,000
- Shopify Plus: Non
- Option: Option 2

Expected:
- [ ] No warnings shown
- [ ] Submit button normal
- [ ] Form submits successfully
- [ ] Success message displays

### Non-Qualified Prospect Flow
Input data:
- Revenue: < 50K€
- Traffic: < 1,000
- Shopify Plus: Oui

Expected:
- [ ] Warnings display in red
- [ ] Submit button says "Envoyer quand même"
- [ ] Form still submits
- [ ] Email received with ⚠️ flag

## Email Verification

### Check Received Email
- [ ] Subject indicates qualification status
- [ ] All new fields present in email
- [ ] Warning flag shows for non-qualified
- [ ] Email formatting is clean
- [ ] Contact details correct

## Content Verification

### Final Copy Audit
- [ ] No mentions of Baymard
- [ ] All promises ≤ +20%
- [ ] Story disclaimer is visible
- [ ] Qualification section works
- [ ] Pricing consistent (2,990€)
- [ ] "20 places presale" visible

## Performance

### Basic Checks
- [ ] Page loads quickly
- [ ] Images load properly
- [ ] No layout shift
- [ ] Smooth scrolling works

## Cross-Browser (Optional)
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Success Criteria
✅ All tests pass
✅ Build succeeds
✅ Both locales work
✅ Form captures qualification data
✅ Copy is authentic and conservative
✅ Ready for deployment

