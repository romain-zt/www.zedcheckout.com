# Landing Page ZedCheckout - Version Sécurisée

## 🎯 Stratégie Globale

Cette landing page utilise une **approche subtile et sécurisée** pour présenter ZedCheckout sans révéler publiquement :
- ❌ Aucune mention "Shopify" en public
- ❌ Aucun détail technique sur le "contournement"
- ✅ Focus sur les bénéfices et l'expérience
- ✅ Mystère maintenu : "On explique en privé"

## 📋 Structure de la Landing

### 1. **Hero** (`ZedHero.tsx`)
- **Message principal** : "68% abandonnent au checkout. Transformez cette friction en conversation."
- **Subhead** : Présentation générique, pas de mention plateforme
- **Trust Bar** : Installation gérée, Compatible e-commerce, 10 places
- **CTA** : Ouvre le formulaire de capture lead

### 2. **Problem** (`ZedProblem.tsx`)
- **3 cartes de douleur** :
  1. Questions sans réponse
  2. Dissonance cognitive (premium vs checkout froid)
  3. Limitations plateforme (générique, pas "Shopify")
- **Quote** : "Le problème n'est pas votre offre, c'est que votre checkout ne lui rend pas justice"

### 3. **Solution** (`ZedSolution.tsx`)
- **Comparaison** : Checkout classique vs ZedCheckout
- **Pas de détails techniques** : On montre le "quoi", pas le "comment"
- **Callout mystère** : "Comment on fait ça techniquement ? → On explique en privé"

### 4. **Filter** (`ZedFilter.tsx`)
- **Qualification subtile** sans mention Shopify :
  - Coaching/formations/premium
  - Panier moyen >150€
  - Plateforme e-commerce moderne (vague)
  - Trafic régulier
  - Compréhension de l'expérience

### 5. **Process** (`ZedProcess.tsx`)
- **3 étapes** :
  1. **Découverte** : Formulaire + analyse compatibilité
  2. **Échange privé** : On explique TOUT en call (pas d'écrit)
  3. **Installation** : On gère de A à Z
- **Callout** : "Configurations complexes → On gère l'installation"

### 6. **FAQ** (`ZedFAQ.tsx`)
- **5 questions sécurisées** :
  1. Compatibilité plateforme ? → "On évalue lors de l'échange"
  2. Pourquoi 10 places ? → Installation personnalisée
  3. Prix ? → "On partage après évaluation"
  4. Risques ? → Aucun engagement
  5. Comment vous faites ? → "Détails en privé (propriété intellectuelle)"

### 7. **Final CTA** (`ZedFinalCTA.tsx`)
- **Grand CTA** : "Transformez votre checkout en expérience"
- **Subhead** : 10 places, janvier 2026, candidatures jusqu'au 15 janvier
- **3 rassurances** : Analyse rapide, échange privé, aucun engagement

## 📝 Formulaire Lead Capture (`LeadCaptureForm.tsx`)

### Champs du formulaire :
1. **Prénom + Nom** (requis)
2. **Email professionnel** (requis)
3. **URL boutique** (requis) - avec helper text "On regarde juste votre config"
4. **Plateforme e-commerce** (requis, dropdown) :
   - Shopify
   - WooCommerce
   - PrestaShop
   - Custom / Autre
5. **Secteur** (requis, dropdown) :
   - Coaching
   - Bien-être
   - Formations
   - E-commerce premium
   - Autre
6. **CA annuel** (facultatif, dropdown) :
   - <50K
   - 50-150K
   - 150-500K
   - 500K+
   - Préfère ne pas dire
7. **Principal défi checkout** (requis, textarea)
8. **Consentement** (checkbox requis)

### Logique de filtrage (back-end) :

```typescript
// Dans app/actions/lead-capture.ts
const isCompatible = platform === 'shopify'; // Seul Shopify est compatible

// Si NON compatible :
// 1. Email admin avec badge "⚠️ LEAD NON-COMPATIBLE"
// 2. Email automatique à l'utilisateur : "Pas compatible pour l'instant, on vous tiendra au courant"

// Si COMPATIBLE :
// 1. Email admin avec badge "✅ LEAD COMPATIBLE"
// 2. Pas d'email automatique (tu contactes manuellement)
```

## 🔒 Sécurité

### Ce qu'on dit en PUBLIC (landing, emails) :
- ✅ "Compatible e-commerce"
- ✅ "Plateforme e-commerce moderne"
- ✅ "Optimisations propriétaires"
- ✅ "On explique en privé"
- ❌ Jamais "Shopify"
- ❌ Jamais "contournement"
- ❌ Jamais détails techniques

### Ce qu'on révèle en CALL PRIVÉ :
- ✅ Shopify (plateforme exclusive)
- ✅ Interception pré-checkout
- ✅ Architecture complète
- ✅ Conversation 3 questions → checkout Shopify
- ✅ Demande de discrétion

## 🎨 Style & Design

- **Couleurs** :
  - Primary: `#1E2A47` (Navy)
  - Accent: `#E88B7A` (Salmon)
  - Secondary: `#FFC9B9` (Light Salmon)
  - Background: `#F5EDE4` (Beige)
- **Typographie** : Font bold/black pour les headlines
- **Animations** : Framer Motion (fade in, slide up)
- **Layout** : Responsive, sections alternées

## 📧 Emails Automatiques

### Email 1 : Lead NON-compatible
**Déclenché si** : Plateforme ≠ Shopify

**Contenu** :
```
Bonjour [Prénom],

Merci d'avoir soumis votre candidature pour ZedCheckout.

Après analyse de votre setup technique, nous devons vous informer que 
[Plateforme] n'est pas encore compatible avec ZedCheckout.

Nous travaillons activement à étendre notre support à d'autres plateformes. 
Nous vous tiendrons au courant dès que votre plateforme sera supportée.

Bien cordialement,
Romain Piveteau
Fondateur, ZedCheckout
```

### Email 2 : Lead compatible (manuel, pas automatique)
**À envoyer manuellement** après réception du lead Shopify

**Contenu** (exemple dans le prompt initial de l'utilisateur) :
- Confirmation analyse
- Explication vague de la solution
- Lien Calendly pour call 30 min
- Pricing révélé
- Détails techniques → EN CALL

## 🚀 Prochaines Étapes

### À faire maintenant :
1. ✅ Tester le formulaire localement
2. ✅ Vérifier les emails (variables d'env `CONTACT_MAIL_ADDRESS` et `CONTACT_MAIL_PASSWORD`)
3. ✅ Ajouter Calendly link dans les emails manuels
4. ✅ Créer template email "lead compatible" (à envoyer manuellement)

### À faire avant lancement :
1. **SEO** : Vérifier meta tags (pas de mention Shopify)
2. **Analytics** : Configurer GA4 events (`lead_capture_submitted`, `hero_viewed`)
3. **Legal** : Mentions légales, RGPD (consentement explicite)
4. **Testing** : A/B test headlines, CTA

### Script call (mémo pour toi) :
```
1. Bonjour, merci d'avoir postulé
2. Questions sur leur situation actuelle
3. REVEAL technique :
   - Shopify a verrouillé checkout
   - On intercepte AVANT
   - Conversation 3 questions
   - Redirect vers Shopify avec infos pré-remplies
   - "C'est pas un contournement, c'est une expérience pré-checkout"
4. Demande de discrétion : "On en parle pas publiquement"
5. Questions / objections
6. Pricing si intéressé
7. Next steps : installation janvier
```

## 📂 Fichiers Modifiés

### Nouveaux composants :
- `components/ZedHero.tsx`
- `components/ZedProblem.tsx`
- `components/ZedSolution.tsx`
- `components/ZedFilter.tsx`
- `components/ZedProcess.tsx`
- `components/ZedFAQ.tsx`
- `components/ZedFinalCTA.tsx`
- `components/LeadCaptureForm.tsx`

### Nouvelles actions :
- `app/actions/lead-capture.ts`

### Fichiers i18n modifiés :
- `messages/fr-FR.json` (ajout section `zedcheckout` et `leadCapture`)
- `messages/en-EN.json` (ajout section `zedcheckout` et `leadCapture`)

### Page principale :
- `app/[locale]/page.tsx` (nouvelle structure avec composants Zed*)

## 🎯 KPIs à Tracker

1. **Conversion funnel** :
   - Hero viewed
   - Scroll to Problem
   - Scroll to Solution
   - CTA clicked
   - Form opened
   - Form submitted
   - Platform breakdown (Shopify vs autres)

2. **Lead quality** :
   - % leads compatibles (Shopify)
   - % leads qualifiés (CA, trafic, secteur)
   - Taux de réponse call booking

3. **Messaging efficacy** :
   - Temps passé sur page
   - Taux de rebond
   - Questions FAQ les plus consultées

---

**Note finale** : Cette landing est **volontairement vague** en public. Le mystère crée l'intrigue. Le reveal technique se fait UNIQUEMENT en call privé, sans trace écrite publique. C'est la clé pour protéger l'approche technique de ZedCheckout.
