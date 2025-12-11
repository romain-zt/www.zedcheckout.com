# 🎨 Chat Widget - Guide Visuel & Intégration

## 🌐 DEMO LIVE

**Testez le chat widget maintenant :**

👉 **[OUVRIR LA DÉMO](https://3000-ic5jc8w5qz9nqx9gwbwiv-de59bda9.sandbox.novita.ai/chat-demo)**

---

## 🎯 Vue d'ensemble

Le Chat Widget ZedCheckout est un système de qualification de leads conversationnel avec un design **glassmorphism premium**. Il transforme la capture de leads traditionnelle en une expérience interactive et engageante.

---

## ✨ Caractéristiques visuelles

### 1. **Barre flottante (État fermé)**

```
┌─────────────────────────────────────────────────┐
│  💬  Discutons de votre projet                  │
│      Cliquez pour commencer              →      │
└─────────────────────────────────────────────────┘
     ↑                                        ↑
 Avatar avec                              Glow effect
 indicateur en ligne                      au hover
```

**Design details :**
- Backdrop blur-xl (effet verre)
- Border blanc semi-transparent
- Glow effect orange/salmon au hover
- Animation pulse sur l'indicateur "en ligne"
- Centré en bas de page
- Responsive : Full width sur mobile

---

### 2. **Fenêtre de chat (État ouvert)**

```
╔═══════════════════════════════════════════════╗
║  💬 ZedCheckout Assistant          En ligne  ✕║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ┌─────────────────────────────────┐         ║
║  │ 👋 Salut ! Je suis l'assistant  │  10:30  ║
║  │ ZedCheckout...                   │         ║
║  └─────────────────────────────────┘         ║
║                                               ║
║         ┌────────────────────────┐            ║
║   10:31 │ Oui, allons-y !        │            ║
║         └────────────────────────┘            ║
║                                               ║
║  ┌─────────────────────────────────┐         ║
║  │ Pour commencer, comment         │  10:31  ║
║  │ vous appelez-vous ? 😊          │         ║
║  └─────────────────────────────────┘         ║
║                                               ║
╠═══════════════════════════════════════════════╣
║  Tapez votre réponse...               [Send] ║
╚═══════════════════════════════════════════════╝
```

**Design details :**
- Header : Gradient navy (#1E2A47 → #2D3E5F)
- Messages bot : Blanc/opaque, border gris clair, arrondis à gauche
- Messages user : Gradient salmon (#E88B7A → #FFC9B9), arrondis à droite
- Background messages : Gradient blanc dégradé
- Input : Blanc/80, backdrop blur, focus ring salmon
- Bouton send : Gradient salmon, hover effect avec scale

---

### 3. **Animations clés**

#### Opening animation
```typescript
initial={{ opacity: 0, y: 100, scale: 0.8 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
// Spring animation pour un effet élastique naturel
```

#### Message appearance
```typescript
initial={{ opacity: 0, y: 20, scale: 0.9 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
// Chaque message pop depuis le bas avec légère scale
```

#### Typing indicator
```typescript
<div className="animate-bounce" style={{ animationDelay: '0ms' }} />
<div className="animate-bounce" style={{ animationDelay: '150ms' }} />
<div className="animate-bounce" style={{ animationDelay: '300ms' }} />
// 3 dots avec bounce décalé pour effet vague
```

---

## 🔧 Intégration dans votre projet

### Option 1 : Intégration globale (Recommandé)

Ajoutez dans votre layout principal :

```tsx
// app/layout.tsx ou app/[locale]/layout.tsx
import ChatWidget from '@/components/ChatWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget /> {/* Disponible sur toutes les pages */}
      </body>
    </html>
  );
}
```

**Avantages :**
- ✅ Présent sur toutes les pages
- ✅ État persistant lors de la navigation
- ✅ Un seul chargement du composant

---

### Option 2 : Intégration par page

Pour certaines pages uniquement :

```tsx
// app/landing/page.tsx
import ChatWidget from '@/components/ChatWidget';

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <Features />
      <ChatWidget /> {/* Uniquement sur cette page */}
    </div>
  );
}
```

**Avantages :**
- ✅ Contrôle fin de la visibilité
- ✅ Peut varier le comportement par page
- ❌ Se réinitialise entre pages

---

### Option 3 : Intégration conditionnelle

Afficher selon certaines conditions :

```tsx
// app/layout.tsx
import ChatWidget from '@/components/ChatWidget';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();
  
  // Afficher uniquement sur certaines pages
  const showChat = ['/landing', '/pricing', '/demo'].some(
    path => pathname.startsWith(path)
  );

  return (
    <html>
      <body>
        {children}
        {showChat && <ChatWidget />}
      </body>
    </html>
  );
}
```

---

## 🎨 Customisation avancée

### Changer les couleurs du thème

```tsx
// components/ChatWidget.tsx

// Remplacer les classes Tailwind :

// Gradient accent (boutons, messages user)
className="from-[#E88B7A] to-[#FFC9B9]"
// → Votre gradient

// Couleur principale (header)
className="from-[#1E2A47] to-[#2D3E5F]"
// → Votre couleur primaire

// Border glow
className="from-[#E88B7A] via-[#FFC9B9] to-[#E88B7A]"
// → Votre couleur d'accent
```

---

### Personnaliser les questions

```tsx
const QUALIFICATION_FLOW = [
  {
    key: 'company',
    question: "Quelle est votre entreprise ?",
  },
  {
    key: 'role',
    question: "Quel est votre rôle ?",
  },
  {
    key: 'goal',
    question: "Quel est votre objectif principal ?",
  },
  // Ajoutez vos propres questions
];
```

**Types de validation disponibles :**

```tsx
// Email
validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// URL
validator: (value) => /^https?:\/\/.+/.test(value)

// Nombre
validator: (value) => !isNaN(Number(value))

// Longueur min
validator: (value) => value.length >= 10

// Choix multiples
validator: (value) => ['option1', 'option2', 'option3'].includes(value)
```

---

### Modifier le greeting message

```tsx
// Dans useEffect, ligne ~58
addBotMessage(
  "👋 Bonjour ! Je suis [Votre nom].\n\n" +
  "[Votre pitch].\n\n" +
  "J'ai quelques questions rapides. Ça vous va ?"
);
```

**Tips :**
- Utilisez `\n\n` pour les paragraphes
- Emojis pour humaniser (👋 🎯 ⚡ 💡)
- Gardez court (max 3-4 lignes)
- Ton conversationnel, pas corporate

---

### Modifier le message de fin

```tsx
// Dans handleSubmit, ligne ~147
addBotMessage(
  `Parfait ${updatedLeadData.name} ! 🎉\n\n` +
  `[Votre message de remerciement]\n\n` +
  `[Next steps]\n\n` +
  `[CTA]`
);
```

---

## 📱 Responsive Design

Le widget s'adapte automatiquement :

### Desktop (> 768px)
```
- Position : Centré en bas
- Largeur : max-w-md (448px)
- Hauteur messages : 400px
- Spacing : Généreux (p-6)
```

### Tablet (768px - 1024px)
```
- Position : Centré en bas
- Largeur : max-w-md avec padding latéral
- Hauteur messages : 400px
- Touch-friendly buttons
```

### Mobile (< 768px)
```
- Position : Full width avec margin 16px
- Largeur : calc(100vw - 32px)
- Hauteur messages : 300px (ajusté automatiquement)
- Keyboard-aware (monte au-dessus du clavier)
- Boutons : min-height 44px (iOS guidelines)
```

---

## 🚀 Performance

### Optimisations intégrées

1. **Lazy animations**
   - Framer Motion charge uniquement quand nécessaire
   - AnimatePresence pour unmount propre

2. **Auto-scroll optimisé**
   - `scrollIntoView({ behavior: 'smooth' })`
   - Déclenché uniquement sur nouveaux messages

3. **State management**
   - Aucun re-render inutile
   - UseRef pour éviter re-créations

4. **Bundle size**
   - Framer Motion : ~30kb gzipped
   - Composant : ~5kb gzipped
   - Total : ~35kb (négligeable)

---

## 📊 Analytics recommandés

### Events à tracker

```typescript
// À ajouter dans ChatWidget.tsx

// Chat ouvert
analytics.track('chat_opened', {
  source_page: window.location.pathname,
  timestamp: new Date(),
});

// Question répondue
analytics.track('chat_question_answered', {
  question_index: currentQuestionIndex,
  question_key: currentQuestion.key,
  answer_length: userInput.length,
});

// Qualification complétée
analytics.track('chat_qualification_completed', {
  lead_qualified: isQualified,
  time_to_complete: completionTime,
  platform: leadData.platform,
});

// Chat fermé
analytics.track('chat_closed', {
  completed: isComplete,
  questions_answered: currentQuestionIndex,
});
```

### KPIs clés

| Metric | Description | Goal |
|--------|-------------|------|
| **Open Rate** | % visiteurs qui ouvrent | > 15% |
| **Completion Rate** | % qui terminent le flow | > 60% |
| **Time to Complete** | Temps moyen | < 2 min |
| **Qualified Rate** | % leads Shopify | > 30% |
| **Email Click Rate** | % qui cliquent CTA email | > 40% |

---

## 🎯 Best Practices

### 1. Timing d'apparition

**Option A : Immédiat (actuel)**
```tsx
// Visible dès le chargement de la page
<ChatWidget />
```

**Option B : Après scroll**
```tsx
const [showChat, setShowChat] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 500) setShowChat(true);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

{showChat && <ChatWidget />}
```

**Option C : Après temps sur page**
```tsx
const [showChat, setShowChat] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowChat(true), 10000); // 10s
  return () => clearTimeout(timer);
}, []);

{showChat && <ChatWidget />}
```

---

### 2. A/B Testing suggestions

Test ces variantes :

| Variant | Change | Hypothesis |
|---------|--------|------------|
| **A (Control)** | Design actuel | Baseline |
| **B (Timing)** | Apparaît après 30s | Moins intrusif |
| **C (Position)** | Coin droit au lieu de centré | Plus familier |
| **D (Copy)** | "Besoin d'aide ?" au lieu de "Discutons" | Plus utilitaire |
| **E (Urgency)** | "Places limitées" dans greeting | Plus FOMO |

---

### 3. Copywriting tips

**Greeting message :**
- ✅ "Salut" au lieu de "Bonjour" (plus casual)
- ✅ Nom du bot pour humaniser
- ✅ Valeur claire (pourquoi répondre ?)
- ❌ Trop long (max 3 lignes)
- ❌ Jargon technique

**Questions :**
- ✅ Une question à la fois
- ✅ Ton conversationnel ("Et vous ?" au lieu de "Indiquez")
- ✅ Emojis pour ton friendly
- ❌ Questions fermées (oui/non)
- ❌ Questions sensibles trop tôt (revenue)

**Fin :**
- ✅ Récapitulatif des infos
- ✅ Next steps clairs
- ✅ Timeframe de réponse
- ❌ Promesses vagues
- ❌ Trop de CTA

---

## 🐛 Debug Mode

Pour activer les logs de debug :

```tsx
// En haut de ChatWidget.tsx
const DEBUG = true;

// Dans les fonctions
if (DEBUG) console.log('Lead data:', leadData);
if (DEBUG) console.log('Current question:', currentQuestionIndex);
```

Ajoutez ces logs pour tracker :
- État du chat (ouvert/fermé)
- Index question actuelle
- Données lead accumulées
- Erreurs de validation
- Réponses API

---

## 🌍 Internationalisation

Pour supporter plusieurs langues :

```tsx
// components/ChatWidget.tsx
import { useTranslations } from 'next-intl';

export default function ChatWidget() {
  const t = useTranslations('chatWidget');
  
  const QUALIFICATION_FLOW = [
    { key: 'name', question: t('questions.name') },
    { key: 'email', question: t('questions.email') },
    // ...
  ];
  
  addBotMessage(t('greeting'));
}
```

```json
// messages/fr-FR.json
{
  "chatWidget": {
    "greeting": "👋 Salut ! Je suis l'assistant ZedCheckout...",
    "questions": {
      "name": "Comment vous appelez-vous ?",
      "email": "Quel est votre email ?"
    }
  }
}
```

---

## 📞 Support

**Questions ? Bugs ? Suggestions ?**

- 📧 Email : romain@zedcheckout.com
- 💬 Chat : [Testez le widget !](https://3000-ic5jc8w5qz9nqx9gwbwiv-de59bda9.sandbox.novita.ai/chat-demo)
- 📚 Code source : `/components/ChatWidget.tsx`

---

**Fait avec 💜 par ZedTech**

*Checkout conversationnel nouvelle génération*
