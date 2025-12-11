# Landing Page ZedCheckout - Approche Sécurisée ✅

## 🎯 Transformation Complète

Landing page **entièrement refaite** avec stratégie subtile et sécurisée :

### ✅ Ce qui a été fait :

1. **Contenu i18n complet** (FR + EN) dans `messages/`
   - Section `zedcheckout` (hero, problem, solution, filter, process, faq, finalCta)
   - Section `leadCapture` (formulaire complet)

2. **7 nouveaux composants React** dans `components/` :
   - `ZedHero.tsx` - Hero avec messaging subtil
   - `ZedProblem.tsx` - 3 cards de douleur (dissonance cognitive)
   - `ZedSolution.tsx` - Comparaison sans détails techniques
   - `ZedFilter.tsx` - Qualification subtile
   - `ZedProcess.tsx` - 3 étapes avec "reveal en call"
   - `ZedFAQ.tsx` - 5 questions sécurisées
   - `ZedFinalCTA.tsx` - CTA final avec rassurances
   - `LeadCaptureForm.tsx` - Formulaire avec 8 champs (plateforme, secteur, CA, défi...)

3. **Action server-side** dans `app/actions/lead-capture.ts` :
   - Filtrage automatique selon plateforme
   - Email admin avec badge ✅ Compatible / ⚠️ Non-compatible
   - Email automatique de rejet si plateforme ≠ Shopify

4. **Page principale** `app/[locale]/page.tsx` mise à jour avec nouvelle structure

## 🔒 Stratégie de Sécurité

### EN PUBLIC (landing, emails automatiques) :
- ✅ "Compatible e-commerce" (jamais "Shopify")
- ✅ "Optimisations propriétaires"
- ✅ "On explique en privé"
- ❌ Aucun détail technique
- ❌ Aucune mention "contournement"

### EN CALL PRIVÉ (pas d'écrit) :
- ✅ Reveal complet : Shopify, interception, architecture
- ✅ Demande de discrétion

## 📝 Formulaire Lead Capture

**8 champs** :
1. Prénom + Nom *
2. Email professionnel *
3. URL boutique * (helper: "On regarde juste votre config")
4. **Plateforme e-commerce*** (dropdown: Shopify, WooCommerce, PrestaShop, Custom)
5. Secteur * (dropdown: Coaching, Bien-être, Formations, Premium, Autre)
6. CA annuel (optionnel, dropdown: <50K, 50-150K, 150-500K, 500K+)
7. Principal défi checkout * (textarea)
8. Consentement * (checkbox)

### Filtrage automatique :
```typescript
if (platform === 'shopify') {
  // ✅ Email admin "LEAD COMPATIBLE"
  // Tu contactes manuellement
} else {
  // ⚠️ Email admin "LEAD NON-COMPATIBLE"
  // + Email automatique utilisateur "Pas compatible pour l'instant"
}
```

## 🚀 Lancer en Dev

```bash
npm run dev
```

Puis ouvre http://localhost:3000

## ✅ Build Testé

```bash
npm run build
```

✅ Build réussi, aucune erreur TypeScript

## 📧 Variables d'environnement requises

Dans `.env.local` :
```
CONTACT_MAIL_ADDRESS="ton@email.com"
CONTACT_MAIL_PASSWORD="ton_mot_de_passe_app"
```

## 📂 Fichiers Modifiés/Créés

**Composants** (7 nouveaux) :
- `components/ZedHero.tsx`
- `components/ZedProblem.tsx`
- `components/ZedSolution.tsx`
- `components/ZedFilter.tsx`
- `components/ZedProcess.tsx`
- `components/ZedFAQ.tsx`
- `components/ZedFinalCTA.tsx`
- `components/LeadCaptureForm.tsx`

**Actions** (1 nouvelle) :
- `app/actions/lead-capture.ts`

**i18n** (2 modifiés) :
- `messages/fr-FR.json` (+ sections `zedcheckout` et `leadCapture`)
- `messages/en-EN.json` (+ sections `zedcheckout` et `leadCapture`)

**Page** (1 modifié) :
- `app/[locale]/page.tsx`

**Docs** :
- `ZEDCHECKOUT_LANDING.md` (documentation complète)
- `README_LANDING.md` (ce fichier)

## 🎯 Checklist Avant Lancement

- [ ] Tester formulaire en dev
- [ ] Vérifier emails (admin + rejet auto)
- [ ] Ajouter Calendly link pour leads compatibles
- [ ] Vérifier meta tags SEO (pas de mention Shopify)
- [ ] Configurer GA4 events (`lead_capture_submitted`)
- [ ] Tester responsive mobile
- [ ] Vérifier RGPD / mentions légales

## 📊 KPIs à Tracker

1. **Taux de conversion** : Visits → Form opened → Form submitted
2. **Breakdown plateforme** : % Shopify vs autres
3. **Lead quality** : % leads qualifiés (CA, secteur, trafic)
4. **Taux booking call** : Leads → Calls effectués

---

**Note** : Cette landing est **volontairement vague** en public. Le mystère crée l'intrigue. Le reveal technique = UNIQUEMENT en call privé.

Voir `ZEDCHECKOUT_LANDING.md` pour documentation complète avec exemples d'emails, script call, etc.
