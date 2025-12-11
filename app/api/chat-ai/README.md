# AI Checkout Agent - Architecture

## Vue d'ensemble

Un vrai agent IA de checkout conversationnel, pas un simple chatbot. Utilise Claude 3.5 Sonnet avec tool calling pour orchestrer des conversations de checkout intelligentes.

## ⚠️ Modes de Compatibilité

L'API supporte **deux modes** pour rétrocompatibilité :

### 1. Legacy Mode (ChatWidgetAI.tsx)
**Détection** : Présence de `leadData` et absence de `context` dans la requête

**Troll detection** : ✅ **ACTIVÉ** (scoring calculé à chaque message)

**Requête** :
```typescript
{
  message: string,
  conversationHistory: ChatMessage[],
  leadData: { firstName?, email?, ... },
  sectionContext?: string,
  sectionDescription?: string
}
```

**Réponse** :
```typescript
{
  success: true,
  response: {
    message: string,
    extractedData: { firstName?, email?, ... },
    isQualificationComplete: boolean,
    suggestedReplies?: string[],
    confidence?: "high" | "medium" | "low"
  },
  usage: { inputTokens, outputTokens }
}
```

### 2. Agent Mode (ChatWidget.tsx)
**Détection** : Présence de `context` ou `isFirstMessage: true`

**Troll detection** : ✅ **ACTIVÉ** (scoring persistant dans context)

**Requête** :
```typescript
{
  message: string,
  conversationHistory: ChatMessage[],
  context: ConversationContext,
  isFirstMessage?: boolean
}
```

**Réponse** :
```typescript
{
  success: true,
  messages: AgentMessage[], // [{ text, delay?, suggestedReplies?, ... }]
  context: ConversationContext,
  isGreeting?: boolean,
  usage: { inputTokens, outputTokens }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ChatWidget (Frontend)                │
│  • Multi-message support                                │
│  • Suggested replies                                    │
│  • Context persistence                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP POST
                   │
┌──────────────────▼──────────────────────────────────────┐
│               Agent Orchestrator (API)                  │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. Build Context (state, cart, user info)    │    │
│  │  2. Call Claude with Tools                     │    │
│  │  3. Execute Tool Calls                         │    │
│  │  4. Iterate until final response               │    │
│  │  5. Update & return context                    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## États de l'Agent

L'agent suit une state machine :

```
greeting → discovery → product_selection → customization → checkout → completed
```

- **greeting** : Séquence de bienvenue multi-messages
- **discovery** : Comprendre l'intention/besoins du client
- **product_selection** : Aide au choix de produits
- **customization** : Configuration produits/panier
- **checkout** : Finalisation de la commande
- **completed** : Commande passée

## Outils Disponibles

L'agent peut appeler ces outils de manière autonome :

### 1. `add_to_cart`
Ajoute un produit au panier.

**Paramètres :**
- `product_name` (string, required)
- `quantity` (number, optional, default: 1)
- `options` (object, optional) - taille, couleur, etc.

**Exemple d'utilisation par l'IA :**
```
User: "Je veux 2 t-shirts"
→ AI appelle: add_to_cart({ product_name: "T-shirt", quantity: 2 })
→ AI répond: "Parfait ! 2 t-shirts ajoutés 👕"
```

### 2. `remove_from_cart`
Retire un article du panier.

**Paramètres :**
- `item_index` (number) - Index de l'article (0-based)

### 3. `update_cart_quantity`
Modifie la quantité d'un article.

**Paramètres :**
- `item_index` (number)
- `new_quantity` (number)

### 4. `get_cart_summary`
Récupère le contenu du panier et le total.

**Pas de paramètres.**

### 5. `capture_customer_info`
Enregistre les infos client.

**Paramètres :**
- `name` (string, optional)
- `email` (string, optional)
- `phone` (string, optional)
- `address` (object, optional)

### 6. `apply_discount_code`
Applique un code promo.

**Paramètres :**
- `code` (string)

### 7. `finalize_checkout`
Finalise la commande.

**Paramètres :**
- `payment_method` (string, optional)

## Contexte de Conversation

Chaque conversation maintient un contexte :

```typescript
{
  state: AgentState,
  cart: CartItem[],
  userInfo: {
    name?: string,
    email?: string,
    phone?: string,
    shippingAddress?: any
  },
  metadata: {
    sessionStarted: string,
    lastInteraction: string,
    messageCount: number,
    intentHistory: string[]
  },
  trollScore: number,        // 0-100, détection de comportement suspect
  trollHistory: string[]      // Patterns détectés
}
```

Ce contexte est :
- Maintenu côté frontend (persistant)
- Envoyé à chaque requête
- Enrichi par l'agent via les tool calls
- Utilisé pour construire le system prompt

## 🎭 Système de Détection de Trolls

L'agent intègre un **système de scoring intelligent** pour détecter et gérer les utilisateurs non sérieux.

### Comment ça marche

À chaque message, l'agent analyse 8 patterns de comportement :

1. **Messages très courts** (<5 caractères) → +15 points
2. **Répétition excessive** (même message 2-3 fois) → +25 points/répétition
3. **Gibberish** (texte aléatoire sans sens) → +30 points
4. **Spam d'emojis** (>5 emojis) → +20 points
5. **Phrases de troll** (test, lol, mdr, blabla, etc.) → +25 points
6. **Rapid fire** (>10 messages/minute) → +20 points
7. **Contenu absurde** (que des chiffres, même caractère répété, etc.) → +35 points
8. **Contradictions rapides** (dit oui puis non rapidement) → +15 points

**Score max** : 100

### Comportement de l'agent selon le score

#### 🟢 Score 0-30 : Normal
```
Agent professionnel et efficace, mode standard
```

#### 🟡 Score 30-50 : Suspect
```
Agent légèrement plus direct :
"Ok, on se concentre. Tu veux acheter quelque chose ou pas ?"
```

#### 🟠 Score 50-70 : Troll probable
```
Agent ironique et direct :
"Bon, j'ai pas toute la journée. Si c'est pour tester l'IA, 
c'est réussi. Si c'est pour acheter, on y va ?"
```

#### 🔴 Score 70+ : Troll confirmé
```
Agent ironique max avec sarcasme intelligent :
"Écoute, je suis une IA mais j'ai quand même ma dignité. 
Soit tu me dis ce que tu veux acheter, soit on arrête 
de se tourner autour."
```

### Rédemption

Le score **décroît de -5 points** si l'utilisateur envoie un message normal (score <20), permettant la rédemption.

### Debug

En mode développement, le troll score s'affiche dans le header du chat avec un emoji 🎭.

### Exemples

**Scénario 1 : Troll classique**
```
User: "test"           → Score: 25 (short + troll phrase)
User: "test"           → Score: 50 (repetition)
User: "lol"            → Score: 75 (more trolling)
AI: "Écoute, je suis une IA mais j'ai quand même ma dignité..."
```

**Scénario 2 : Utilisateur qui se ressaisit**
```
User: "haha"           → Score: 25
User: "ok désolé"      → Score: 20 (-5 decay)
User: "Je veux un produit" → Score: 15 (-5 decay)
AI: (redevient normal)
```

## Séquence de Greeting

Première interaction = séquence multi-messages automatique :

```typescript
[
  { text: "Bonjour, je suis ZedCheckout.", delay: 0 },
  { text: "Une IA, mais pas tout à fait comme les autres.", delay: 500 },
  { 
    text: "Je ne suis pas là pour bavarder...",
    delay: 500,
    suggestedReplies: [...]
  }
]
```

Chaque message s'affiche avec un délai (max 500ms entre chaque).

## Ajouter un Nouvel Outil

### 1. Définir le tool dans `AGENT_TOOLS`

```typescript
const AGENT_TOOLS: Anthropic.Tool[] = [
  // ... existing tools
  {
    name: 'check_inventory',
    description: 'Check product inventory availability',
    input_schema: {
      type: 'object',
      properties: {
        product_id: {
          type: 'string',
          description: 'Product ID to check'
        }
      },
      required: ['product_id']
    }
  }
];
```

### 2. Implémenter l'exécution dans `executeTool`

```typescript
async function executeTool(
  toolName: string,
  parameters: Record<string, any>,
  context: ConversationContext
): Promise<any> {
  
  switch (toolName) {
    // ... existing cases
    
    case 'check_inventory': {
      const { product_id } = parameters;
      // Appel API, BDD, etc.
      const available = await checkInventoryAPI(product_id);
      return {
        success: true,
        available,
        message: available ? 'En stock' : 'Rupture de stock'
      };
    }
  }
}
```

### 3. L'IA l'utilise automatiquement

L'agent comprend quand utiliser ce nouvel outil grâce à :
- La description du tool
- Le system prompt
- Le contexte de conversation

## Ajouter un Nouvel État

### 1. Ajouter à `AgentState`

```typescript
type AgentState = 
  | 'greeting'
  | 'discovery'
  | 'product_selection'
  | 'customization'
  | 'upsell'  // ← NOUVEAU
  | 'checkout'
  | 'completed';
```

### 2. Documenter dans le System Prompt

Ajouter une section dans `SYSTEM_PROMPT` expliquant :
- Quand passer à cet état
- Que faire dans cet état
- Comment en sortir

### 3. L'agent gère la transition

L'agent décide quand transitionner via le champ `state` dans sa réponse JSON.

## Performance & Scaling

### Modèle utilisé
- **claude-3-5-sonnet-20241022** : Optimal pour raisonnement + tool calling
- max_tokens: 1024 (suffisant pour réponses concises + tool calls)
- temperature: 0.7 (équilibre créativité/cohérence)

### Optimisations possibles
1. **Caching** : Mettre en cache le system prompt (feature Claude)
2. **Streaming** : Stream les réponses pour meilleure UX
3. **Rate limiting** : Implémenter backoff sur 429
4. **Context pruning** : Limiter l'historique aux N derniers messages

### Coût moyen par conversation
~5-10 messages × ~1000 tokens = ~10K tokens total
≈ $0.03-0.05 par conversation complète

## Monitoring & Debugging

### Logs importants
- Tool calls exécutés
- Context state transitions
- Erreurs de parsing
- Token usage

### Métriques à tracker
- Taux de complétion checkout
- Nombre moyen de messages
- Tool calls par conversation
- Temps de réponse

## Tests

### Scénarios à tester

**Happy path :**
```
User: "Je veux acheter un t-shirt"
→ Tool: add_to_cart
→ AI demande taille
User: "L"
→ Tool: update_cart_quantity ou add options
→ AI propose checkout
User: "OK"
→ Tool: capture_customer_info (email)
→ Tool: finalize_checkout
```

**Edge cases :**
- Panier vide au checkout
- Code promo invalide
- Infos client incomplètes
- Messages hors sujet
- Abandon en milieu de flow

## Prochaines Améliorations

### Court terme
- [ ] Intégration réelle catalogue produits
- [ ] Calcul prix réel avec taxes/shipping
- [ ] Validation email/téléphone
- [ ] Multi-langue (détection auto)

### Moyen terme
- [ ] Intégration Stripe/payment
- [ ] Upsell intelligent (ML-based)
- [ ] A/B testing messages
- [ ] Analytics avancés

### Long terme
- [ ] Voice mode (speech-to-text)
- [ ] Image recognition (product photos)
- [ ] Personnalisation avancée
- [ ] Multi-agent orchestration

## Support & Questions

Pour toute question sur l'architecture ou l'extension de l'agent, référez-vous à :
- Code : `app/api/chat-ai/route.ts`
- Frontend : `components/ChatWidget.tsx`
- System prompt : Dans `route.ts`, variable `SYSTEM_PROMPT`
