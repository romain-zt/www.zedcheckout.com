# Task 06: Update Story Component

## Objective
Replace existing story/case study section with transparent, single-client case study (LittleBiceps anonymized).

## File to Modify
- `components/Story.tsx`

## New Content Structure

### Title
"Notre approche : Mesurer. Pas inventer."

### Subtitle
"Nous avons 1 seul cas client à ce jour. Voici ce qu'on a fait, et ce qui s'est passé."

### Case Study Data
```
Client: Anonyme
Secteur: E-commerce mode
Période: 10 mois de données
Conversion checkout: 6.49% → 8.01%
Gain: +1.52 points
CA additionnel: +32,534€ sur 10 mois
```

### Changes Made
- ✓ Checkout 1 page (vs 3 pages)
- ✓ Champs réduits de 12 → 6 essentiels
- ✓ Trust badges repositionnés
- ✓ Optimisation mobile-first

### Transparency Disclaimer (Critical!)
```
⚠️ Disclaimer honnête :
• C'est notre SEUL cas validé à ce jour
• Résultats mesurés via GA4 sur 10 mois (pas A/B test)
• Nous sommes en Phase 0 : les prochains clients construiront notre track record
```

### Call to Action
"Vous serez parmi les 20 premiers."
- Avantage: Prix presale (-40%)
- Inconvénient: Moins de preuves que dans 6 mois

CTA: "Je veux être dans les 20 premiers"

## Visual Requirements
- Clean, data-focused layout
- Highlight before/after metrics clearly
- Disclaimer in distinct box (border, background color)
- Maintain responsive design
- Use project's color variables

## i18n Updates
Update `story` section in messages files with new content.

## Success Criteria
- [ ] Single case study displayed
- [ ] Metrics are accurate (6.49% → 8.01%)
- [ ] Disclaimer is prominent and clear
- [ ] No fake stats or exaggerations
- [ ] Visual design is clean and trustworthy
- [ ] i18n works for FR and EN
- [ ] Mobile responsive

