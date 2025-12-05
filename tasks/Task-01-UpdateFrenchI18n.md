# Task 01: Update French i18n Messages

## Objective
Update `messages/fr-FR.json` with authentic, conservative copy focusing on transparency and realistic promises.

## Files to Modify
- `messages/fr-FR.json`

## Key Changes

### 1. Hero Section
- Change subtitle from "+30-40%" to "+20%"
- Update tag to "🔬 Chercheur Indépendant E-commerce"
- CTA becomes "Vérifier mon éligibilité" (not just "Voir les formules")

### 2. New Qualification Section
Add completely new section with keys:
- `qualification.title`: "Cette solution n'est PAS pour tout le monde"
- `qualification.criteria`: List of ❌ disqualifiers
- `qualification.validText`: Validation text for qualified prospects
- `qualification.cta`: "Faire le diagnostic gratuit"

### 3. Story Section (Case Study)
Replace with LittleBiceps anonymized data:
- Single client case (not multiple)
- Real metrics: 6.49% → 8.01% conversion (+1.52%)
- 10 months of data
- Add transparency disclaimer
- CA additionnel: +32,534€ sur 10 mois

### 4. Economic Section
- Keep structure but ensure conservative wording
- Emphasize "s'autofinance" concept

### 5. Waitlist Section
- Title: "Vérifiez votre éligibilité en 2 minutes"
- Add new field labels for qualification questions
- Add warning texts for non-qualified prospects

### 6. Remove All References
- ❌ Baymard Institute
- ❌ Stats > +20% conversion
- ❌ Fake authority signals

## Success Criteria
- [ ] Hero promises ≤ +20% conversion
- [ ] Qualification section added
- [ ] Story section shows 1 real case with disclaimer
- [ ] Waitlist updated with eligibility language
- [ ] No Baymard mentions
- [ ] JSON is valid (no syntax errors)

