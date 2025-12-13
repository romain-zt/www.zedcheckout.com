# ZedCheckout Conversational AI - Documentation Complète

## 🎯 Vue d'ensemble

API de chat conversationnel conçue pour qualifier les prospects B2B e-commerce selon un funnel en 7 étapes. Utilise le streaming SSE (Server-Sent Events) pour simuler des conversations WhatsApp/SMS naturelles avec splitting de messages et délais de frappe réalistes.

---

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Endpoints API](#endpoints-api)
3. [Système de Qualification](#système-de-qualification)
4. [Formats de Réponse](#formats-de-réponse)
5. [Intégration Frontend](#intégration-frontend)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Tests](#tests)
8. [Déploiement](#déploiement)

---

## 🏗️ Architecture

### Stack Technique

- **Backend**: Next.js 14+ App Router (TypeScript)
- **LLM**: Claude 3.5 Sonnet (Anthropic API)
- **Streaming**: Server-Sent Events (SSE)
- **Base de données**: Session context en mémoire (production: Redis recommandé)
- **Rate limiting**: Spam scoring intégré

### Fichiers Principaux

```
├── app/api/zedcheckout-chat/
│   └── route.ts                    # Endpoint principal avec SSE streaming
├── lib/
│   ├── zedcheckout-types.ts        # Types TypeScript
│   └── zedcheckout-utils.ts        # Utilitaires (typing delays, spam detection)
├── prompts/
│   └── zedcheckout-qualification.txt # Prompt système complet
└── components/
    └── ZedCheckoutChat.tsx         # Widget React frontend
```

---

## 📡 Endpoints API

### `POST /api/zedcheckout-chat`

Envoie un message et reçoit une réponse streamée via SSE.

#### Request Body

```json
{
  "sessionId": "session_1234567890",
  "message": "Bonjour, je cherche à améliorer mes conversions",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Message précédent",
      "timestamp": "2024-12-13T10:00:00Z"
    }
  ],
  "context": {
    "sessionId": "session_1234567890",
    "createdAt": "2024-12-13T10:00:00Z",
    "lastActivity": "2024-12-13T10:05:00Z",
    "messagesCount": 2,
    "funnelStage": "platform_identification",
    "qualificationData": {
      "platform": "shopify",
      "trafficMonthly": 5000,
      "revenueAnnual": 150000,
      "frustrations": ["abandon_rate"],
      "abandonRate": 75,
      "urgency": "month",
      "qualified": false,
      "disqualifiedReason": null
    },
    "spamScore": 0,
    "spamHistory": []
  }
}
```

#### Response (SSE Stream)

```
event: typing_start
data: {"typing": true}

event: message_chunk
data: {"content": "Ok parfait.", "index": 0, "total": 3}

event: split_signal
data: {"split": true, "typing_delay_ms": 800}

event: message_chunk
data: {"content": "Vous êtes sur Shopify ?", "index": 1, "total": 3}

event: split_signal
data: {"split": true, "typing_delay_ms": 1200}

event: message_chunk
data: {"content": "Depuis combien de temps ?", "index": 2, "total": 3}

event: message_complete
data: {
  "typing": false,
  "session_updated": true,
  "context": { ... },
  "usage": {
    "inputTokens": 345,
    "outputTokens": 89
  }
}
```

#### Événements SSE

| Événement | Description | Data |
|-----------|-------------|------|
| `typing_start` | Début de la frappe | `{ typing: true }` |
| `message_chunk` | Fragment de message | `{ content: string, index: number, total: number }` |
| `split_signal` | Séparation entre messages | `{ split: true, typing_delay_ms: number }` |
| `message_complete` | Fin de la réponse | `{ typing: false, context: SessionContext, usage: {...} }` |
| `error` | Erreur | `{ message: string, code?: string }` |

### `GET /api/zedcheckout-chat`

Health check endpoint.

#### Response

```json
{
  "status": "ok",
  "service": "zedcheckout-chat",
  "version": "1.0.0",
  "timestamp": "2024-12-13T10:00:00Z"
}
```

---

## 🎯 Système de Qualification

### Funnel en 7 Étapes

```
initial
  ↓
platform_identification (Q: Quelle plateforme ?)
  ↓
traffic_volume (Q: Combien de visiteurs/mois ?)
  ↓
revenue_check (Q: CA annuel ?)
  ↓
frustration_discovery (Q: Quelle frustration ?)
  ↓
abandon_rate_analysis (Q: Taux d'abandon ?)
  ↓
urgency_assessment (Q: Dans quel délai ?)
  ↓
booking_proposal (Proposition audit)
  ↓
qualified / disqualified
```

### Critères de Qualification

#### ✅ QUALIFIÉ (Lead HOT)

- Plateforme: **Shopify** (Standard ou Plus)
- Trafic: **1K-10K visiteurs/mois** (ou plus)
- CA: **50K-800K€/an**
- Frustration: Identifiée
- Urgence: Week/Month

#### ❌ DISQUALIFIÉ (Raisons)

| Raison | Critère | Action |
|--------|---------|--------|
| `wrong_platform` | Pas Shopify | Disqualification immédiate |
| `traffic_too_low` | <1K visiteurs/mois | Suggérer revenir plus tard |
| `revenue_too_low` | <50K€/an | Proposer ressources gratuites |
| `no_frustration` | Aucun problème identifié | Fin polie de conversation |

### Données Collectées

```typescript
interface QualificationData {
  platform: 'shopify' | 'woocommerce' | 'prestashop' | 'other' | null;
  shopifyPlan?: 'standard' | 'plus' | 'unknown';
  trafficMonthly: number | null;
  revenueAnnual: number | null;
  frustrations: string[];
  abandonRate: number | null;
  urgency: 'week' | 'month' | 'exploring' | null;
  qualified: boolean;
  disqualifiedReason: string | null;
}
```

---

## 🔧 Formats de Réponse

### Splitting de Messages

Le système utilise le signal `[SPLIT]` pour diviser les réponses en messages courts.

**Exemple de réponse LLM:**
```
Ok parfait.[SPLIT]Vous êtes sur Shopify ?[SPLIT]Depuis combien de temps ?
```

**Résultat frontend:**
1. "Ok parfait." (délai: 800ms)
2. "Vous êtes sur Shopify ?" (délai: 1200ms)
3. "Depuis combien de temps ?" (délai: 1000ms)

### Calcul des Délais de Typing

```typescript
function calculateTypingDelay(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount <= 5) return 600 + random(400);       // 600-1000ms
  if (wordCount <= 15) return 1000 + random(500);     // 1000-1500ms
  if (wordCount <= 25) return 1200 + random(600);     // 1200-1800ms
  
  return 1500 + random(1000);                         // 1500-2500ms
}
```

---

## 💻 Intégration Frontend

### Installation du Composant

```tsx
import ZedCheckoutChat from '@/components/ZedCheckoutChat';

export default function Page() {
  return (
    <div>
      <h1>Ma Page</h1>
      <ZedCheckoutChat autoOpen={false} />
    </div>
  );
}
```

### Props du Composant

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Classes CSS supplémentaires |
| `autoOpen` | `boolean` | `false` | Ouvre automatiquement le chat |

### Gestion Manuelle de l'API

```typescript
const response = await fetch('/api/zedcheckout-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_xxx',
    message: 'Bonjour',
    conversationHistory: [],
    context: null
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  // Parse SSE events...
}
```

---

## 🔐 Variables d'Environnement

Créez un fichier `.env.local` :

```env
# REQUIRED
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# OPTIONAL (pour monitoring en production)
NODE_ENV=production
SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxx
```

---

## 🧪 Tests

### Scénarios de Test Fournis

Fichier: `tests/zedcheckout-scenarios.test.ts` (à créer)

#### Scénario 1: Lead Qualifié HOT
```typescript
test('qualifie un lead avec 150K€ CA', async () => {
  const conversation = [
    { user: "Bonjour", expected_stage: "platform_identification" },
    { user: "Shopify Standard", expected_stage: "traffic_volume" },
    { user: "5000 visiteurs/mois", expected_stage: "revenue_check" },
    { user: "150K€/an", expected_stage: "frustration_discovery" },
    { user: "Taux d'abandon 75%", expected_stage: "booking_proposal" },
  ];
  
  // Assert que chaque étape progresse correctement
});
```

#### Scénario 2: Disqualification Rapide
```typescript
test('disqualifie rapidement si CA <50K', async () => {
  const conversation = [
    { user: "Bonjour", expected_stage: "platform_identification" },
    { user: "Shopify", expected_stage: "revenue_check" },
    { user: "20K€/an", expected_disqualified: true, expected_reason: "revenue_too_low" },
  ];
});
```

### Tests Manuels via cURL

```bash
# Test basique
curl -X POST http://localhost:3000/api/zedcheckout-chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_session",
    "message": "Bonjour",
    "conversationHistory": [],
    "context": null
  }'

# Health check
curl http://localhost:3000/api/zedcheckout-chat
```

---

## 🚀 Déploiement

### Développement Local

```bash
# Installer les dépendances
npm install

# Configurer l'API key
echo "ANTHROPIC_API_KEY=sk-ant-xxx" > .env.local

# Lancer le serveur
npm run dev

# Accéder à la démo
open http://localhost:3000/zedcheckout-demo
```

### Production (Vercel)

1. **Push sur GitHub**
   ```bash
   git add .
   git commit -m "feat: ZedCheckout conversational AI"
   git push origin main
   ```

2. **Configurer Vercel**
   - Connecter le repo GitHub
   - Ajouter la variable d'environnement `ANTHROPIC_API_KEY`
   - Déployer

3. **Vérifier le déploiement**
   ```bash
   curl https://votre-domaine.vercel.app/api/zedcheckout-chat
   # Devrait retourner { "status": "ok", ... }
   ```

### Production (Self-hosted)

```bash
# Build
npm run build

# Start
npm start

# Ou avec PM2
pm2 start npm --name "zedcheckout" -- start
```

---

## 📊 Monitoring

### Métriques Clés

| Métrique | Description | Cible |
|----------|-------------|-------|
| Latency première réponse | Temps avant premier `message_chunk` | <2s |
| Split natural | Nombre de messages par réponse | 2-4 |
| Typing delay moyen | Délai moyen entre messages | 1000-1500ms |
| Context retention | Précision rappel des 10 derniers messages | 100% |
| Qualification rate | % atteignant l'étape 3 | 60%+ |
| Booking rate | % des qualifiés proposant booking | 15%+ |
| Disqualification rapide | Temps moyen si hors-cible | <3 messages |

### Logs à Tracker

```typescript
{
  event: "message_processed",
  session_id: "uuid",
  user_message_length: 42,
  response_messages_count: 3,
  funnel_stage_before: "traffic_volume",
  funnel_stage_after: "revenue_check",
  latency_ms: 1847,
  llm_tokens_used: 345,
  split_count: 3,
  spam_score: 0
}
```

---

## 🐛 Troubleshooting

### Erreur: "API key invalide"
- Vérifier que `ANTHROPIC_API_KEY` est correctement définie dans `.env.local`
- Tester avec `echo $ANTHROPIC_API_KEY`

### Erreur: "No text content in Claude response"
- Vérifier que le prompt système n'est pas trop long (max 200K tokens)
- Réduire l'historique de conversation si nécessaire

### Messages ne se splitent pas
- Vérifier que le prompt système contient bien les instructions `[SPLIT]`
- Tester avec un message simple : "Test[SPLIT]Message 2"

### Typing indicator reste bloqué
- Vérifier que tous les événements SSE sont correctement fermés
- Ajouter des logs dans le parsing SSE côté frontend

---

## 📞 Support

- **Email**: romain@zedcheckout.com
- **GitHub Issues**: [github.com/romain-zt/zedcheckout-chat](https://github.com/romain-zt/zedcheckout-chat)
- **Documentation**: Cette page

---

## 📄 License

ISC - © 2024 ZedTech / Romain Piveteau
