# 🤖 AI-Powered Chat Widget - Documentation

## 🎯 Vue d'ensemble

Version **AI-powered** du chat widget ZedCheckout utilisant **Claude 3.5 Sonnet** (Anthropic) pour des conversations naturelles et intelligentes.

### Différences clés vs version classique

| Feature | Version Classique | Version AI |
|---------|-------------------|------------|
| **Conversation** | Flow pré-défini (7 questions) | Naturelle et adaptative |
| **Questions** | Ordre fixe | Contextuel et flexible |
| **Réponses aux questions** | ❌ Pas possible | ✅ Réponses intelligentes |
| **Extraction d'infos** | Champs exacts | AI extrait du langage naturel |
| **Personnalisation** | Template messages | Ton conversationnel adaptatif |

---

## ✨ Capacités de l'AI

### 1. Conversation naturelle
```
User: "Salut ! Je veux améliorer mes conversions"
AI: "Hey ! 👋 Cool objectif. Je suis l'assistant ZedCheckout, 
     on booste les conversions via le checkout conversationnel.
     Comment tu t'appelles ?"
```

### 2. Réponses aux questions
```
User: "C'est quoi exactement ZedCheckout ?"
AI: "ZedCheckout remplace ton checkout classique par une convo 
     WhatsApp. On récupère les paniers abandonnés automatiquement. 
     Ça booste la conversion de 20-40%. Tu as une boutique e-commerce ?"
```

### 3. Extraction intelligente
```
User: "Je suis Thomas, ma boîte c'est ShopLuxe sur Shopify, 
      on fait environ 80K par mois"
      
AI extrait:
{
  "firstName": "Thomas",
  "company": "ShopLuxe", 
  "platform": "Shopify",
  "monthlyRevenue": "80K"
}
```

### 4. Conseils e-commerce
```
User: "Comment je peux réduire mes abandons de panier ?"
AI: "3 tips rapides : 1) Affiche les frais de livraison tôt, 
     2) Propose du paiement en 3x, 3) Relance par email sous 1h. 
     ZedCheckout fait tout ça automatiquement. Tu veux qu'on en parle ?"
```

---

## 🔧 Architecture technique

### Stack
```
Frontend (ChatWidgetAI.tsx)
    ↓
API Endpoint (/api/chat-ai)
    ↓
Claude 3.5 Sonnet (Anthropic)
    ↓
Structured JSON Response
    ↓
Email notification (qualification complète)
```

### Format des échanges

**Request:**
```json
{
  "message": "Message utilisateur",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "leadData": {
    "firstName": "...",
    "email": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "message": "Réponse de l'AI",
    "extractedData": {
      "firstName": "Thomas",
      "email": "thomas@shop.com"
    },
    "isQualificationComplete": false
  },
  "usage": {
    "inputTokens": 150,
    "outputTokens": 80
  }
}
```

---

## 📝 System Prompt

Le prompt système définit :

### Rôle de l'AI
- Assistant conversationnel ZedCheckout
- Objectif : Capturer infos + répondre aux questions
- Qualification intelligente

### Style conversationnel
- **Court** : Max 2-3 phrases
- **Friendly** : Ton conversationnel
- **Émojis subtils** : 1-2 max
- **Français naturel** : Adaptatif (tu/vous)

### Données à capturer
1. Prénom
2. Email
3. Téléphone (optionnel)
4. Entreprise/Marque
5. Plateforme e-commerce
6. CA/GMV mensuel
7. Panier moyen
8. Défi principal

### Connaissances produit
- **C'est quoi ?** : Checkout conversationnel WhatsApp/Instagram
- **Comment ça marche ?** : Interception pré-checkout, 3 questions, redirect
- **Prix ?** : 300-800€/mois selon volume
- **Compatibilité ?** : Shopify (WooCommerce bientôt)
- **Installation ?** : Setup en 48h, géré A-Z

### Conseils e-commerce
Si demandé, l'AI peut donner des tips sur :
- Réduction abandons de panier
- Optimisation checkout
- Augmentation panier moyen
- Stratégies de relance

---

## 🚀 Intégration

### 1. Variables d'environnement

Ajoutez dans `.env.local` :
```bash
# Existing
CONTACT_MAIL_ADDRESS="votre-email@gmail.com"
CONTACT_MAIL_PASSWORD="votre-app-password"

# New AI Keys
ANTHROPIC_API_KEY="sk-ant-api03-..."
PERPLEXITY_API_KEY="pplx-..." # Optionnel (futur)
```

### 2. Installation dépendances

```bash
npm install @anthropic-ai/sdk
```

### 3. Utilisation dans une page

```tsx
import ChatWidgetAI from '@/components/ChatWidgetAI';

export default function Page() {
  return (
    <div>
      {/* Votre contenu */}
      <ChatWidgetAI />
    </div>
  );
}
```

---

## 💬 Exemples de conversations

### Scénario 1 : Qualification directe

```
AI: 👋 Salut ! Je suis l'assistant ZedCheckout. Comment tu t'appelles ?

User: Thomas

AI: Cool Thomas ! Pour qu'on puisse discuter de ton projet, 
    tu peux me donner ton email ?

User: thomas@shopluxe.com

AI: Parfait ! C'est pour quelle boutique ou marque ?

User: ShopLuxe, on vend du mobilier design

AI: Top ! Vous êtes sur quelle plateforme ? (Shopify, WooCommerce...)

User: Shopify

AI: Excellent, Shopify est parfait pour ZedCheckout. 
    Quel est votre CA mensuel approximatif ?

User: Environ 120K

AI: Super volume ! Quel est votre plus gros défi avec le checkout ?

User: Trop d'abandons, les gens posent des questions qu'on ne voit pas

AI: Exactement le problème qu'on résout ! 🎯
    [Qualification complète → Email envoyé]
```

### Scénario 2 : Questions puis qualification

```
AI: 👋 Salut ! Je suis l'assistant ZedCheckout. Comment tu t'appelles ?

User: C'est quoi ZedCheckout ?

AI: ZedCheckout remplace ton checkout classique par une conversation 
    WhatsApp. On récupère les paniers abandonnés automatiquement. 
    Ça booste la conversion de 20-40%. Tu as une boutique e-commerce ?

User: Oui, je vends des formations en ligne

AI: Cool ! Les formations aussi ça marche. Comment tu t'appelles ?

User: Je suis Marie

AI: Parfait Marie ! Ton email pour qu'on discute de ton projet ?

User: marie@formations.com

AI: Top ! Tu es sur quelle plateforme ?

User: WordPress avec WooCommerce

AI: OK, pour l'instant ZedCheckout est optimisé pour Shopify uniquement. 
    WooCommerce arrive bientôt. Je note ton profil et on te tient au courant ?
    [Qualification complète → Email auto-rejet + Admin notifié]
```

### Scénario 3 : Demande de conseil

```
AI: 👋 Salut ! Je suis l'assistant ZedCheckout. Comment tu t'appelles ?

User: Salut, j'ai besoin de conseils pour réduire mes abandons de panier

AI: Je peux t'aider ! 3 tips rapides :
    1) Affiche les frais de livraison dès le panier
    2) Propose du paiement en 3x
    3) Relance par email dans l'heure
    
    C'est ce que ZedCheckout fait automatiquement. Tu veux en savoir plus ?

User: Oui carrément

AI: Cool ! Comment tu t'appelles pour qu'on discute ?

[Continue la qualification...]
```

---

## 🎨 Customisation

### Modifier le prompt système

Éditez `/app/api/chat-ai/route.ts` :

```typescript
const SYSTEM_PROMPT = `
Tu es l'assistant de [VOTRE MARQUE].

TON RÔLE
- Objectif 1
- Objectif 2

TON STYLE
- Style point 1
- Style point 2

DONNÉES À CAPTURER
- Champ 1
- Champ 2

etc.
`;
```

### Ajuster le modèle Claude

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Version actuelle
  // ou
  model: 'claude-3-opus-20240229', // Plus puissant mais plus cher
  // ou  
  model: 'claude-3-haiku-20240307', // Plus rapide et moins cher
  
  max_tokens: 500, // Augmenter pour réponses plus longues
  temperature: 0.7, // 0 = déterministe, 1 = créatif
});
```

### Modifier le seuil de qualification

Dans `/components/ChatWidgetAI.tsx` :

```typescript
// Condition actuelle
if (aiResponse.isQualificationComplete) {
  completeQualification();
}

// Custom : Qualifier si au moins 4 champs
const requiredFields = ['firstName', 'email', 'platform', 'monthlyRevenue'];
const hasMinimumData = requiredFields.every(field => leadData[field]);
if (hasMinimumData) {
  completeQualification();
}
```

---

## 📊 Monitoring & Analytics

### Données à tracker

```typescript
// Dans ChatWidgetAI.tsx, après chaque message AI

// 1. Token usage
analytics.track('ai_chat_message', {
  inputTokens: data.usage.inputTokens,
  outputTokens: data.usage.outputTokens,
  cost: calculateCost(data.usage), // À implémenter
});

// 2. Extraction réussie
if (aiResponse.extractedData) {
  analytics.track('data_extracted', {
    fields: Object.keys(aiResponse.extractedData),
    count: Object.keys(aiResponse.extractedData).length,
  });
}

// 3. Qualification complète
if (aiResponse.isQualificationComplete) {
  analytics.track('qualification_completed', {
    messagesCount: messages.length,
    timeToComplete: Date.now() - startTime,
    platform: leadData.platform,
  });
}

// 4. Questions posées par user
if (detectQuestion(userMessage)) {
  analytics.track('user_question', {
    question: userMessage,
    topic: classifyTopic(userMessage), // À implémenter
  });
}
```

### KPIs clés

| Metric | Description | Goal |
|--------|-------------|------|
| **Completion Rate** | % conversations qualifiées | > 50% |
| **Time to Qualify** | Temps moyen de qualification | < 3 min |
| **Questions Asked** | Nb questions par user | 1-2 |
| **AI Accuracy** | % extraction correcte | > 95% |
| **Cost per Lead** | Coût AI par lead qualifié | < 0.20€ |
| **User Satisfaction** | Feedback positif | > 80% |

---

## 💰 Coûts AI

### Pricing Claude 3.5 Sonnet (Nov 2024)

- **Input** : $3 / 1M tokens
- **Output** : $15 / 1M tokens

### Estimation par conversation

**Conversation typique :**
- Messages user : 5-8 messages × ~50 tokens = 250-400 tokens
- Messages AI : 5-8 messages × ~100 tokens = 500-800 tokens
- Prompt système : ~800 tokens (chaque appel)
- **Total input** : ~1400 tokens = $0.0042
- **Total output** : ~600 tokens = $0.009
- **TOTAL par lead** : ~$0.013 (0.013€)

**Pour 100 leads qualifiés/mois :**
- Coût AI : ~1.30€
- **Négligeable !**

---

## 🔒 Sécurité & Best Practices

### 1. Rate Limiting

À implémenter dans `/app/api/chat-ai/route.ts` :

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue...
}
```

### 2. Input Sanitization

```typescript
// Nettoyer les inputs user
const sanitizeInput = (input: string) => {
  return input
    .trim()
    .slice(0, 500) // Max 500 chars
    .replace(/[<>]/g, ''); // Remove HTML tags
};

const userMessage = sanitizeInput(message);
```

### 3. Error Handling

```typescript
try {
  const response = await anthropic.messages.create({...});
} catch (error) {
  // Log pour debugging
  console.error('Claude API error:', error);
  
  // Fallback message friendly
  return NextResponse.json({
    success: true,
    response: {
      message: "Désolé, j'ai un petit souci. Peux-tu reformuler ?",
      extractedData: {},
      isQualificationComplete: false,
    },
  });
}
```

### 4. API Key Security

```bash
# .env.local (NEVER commit)
ANTHROPIC_API_KEY="sk-ant-..."

# .gitignore
.env.local
.env*.local
```

---

## 🚀 Déploiement

### Vercel (recommandé)

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: Add AI chat widget"
git push origin main
```

2. **Configurer Vercel**
- Connecter repo GitHub
- Ajouter env vars : `ANTHROPIC_API_KEY`, `CONTACT_MAIL_*`
- Deploy !

3. **Variables d'environnement**
```
ANTHROPIC_API_KEY=sk-ant-api03-...
CONTACT_MAIL_ADDRESS=your@email.com
CONTACT_MAIL_PASSWORD=your-app-password
NODE_ENV=production
```

### Autres plateformes

**Railway / Render / Fly.io :**
- Même process
- Ajouter les env vars
- Configurer le build command : `npm run build`
- Start command : `npm start`

---

## 🐛 Troubleshooting

### "Invalid API key"
```
Error: 401 Unauthorized

Solution:
1. Vérifier ANTHROPIC_API_KEY dans .env.local
2. Tester la clé : curl https://api.anthropic.com/v1/messages \
   -H "x-api-key: $ANTHROPIC_API_KEY"
3. Régénérer la clé sur console.anthropic.com
```

### "Rate limit exceeded"
```
Error: 429 Too Many Requests

Solution:
1. Implémenter rate limiting côté app
2. Upgrade le tier Anthropic (console.anthropic.com)
3. Ajouter retry logic avec exponential backoff
```

### L'AI ne répond pas en JSON
```
Problem: Response text non parsable

Solution:
1. Vérifier le prompt système (format JSON explicite)
2. Augmenter max_tokens (500 → 800)
3. Fallback: Wrapper le texte dans un objet JSON
```

### Les infos ne sont pas extraites
```
Problem: extractedData vide

Solution:
1. Améliorer le prompt (exemples plus clairs)
2. Ajouter contexte leadData dans le prompt
3. Parser manuellement si l'AI ne le fait pas
```

---

## 📚 Ressources

### Documentation
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [Anthropic SDK TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)

### Pricing
- [Anthropic Pricing](https://www.anthropic.com/pricing)

### Alternatives AI
- **OpenAI GPT-4** : Plus connu, mais plus cher
- **Google Gemini** : Multimodal, bon pricing
- **Mistral AI** : Open-source, moins cher

---

## 🎯 Prochaines améliorations

### v1.1
- [ ] Détection de sentiment (urgent vs casual)
- [ ] Multi-langue auto-détection
- [ ] Quick reply buttons suggérés par l'AI
- [ ] Résumé automatique en fin de convo

### v1.2
- [ ] Memory entre sessions (base vectorielle)
- [ ] Personnalisation selon l'industrie
- [ ] A/B testing de prompts
- [ ] Analytics dashboard

### v2.0
- [ ] Voice messages (Whisper API)
- [ ] Image understanding (produits, screenshots)
- [ ] Intégration CRM auto
- [ ] Multi-agent (handoff to human)

---

**Built with 🤖 by ZedTech**

*Conversations intelligentes, conversions maximales*
