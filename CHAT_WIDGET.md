# 💬 ZedCheckout Chat Widget

## 🎯 Vue d'ensemble

Chat widget conversationnel premium avec design glassmorphism pour qualifier les leads automatiquement via une conversation naturelle.

---

## ✨ Features

### Design & UX
- **Glassmorphism design** : Backdrop blur, transparence, bordures subtiles
- **Animations fluides** : Framer Motion pour toutes les transitions
- **Vanish input** : Placeholder avec effet de disparition
- **Typing indicators** : Animation "..." pendant que le bot répond
- **Message bubbles** : Style WhatsApp moderne
- **Mobile-responsive** : Parfait sur tous les devices
- **Micro-interactions** : Hover effects, scale, glow effects

### Fonctionnalités
- **Greeting automatique** : Message d'accueil à l'ouverture
- **Lead qualification flow** : 7 questions pour qualifier le lead
- **Validation en temps réel** : Vérification email, messages d'erreur
- **Auto-scroll** : Scroll automatique vers le nouveau message
- **Timestamps** : Heure d'envoi des messages
- **État de complétion** : Confirmation visuelle à la fin

### Backend
- **API endpoint** : `/api/chat-lead` pour recevoir les données
- **Email automatique** : 
  - Admin : Lead avec badge qualifié/non-qualifié
  - User (non-qualifié) : Email de rejet automatique
- **Qualification Shopify** : Filtrage automatique des leads compatibles

---

## 📁 Architecture

```
├── components/
│   └── ChatWidget.tsx          # Composant principal du chat
├── app/
│   ├── api/chat-lead/
│   │   └── route.ts            # API endpoint pour les leads
│   └── chat-demo/
│       └── page.tsx            # Page de démo du chat
```

---

## 🔧 Installation & Configuration

### 1. Variables d'environnement

Le chat utilise les mêmes variables que le reste de l'app :

```bash
# .env.local
CONTACT_MAIL_ADDRESS="votre-email@gmail.com"
CONTACT_MAIL_PASSWORD="votre-app-password"
```

### 2. Intégration dans une page

```tsx
import ChatWidget from '@/components/ChatWidget';

export default function YourPage() {
  return (
    <div>
      {/* Votre contenu */}
      <ChatWidget />
    </div>
  );
}
```

C'est tout ! Le widget est **autonomous** et gère tout seul :
- Son état (ouvert/fermé)
- Le flow de conversation
- L'envoi des données
- Les animations

---

## 💬 Flow de conversation

### Questions posées (dans l'ordre) :

1. **Nom** : "Pour commencer, comment vous appelez-vous ?"
2. **Email** : "Quel est votre email professionnel ?" (validé)
3. **Entreprise** : "Quel est le nom de votre entreprise ?"
4. **Plateforme** : "Sur quelle plateforme e-commerce êtes-vous ?"
5. **CA mensuel** : "Quel est votre CA mensuel approximatif ?"
6. **Panier moyen** : "Quel est votre panier moyen ?"
7. **Défi principal** : "Quel est votre plus grand défi avec votre checkout ?"

### Logique de qualification :

```typescript
const isQualified = platform.toLowerCase().includes('shopify');
```

- **Si Shopify** → Lead qualifié ✅
  - Email admin avec badge vert "LEAD QUALIFIÉ"
  - Pas d'email automatique au lead (contact manuel)

- **Si autre plateforme** → Lead non-qualifié ⚠️
  - Email admin avec badge orange "NON-COMPATIBLE"
  - Email automatique au lead : "Pas compatible pour l'instant"

---

## 🎨 Customisation

### Couleurs

Modifier les couleurs dans `ChatWidget.tsx` :

```tsx
// Gradient principal (accents)
from-[#E88B7A] to-[#FFC9B9]

// Couleur principale (header, boutons)
bg-[#1E2A47]

// Couleur secondaire
bg-[#2D3E5F]
```

### Questions

Modifier le flow dans `QUALIFICATION_FLOW` :

```tsx
const QUALIFICATION_FLOW = [
  {
    key: 'name',
    question: "Votre question ici",
    validator: (value) => value.length > 0, // Optionnel
    errorMessage: "Message d'erreur", // Optionnel
  },
  // ...
];
```

### Greeting message

Modifier dans `useEffect` :

```tsx
addBotMessage(
  "👋 Votre message d'accueil personnalisé ici..."
);
```

---

## 📧 Emails

### Email Admin (Lead qualifié)

```
✅ LEAD QUALIFIÉ - Nouveau lead Chat Widget: [Nom]

Lead capturé avec toutes les infos :
- Nom, email, entreprise
- Plateforme (Shopify)
- CA mensuel, panier moyen
- Défi principal

Action requise : Contacter rapidement pour booker un call !
```

### Email Admin (Lead non-qualifié)

```
⚠️ LEAD NON-COMPATIBLE - Nouveau lead Chat Widget: [Nom]

Lead capturé mais plateforme non compatible (ex: WooCommerce)

Un email automatique lui a été envoyé pour l'informer.
```

### Email User (Non-qualifié uniquement)

```
Merci [Nom],

Après analyse, [Plateforme] n'est pas encore compatible 
avec ZedCheckout.

Nous vous tiendrons au courant dès que votre plateforme 
sera supportée.

Romain Piveteau
Fondateur, ZedCheckout
```

---

## 🚀 Testing

### Page de démo

Accédez à `/chat-demo` pour tester le widget :

```bash
npm run dev
# Puis ouvrir http://localhost:3000/chat-demo
```

### Test complet

1. **Cliquez** sur le chat widget (en bas, centré)
2. **Répondez** aux 7 questions
3. **Testez** avec :
   - Email invalide → Message d'erreur
   - Platform "Shopify" → Lead qualifié
   - Platform "WooCommerce" → Lead non-qualifié
4. **Vérifiez** :
   - Emails reçus
   - Animations fluides
   - Responsive mobile

---

## 🎯 KPIs à tracker

### Engagement
- **Chat open rate** : % visiteurs qui ouvrent le chat
- **Completion rate** : % qui terminent le flow
- **Average time to complete** : Temps moyen de complétion
- **Drop-off points** : À quelle question abandonnent-ils ?

### Qualité des leads
- **% leads qualifiés** (Shopify)
- **Taux de réponse** après contact
- **Time to first response** : Délai avant contact

### Performance
- **Load time** : Temps de chargement du widget
- **Mobile vs Desktop** : Taux d'engagement par device

---

## 📱 Mobile Optimization

Le widget est **mobile-first** :

- Largeur adaptative (`max-w-md`)
- Touch-friendly buttons (min 44px)
- Keyboard-aware (scroll automatique)
- Pas de hover sur mobile (tap uniquement)

---

## 🔒 Sécurité

### Validation côté serveur
```typescript
// app/api/chat-lead/route.ts
if (!name || !email || !company || !platform) {
  return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
}
```

### Rate limiting (à ajouter)
```typescript
// TODO: Implémenter rate limiting
// Ex: Max 3 submissions par IP par heure
```

### Spam protection (à ajouter)
```typescript
// TODO: Ajouter honeypot ou reCAPTCHA
```

---

## 🐛 Troubleshooting

### Le chat ne s'affiche pas
- Vérifier que `framer-motion` est installé : `npm install framer-motion`
- Vérifier l'import : `import ChatWidget from '@/components/ChatWidget'`

### Les emails ne partent pas
- Vérifier `.env.local` : `CONTACT_MAIL_ADDRESS` et `CONTACT_MAIL_PASSWORD`
- Vérifier que c'est un **App Password** Gmail (pas le mot de passe normal)
- Tester l'endpoint : `POST /api/chat-lead` avec Postman

### Les animations sont saccadées
- Vérifier que le composant n'est pas re-render inutilement
- Utiliser `React.memo()` si nécessaire
- Vérifier la performance avec React DevTools

---

## 🎨 Design System

### Spacing
- Padding widget : `p-6` (24px)
- Gap messages : `space-y-4` (16px)
- Border radius : `rounded-3xl` (24px), `rounded-2xl` (16px)

### Typography
- Titres : `font-semibold`, `font-bold`
- Corps : `text-sm` (14px), `text-xs` (12px)
- Line height : `leading-relaxed`

### Colors
```css
/* Primaires */
Navy: #1E2A47
Navy Light: #2D3E5F

/* Accents */
Salmon: #E88B7A
Light Salmon: #FFC9B9

/* UI */
White/10: rgba(255,255,255,0.1)
White/20: rgba(255,255,255,0.2)
```

---

## 🚀 Roadmap

### v1.1 (à venir)
- [ ] Support multilingue (EN/FR)
- [ ] Typing speed variable selon longueur
- [ ] Boutons quick reply
- [ ] Attachments (images, fichiers)
- [ ] Voice messages

### v1.2
- [ ] Analytics intégré (Mixpanel/Segment)
- [ ] A/B testing des questions
- [ ] Lead scoring automatique
- [ ] Intégration CRM (HubSpot, Salesforce)

### v2.0
- [ ] AI-powered responses (GPT-4)
- [ ] Sentiment analysis
- [ ] Multi-agent support
- [ ] Live chat handoff

---

## 📞 Support

Pour toute question :
- **Email** : romain@zedcheckout.com
- **Repo** : Voir le code dans `components/ChatWidget.tsx`

---

**Built with ❤️ by ZedTech**
