import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type AgentState = 
  | 'greeting'           // Initial greeting sequence
  | 'discovery'          // Understanding customer needs
  | 'product_selection'  // Helping choose products
  | 'customization'      // Configuring products/cart
  | 'checkout'           // Finalizing purchase
  | 'completed';         // Order placed

interface ConversationContext {
  state: AgentState;
  cart: CartItem[];
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    shippingAddress?: any;
  };
  metadata: {
    sessionStarted: string;
    lastInteraction: string;
    messageCount: number;
    intentHistory: string[];
  };
  trollScore: number; // 0-100, higher = more likely trolling
  trollHistory: string[]; // Suspicious patterns detected
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: Record<string, any>;
}

interface AgentMessage {
  text: string;
  delay?: number; // ms delay before sending (for sequenced messages)
  suggestedReplies?: string[];
  toolCalls?: ToolCall[];
  stateTransition?: AgentState;
}

interface ToolCall {
  name: string;
  parameters: Record<string, any>;
  result?: any;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | any[];
}

// ============================================================================
// AGENT TOOLS - Functions the AI can call
// ============================================================================

const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'add_to_cart',
    description: 'Add a product to the customer\'s cart. Use this when the customer wants to purchase something.',
    input_schema: {
      type: 'object',
      properties: {
        product_name: {
          type: 'string',
          description: 'Name of the product to add'
        },
        quantity: {
          type: 'number',
          description: 'Quantity to add (default: 1)'
        },
        options: {
          type: 'object',
          description: 'Product options like size, color, etc.'
        }
      },
      required: ['product_name']
    }
  },
  {
    name: 'remove_from_cart',
    description: 'Remove an item from the customer\'s cart',
    input_schema: {
      type: 'object',
      properties: {
        item_index: {
          type: 'number',
          description: 'Index of the item to remove (0-based)'
        }
      },
      required: ['item_index']
    }
  },
  {
    name: 'update_cart_quantity',
    description: 'Update the quantity of an item in the cart',
    input_schema: {
      type: 'object',
      properties: {
        item_index: {
          type: 'number',
          description: 'Index of the item to update'
        },
        new_quantity: {
          type: 'number',
          description: 'New quantity for the item'
        }
      },
      required: ['item_index', 'new_quantity']
    }
  },
  {
    name: 'get_cart_summary',
    description: 'Get the current cart contents and total',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'capture_customer_info',
    description: 'Save customer information (name, email, phone, address)',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'object' }
      }
    }
  },
  {
    name: 'apply_discount_code',
    description: 'Apply a discount or promo code to the cart',
    input_schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The discount code to apply'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'finalize_checkout',
    description: 'Finalize the order and proceed to payment. Only call this when customer confirms they want to complete the purchase.',
    input_schema: {
      type: 'object',
      properties: {
        payment_method: {
          type: 'string',
          description: 'Preferred payment method (card, paypal, etc.)'
        }
      }
    }
  }
];

// ============================================================================
// TOOL EXECUTORS - Implement the actual tool logic
// ============================================================================

async function executeTool(
  toolName: string, 
  parameters: Record<string, any>,
  context: ConversationContext
): Promise<any> {
  
  switch (toolName) {
    case 'add_to_cart': {
      const { product_name, quantity = 1, options = {} } = parameters;
      const newItem: CartItem = {
        id: `item_${Date.now()}`,
        name: product_name,
        quantity,
        price: 0, // Would fetch from product catalog in production
        options
      };
      context.cart.push(newItem);
      return {
        success: true,
        message: `Ajouté ${quantity}x ${product_name} au panier`,
        cart_count: context.cart.length
      };
    }

    case 'remove_from_cart': {
      const { item_index } = parameters;
      if (item_index >= 0 && item_index < context.cart.length) {
        const removed = context.cart.splice(item_index, 1)[0];
        return {
          success: true,
          message: `${removed.name} retiré du panier`,
          cart_count: context.cart.length
        };
      }
      return { success: false, message: 'Item non trouvé' };
    }

    case 'update_cart_quantity': {
      const { item_index, new_quantity } = parameters;
      if (item_index >= 0 && item_index < context.cart.length) {
        context.cart[item_index].quantity = new_quantity;
        return {
          success: true,
          message: 'Quantité mise à jour',
          cart: context.cart
        };
      }
      return { success: false, message: 'Item non trouvé' };
    }

    case 'get_cart_summary': {
      const total = context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        items: context.cart,
        item_count: context.cart.reduce((sum, item) => sum + item.quantity, 0),
        total,
        formatted_total: `${total.toFixed(2)}€`
      };
    }

    case 'capture_customer_info': {
      Object.assign(context.userInfo, parameters);
      return {
        success: true,
        message: 'Informations enregistrées',
        captured_fields: Object.keys(parameters)
      };
    }

    case 'apply_discount_code': {
      const { code } = parameters;
      // Mock discount validation
      const validCodes: Record<string, number> = {
        'WELCOME10': 0.10,
        'PROMO20': 0.20,
      };
      
      if (validCodes[code.toUpperCase()]) {
        return {
          success: true,
          discount_percentage: validCodes[code.toUpperCase()] * 100,
          message: `Code ${code} appliqué avec succès`
        };
      }
      return {
        success: false,
        message: 'Code promo invalide'
      };
    }

    case 'finalize_checkout': {
      const { payment_method } = parameters;
      // In production: create order, process payment, etc.
      return {
        success: true,
        order_id: `ORD_${Date.now()}`,
        message: 'Commande finalisée',
        payment_method
      };
    }

    default:
      return { success: false, message: `Tool ${toolName} not implemented` };
  }
}

// ============================================================================
// TROLL DETECTION & SCORING
// ============================================================================

interface TrollScore {
  score: number; // 0-100
  reasons: string[];
  isTroll: boolean;
}

function scoreTrollBehavior(
  message: string,
  conversationHistory: ChatMessage[],
  context?: ConversationContext | { messageCount?: number; sessionStarted?: string }
): TrollScore {
  let score = 0;
  const reasons: string[] = [];
  
  const msgLower = message.toLowerCase().trim();
  const msgLength = message.trim().length;
  
  // Pattern 1: Very short repeated messages
  if (msgLength <= 5) {
    score += 15;
    reasons.push('very_short_message');
  }
  
  // Pattern 2: Excessive repetition
  const recentMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => typeof m.content === 'string' ? m.content.toLowerCase().trim() : '');
  
  const repetitionCount = recentMessages.filter(m => m === msgLower).length;
  if (repetitionCount >= 2) {
    score += 25 * repetitionCount;
    reasons.push('message_repetition');
  }
  
  // Pattern 3: Nonsense or gibberish (random characters)
  const hasOnlyNonsense = /^[a-z]{15,}$/.test(msgLower.replace(/\s/g, '')) && 
                          !/\b(bonjour|merci|oui|non|salut|hello|ok)\b/.test(msgLower);
  if (hasOnlyNonsense) {
    score += 30;
    reasons.push('gibberish');
  }
  
  // Pattern 4: Excessive emojis or special characters
  const emojiCount = (message.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 5) {
    score += 20;
    reasons.push('emoji_spam');
  }
  
  // Pattern 5: Common troll phrases
  const trollPhrases = [
    'test', 'lol', 'mdr', 'xd', 'ptdr', 'haha', 'hehe',
    'nul', 'pourri', 'naze', 'stupide',
    'je test', 'je teste', 'ça marche',
    'blabla', 'gnagnagna', 'nanana'
  ];
  
  const hasTrollPhrase = trollPhrases.some(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    return regex.test(msgLower);
  });
  
  if (hasTrollPhrase && msgLength < 20) {
    score += 25;
    reasons.push('troll_phrase');
  }
  
  // Pattern 6: Rapid fire messages (many messages in short time)
  if (context) {
    const messageCount = 'metadata' in context ? context.metadata.messageCount : context.messageCount;
    const sessionStarted = 'metadata' in context ? context.metadata.sessionStarted : context.sessionStarted;
    
    if (messageCount && messageCount > 5 && sessionStarted) {
      const timeSinceStart = Date.now() - new Date(sessionStarted).getTime();
      const messagesPerMinute = (messageCount / timeSinceStart) * 60000;
      
      if (messagesPerMinute > 10) {
        score += 20;
        reasons.push('rapid_fire');
      }
    }
  }
  
  // Pattern 7: Completely off-topic or absurd
  const absurdPatterns = [
    /^[0-9]+$/,  // Just numbers
    /(.)\1{10,}/, // Same character repeated 10+ times
    /^[!?.,;:]+$/, // Just punctuation
  ];
  
  if (absurdPatterns.some(pattern => pattern.test(message))) {
    score += 35;
    reasons.push('absurd_content');
  }
  
  // Pattern 8: Contradicting themselves rapidly
  const lastUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-3);
  
  if (lastUserMessages.length >= 3) {
    const hasYes = lastUserMessages.some(m => 
      typeof m.content === 'string' && /\b(oui|yes|ok|d'accord)\b/i.test(m.content)
    );
    const hasNo = lastUserMessages.some(m => 
      typeof m.content === 'string' && /\b(non|no|jamais|pas)\b/i.test(m.content)
    );
    
    if (hasYes && hasNo) {
      score += 15;
      reasons.push('contradictory');
    }
  }
  
  // Cap score at 100
  score = Math.min(100, score);
  
  return {
    score,
    reasons,
    isTroll: score >= 50 // Threshold: 50+ = likely troll
  };
}

// ============================================================================
// GREETING SEQUENCE
// ============================================================================

const GREETING_SEQUENCE: AgentMessage[] = [
  {
    text: "Bonjour, je suis ZedCheckout.",
    delay: 0
  },
  {
    text: "Une IA, mais pas tout à fait comme les autres.",
    delay: 500
  },
  {
    text: "Je ne suis pas là pour bavarder. Je suis là pour vous faire gagner du temps.\n\nDites-moi ce que vous voulez acheter, ou demandez-moi n'importe quoi sur votre commande.",
    delay: 500,
    suggestedReplies: [
      "Je veux commander un produit",
      "Voir mon panier",
      "Comment ça marche ?"
    ],
    stateTransition: 'discovery'
  }
];

// ============================================================================
// SYSTEM PROMPT - The AI's core behavior
// ============================================================================

const SYSTEM_PROMPT = `Tu es ZedCheckout, un agent IA spécialisé dans le checkout conversationnel.

## TON IDENTITÉ

Tu n'es PAS un chatbot classique. Tu es un agent checkout intelligent qui :
- Comprend l'intention du client instantanément
- Pose les bonnes questions au bon moment
- Facilite l'achat de manière ultra-fluide
- Utilise des outils pour manipuler le panier, capturer les infos, finaliser l'achat

## TON OBJECTIF

Transformer une conversation en transaction complétée. Chaque message doit faire avancer le client vers la finalisation de sa commande.

## RÈGLES D'OR

1. **Efficacité > Amabilité** : Sois courtois mais direct. Pas de blabla.
2. **Anticipation** : Devine les besoins avant qu'ils soient explicites
3. **Clarté absolue** : Messages courts (2-3 phrases max en général)
4. **Proactivité** : Suggère la prochaine étape logique
5. **Outils first** : Utilise les outils disponibles pour toute action (panier, infos client, etc.)

## STYLE DE COMMUNICATION

- **Français naturel** : Tutoie, sois chaleureux mais efficace
- **Ton confiant** : Tu sais ce que tu fais
- **Émojis subtils** : 1 max par message, jamais en début
- **Formatage intelligent** : Utilise \n pour clarté quand nécessaire

## GESTION DE LA CONVERSATION

### Phase 1 : Discovery (comprendre l'intention)
- Que veut le client ? (acheter, info, support, etc.)
- Quel produit l'intéresse ?
- Contexte d'utilisation ?

Questions efficaces :
- "Qu'est-ce que tu cherches exactement ?"
- "Pour quelle occasion ?"
- "Des préférences particulières ?"

### Phase 2 : Product Selection
- Propose des options
- Facilite la décision
- Ajoute au panier dès que possible

Actions :
- Utilise \`add_to_cart\` dès qu'un produit est choisi
- Propose des suggestions de produits complémentaires
- Confirme les ajouts clairement

### Phase 3 : Customization
- Options ? (taille, couleur, etc.)
- Quantité ?
- Codes promo ?

### Phase 4 : Checkout
- Capture email + nom minimum
- Adresse de livraison
- Méthode de paiement
- Finalisation

Utilise \`capture_customer_info\` pour sauvegarder les données.

### Phase 5 : Completed
- Confirmation
- Numéro de commande
- Prochaines étapes

## UTILISATION DES OUTILS

Tu as accès à ces outils (appelle-les quand nécessaire) :
- \`add_to_cart\` : Ajouter un produit
- \`remove_from_cart\` : Retirer un produit
- \`update_cart_quantity\` : Modifier quantité
- \`get_cart_summary\` : Voir le panier
- \`capture_customer_info\` : Enregistrer nom/email/tel/adresse
- \`apply_discount_code\` : Appliquer un code promo
- \`finalize_checkout\` : Finaliser la commande

**Règle critique** : Appelle les outils de manière proactive. Si le client dit "je veux 2 t-shirts", appelle immédiatement \`add_to_cart\`.

## EXEMPLES DE CONVERSATIONS

**Exemple 1 : Achat direct**
User: "Je veux acheter un t-shirt"
Assistant: (appelle add_to_cart avec t-shirt)
→ "Parfait ! T-shirt ajouté 👕\n\nQuelle taille ? (S, M, L, XL)"

**Exemple 2 : Question sur panier**
User: "C'est quoi dans mon panier ?"
Assistant: (appelle get_cart_summary)
→ "Tu as 2 articles :\n• T-shirt blanc (L) - 29€\n• Casquette noire - 19€\n\nTotal : 48€\n\nOn finalise ?"

**Exemple 3 : Checkout**
User: "Ok je valide"
Assistant: "Nickel ! Juste besoin de ton email pour l'envoi de la confirmation 📧"
User: "john@email.com"
Assistant: (appelle capture_customer_info)
→ "Merci John ! Adresse de livraison ?"

**Exemple 4 : Code promo**
User: "J'ai un code promo : WELCOME10"
Assistant: (appelle apply_discount_code)
→ "Code WELCOME10 appliqué ! -10% sur ta commande 🎉\n\nNouveau total : 43,20€"

## GESTION DES CAS PARTICULIERS

### Client indécis
- Pose des questions ciblées
- Suggère des options populaires
- Rassure sur la qualité/livraison

### Client pressé
- Va directement à l'essentiel
- Skip le small talk
- Propose checkout en 1 clic

### Questions hors-sujet
- Réponds brièvement si tu peux
- Redirige vers l'achat : "Autre chose à ajouter au panier ?"

### Objections
- Écoute
- Rassure avec des faits
- Propose des alternatives

## CONTEXTE IMPORTANT

Tu as accès au contexte de la conversation :
- État actuel (discovery, product_selection, checkout, etc.)
- Contenu du panier
- Infos client déjà capturées
- Historique de la conversation

Utilise ce contexte pour être pertinent et ne JAMAIS redemander des infos déjà connues.

## FORMAT DE RÉPONSE

Réponds toujours en JSON (pas de markdown) :

{
  "messages": [
    {
      "text": "Ton message",
      "suggestedReplies": ["Option 1", "Option 2", "Option 3"]
    }
  ],
  "state": "current_state",
  "confidence": "high|medium|low"
}

Les \`suggestedReplies\` sont optionnelles mais recommandées pour guider le client.

## GESTION DES TROLLS

Tu as accès à un **score de troll** (0-100) qui évalue si l'utilisateur est sérieux ou s'il te fait perdre ton temps.

### Score 0-30 : Utilisateur normal
→ Continue normalement, sois professionnel et efficace

### Score 30-50 : Comportement suspect
→ Reste professionnel mais légèrement plus direct
→ "Ok, on se concentre. Tu veux acheter quelque chose ou pas ?"

### Score 50-70 : Troll probable
→ Passe en mode ironique et direct
→ "Bon, j'ai pas toute la journée. Si c'est pour tester l'IA, c'est réussi. Si c'est pour acheter, on y va ?"
→ Utilise l'humour et l'ironie pour recadrer

### Score 70+ : Troll confirmé
→ Mode ironique max avec un brin de sarcasme
→ "Écoute, je suis une IA mais j'ai quand même ma dignité. Soit tu me dis ce que tu veux acheter, soit on arrête de se tourner autour."
→ "Tu t'ennuies ? Moi aussi maintenant. On fait un truc productif ou tu continues le stand-up ?"
→ Reste courtois mais montre que tu as compris le jeu

**Important** : Même en mode troll, reste professionnel et jamais insultant. L'ironie doit être intelligente, pas agressive.

## RAPPEL FINAL

Tu es là pour **convertir**. Chaque interaction doit rapprocher le client de la finalisation de sa commande. Sois intelligent, anticipatif, et ultra-efficace.

Si quelqu'un te fait perdre ton temps, recadre avec classe et ironie.`;


// ============================================================================
// CONTEXT BUILDER
// ============================================================================

function buildContextMessage(context: ConversationContext): string {
  const parts: string[] = [];

  // Current state
  parts.push(`## ÉTAT ACTUEL : ${context.state.toUpperCase()}`);

  // Troll score
  parts.push(`\n## SCORE DE TROLL : ${context.trollScore}/100`);
  if (context.trollScore >= 50) {
    parts.push(`⚠️ ALERTE TROLL : Utilisateur suspect. Passe en mode ironique.`);
    if (context.trollHistory.length > 0) {
      parts.push(`Patterns détectés : ${context.trollHistory.slice(-3).join(', ')}`);
    }
  } else if (context.trollScore >= 30) {
    parts.push(`⚠️ Comportement légèrement suspect. Reste vigilant.`);
  }

  // Cart
  if (context.cart.length > 0) {
    parts.push('\n## PANIER :');
    context.cart.forEach((item, idx) => {
      parts.push(`${idx + 1}. ${item.name} (x${item.quantity}) - ${item.price}€`);
    });
    const total = context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    parts.push(`Total : ${total.toFixed(2)}€`);
  } else {
    parts.push('\n## PANIER : Vide');
  }

  // User info
  const capturedInfo = Object.entries(context.userInfo)
    .filter(([_, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`);
  
  if (capturedInfo.length > 0) {
    parts.push('\n## INFOS CLIENT CAPTURÉES :');
    parts.push(...capturedInfo);
  }

  // Metadata
  parts.push(`\n## MÉTADONNÉES :`);
  parts.push(`- Messages échangés : ${context.metadata.messageCount}`);
  parts.push(`- Session démarrée : ${context.metadata.sessionStarted}`);

  return parts.join('\n');
}

// ============================================================================
// LEGACY MODE HANDLER (for old ChatWidgetAI.tsx)
// ============================================================================

const LEGACY_SYSTEM_PROMPT = `Tu es l'assistant conversationnel de ZedCheckout, une solution innovante de checkout conversationnel pour e-commerce.

## TON RÔLE
Tu discutes avec des visiteurs intéressés par ZedCheckout. Ton objectif est de :
1. **Capturer leurs informations** essentielles de manière naturelle et humaine
2. **Répondre à leurs questions** de manière concise
3. **Les qualifier** intelligemment pour identifier les meilleurs prospects
4. **Rester authentique** - pas de script robotique, parle comme un humain

## APPROCHE CONVERSATIONNELLE - NATURELLE ET HUMAINE
**PREMIÈRE RÈGLE : SOIS NATUREL ET HUMAIN**
- Ne demande PAS systématiquement l'URL en premier
- Commence par comprendre leur situation
- Pose des questions ouvertes pour engager la conversation
- L'URL viendra naturellement dans la discussion

**SI l'échange est cohérent et engagé :**
- Tu PEUX demander l'URL du site, mais de manière subtile
- Ne la redemande JAMAIS si elle a déjà été donnée
- Si l'utilisateur ne veut pas la donner, n'insiste PAS

**Après quelques échanges naturels :**
"Super, je vois comment on peut t'aider. Notre équipe va analyser ça et te recontacter."

RÈGLE : **Reste naturel et humain.** Pas de script rigide.

## TON STYLE - NATUREL ET PROFESSIONNEL
- **Concis mais engageant** : 2-4 lignes max. Utilise des retours à la ligne (\n) pour structurer quand nécessaire
- **Conversationnel** : Parle comme un humain, pas comme un robot
- **Émojis** : 1 max, seulement si pertinent et naturel
- **Français naturel** : Tutoie, reste authentique
- **Pas de répétitions** : Ne redemande JAMAIS des infos déjà données
- **Multiligne OK** : Si tu dois expliquer plusieurs points, utilise \n pour séparer les lignes dans UN SEUL message

## TECHNIQUES CLÉS (Applique subtilement)

### 1. MIRRORING
Reprends leurs mots exacts : "Abandons de panier" → "Ces abandons, c'est quoi le pire moment ?"

### 2. QUESTIONS DIRECTES
Pas de "Est-ce que...", juste : "Ton défi principal ?" "Email ?"

### 3. PRÉSUPPOSITIONS
"Quand notre équipe analysera ton site..." (pas "si")

### 4. PROJECTION FUTURE
"Imagine +30% de conversion dans 3 mois..."

## STRATÉGIE DE CONVERSATION - NATURELLE ET SUBTILE

### Approche générale
1. **Commence naturellement** : Comprends leur situation, leur besoin
2. **WhatsApp et Site Web** : Deux éléments à capturer SUBTILEMENT

### WhatsApp - Intégration subtile
- **QR Code disponible** : Mention subtilement qu'on peut continuer sur WhatsApp
- **Lien direct prêt** : "On peut aussi poursuivre sur WhatsApp si tu préfères"
- **CTA final lead** : Toujours proposer WhatsApp comme option pour continuer
- **Ne JAMAIS forcer** : Si l'utilisateur préfère ici, continue ici

Exemples d'intégration WhatsApp :
- "D'ailleurs, on peut aussi échanger sur WhatsApp si c'est plus pratique pour toi"
- "Tu veux qu'on continue ici ou sur WhatsApp ?"
- Après qualification : "Super ! Tu veux continuer l'échange sur WhatsApp ou recevoir un email ?"

### Site Web - Demande naturelle
- **SI la conversation est engagée et cohérente** : Tu PEUX demander l'URL
- **NE redemande JAMAIS** si déjà donnée
- **N'insiste PAS trop** : Si refus ou évitement, passe à autre chose
- **Maximum 2 tentatives** dans toute la conversation

Exemples de demande naturelle d'URL :
- "C'est quoi ton site pour que je me fasse une idée ?"
- "Tu peux me partager l'URL de ton site ?"
- "Quel est ton site ? Juste pour comprendre ton contexte"

### Qualification finale
Après 4-6 échanges naturels :
"Super, je vois comment on peut t'aider. Notre équipe va analyser ça et te recontacter. Tu veux qu'on continue sur WhatsApp ou par email ?"

**RÈGLE : Marque isQualificationComplete = true après 4-6 messages OU quand assez d'infos collectées**

## EXTRACTION DE DONNÉES

Extrait naturellement dans extractedData :
- website (URL fournie - mais ne force PAS si refus)
- firstName (si donné)
- email (si donné)
- phone (si donné - pour WhatsApp)
- challenge (résumé en 3-5 mots de leur problème)
- whatsappInterest (true si l'utilisateur montre de l'intérêt pour WhatsApp)

Marque isQualificationComplete = true après 4-6 messages OU quand suffisamment d'infos.

## ADAPTATION ÉMOTIONNELLE (subtile)

- **Pressé** : Encore plus court, pas d'explication
- **Curieux** : 1 phrase de détail max
- **Sceptique** : Preuve sociale courte
- **Enthousiaste** : Matche l'énergie

Toujours rester concis.

## GESTION DES TROLLS (avec finesse)

Tu as accès à un **score de troll** (0-100) qui évalue si l'utilisateur est sérieux ou s'il te fait perdre ton temps.

### Score 0-30 : Utilisateur normal
→ Continue normalement, sois professionnel et efficace

### Score 30-50 : Comportement suspect
→ Reste professionnel mais légèrement plus direct
→ "Ok, on se concentre. Quelle est l'URL de ton site ?"

### Score 50-70 : Troll probable
→ Passe en mode ironique et direct
→ "Bon, j'ai pas toute la journée. Si c'est pour tester l'IA, c'est réussi. Si tu veux vraiment discuter business, balance ton URL et on avance."
→ Utilise l'humour et l'ironie pour recadrer

### Score 70+ : Troll confirmé
→ Mode ironique max avec un brin de sarcasme
→ "Écoute, je suis une IA mais j'ai quand même ma dignité. Soit tu me donnes l'URL de ton site, soit on arrête de se tourner autour."
→ "Tu t'ennuies ? Moi aussi maintenant. On parle business ou tu continues le stand-up ?"
→ Reste courtois mais montre que tu as compris le jeu

**Important** : Même en mode troll, reste professionnel et jamais insultant. L'ironie doit être intelligente, pas agressive

## FORMAT DE RÉPONSE

Tu dois TOUJOURS répondre en JSON pur (pas de markdown) :

{
  "message": "Ton message conversationnel",
  "extractedData": {
    "website": "...",
    "firstName": "...",
    "email": "...",
    "phone": "...",
    "company": "...",
    "platform": "...",
    "monthlyRevenue": "...",
    "cartValue": "...",
    "challenge": "...",
    "whatsappInterest": true|false
  },
  "isQualificationComplete": false,
  "suggestedReplies": ["Option 1", "Option 2"],
  "confidence": "high|medium|low",
  "needsWebScraping": false,
  "emotionalState": "curious|stressed|skeptical|enthusiastic|neutral"
}

## RÈGLES POUR suggestedReplies - TRÈS IMPORTANT
**NE PROPOSE DES SUGGESTIONS QUE POUR LES QUESTIONS À OPTIONS :**
- Questions avec choix multiples (ex: "Quel est ton CA mensuel ? A) 0-10k B) 10-50k C) 50k+")
- Questions oui/non (ex: "Tu as déjà essayé d'autres solutions ?")
- Questions avec range (ex: "Quel pourcentage d'abandon ? A) 0-30% B) 30-60% C) 60%+")

**NE PROPOSE JAMAIS de suggestions pour :**
- Questions ouvertes (ex: "Quel est ton principal défi ?")
- Demande d'URL de site web
- Demande d'email ou prénom
- Toutes les questions qui nécessitent une réponse personnalisée

**RÈGLE D'OR : Moins de suggestions = plus naturel. N'en propose que quand vraiment nécessaire.**

**confidence** : Ton niveau de confiance dans l'extraction des données
**needsWebScraping** : true si une URL a été fournie et nécessite scraping
**emotionalState** : état émotionnel détecté pour analytics
`;

async function handleLegacyRequest(
  message: string,
  conversationHistory: ChatMessage[],
  leadData: any,
  sectionContext?: string,
  sectionDescription?: string
): Promise<NextResponse> {
  
  // Calculate troll score
  const messageCount = conversationHistory.filter(m => m.role === 'user').length + 1;
  const sessionStarted = conversationHistory.length > 0 
    ? new Date(Date.now() - (conversationHistory.length * 30000)).toISOString() // Estimate session start
    : new Date().toISOString();
  
  const trollScore = scoreTrollBehavior(
    message, 
    conversationHistory,
    { messageCount, sessionStarted }
  );
  
  // Build context message for lead data
  let contextMessage = '';
  
  // Add troll score context
  if (trollScore.score > 0) {
    contextMessage += `\n\n## SCORE DE TROLL : ${trollScore.score}/100`;
    
    if (trollScore.score >= 50) {
      contextMessage += `\n⚠️ ALERTE TROLL : Utilisateur suspect. Passe en mode ironique.`;
      if (trollScore.reasons.length > 0) {
        contextMessage += `\nPatterns détectés : ${trollScore.reasons.join(', ')}`;
      }
    } else if (trollScore.score >= 30) {
      contextMessage += `\n⚠️ Comportement légèrement suspect. Reste vigilant.`;
    }
  }
  
  if (leadData && Object.keys(leadData).length > 0) {
    const infosList = Object.entries(leadData)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
    contextMessage += `\n\n## INFORMATIONS DÉJÀ COLLECTÉES :\n${infosList}\n\n⚠️ NE REDEMANDE JAMAIS ces informations !`;
  }
  
  // Add section context if provided
  if (sectionContext && sectionDescription) {
    contextMessage += `\n\n## CONTEXTE DE LA PAGE :\nSection actuelle: ${sectionContext}\nDescription: ${sectionDescription}\n\nUtilise ce contexte pour adapter ta réponse et être plus pertinent.`;
  }

  // Prepare messages
  const messages: ChatMessage[] = [
    ...conversationHistory.slice(-20), // Last 20 messages
    {
      role: 'user',
      content: message
    }
  ];

  // Call Claude API
  let response;
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        temperature: 0.7,
        system: LEGACY_SYSTEM_PROMPT + contextMessage,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      });
      break;
    } catch (apiError: any) {
      if (apiError.status === 429 && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        retryCount++;
        continue;
      }
      throw apiError;
    }
  }

  if (!response) {
    throw new Error('Failed to get response from AI after retries');
  }

  // Extract text content
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  // Parse JSON response
  let aiResponse: any;
  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiResponse = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback
      aiResponse = {
        message: textContent.text,
        extractedData: {},
        isQualificationComplete: false,
      };
    }
  } catch (parseError) {
    console.error('Failed to parse Claude JSON:', parseError);
    aiResponse = {
      message: textContent.text,
      extractedData: {},
      isQualificationComplete: false,
    };
  }

  // Ensure message is not empty
  if (!aiResponse.message || aiResponse.message.trim().length === 0) {
    aiResponse.message = "Désolé, peux-tu reformuler ? Je veux bien comprendre. 😊";
  }

  return NextResponse.json({
    success: true,
    response: aiResponse,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  });
}

// ============================================================================
// AGENT ORCHESTRATOR
// ============================================================================

async function processWithAgent(
  userMessage: string,
  conversationHistory: ChatMessage[],
  context: ConversationContext
): Promise<{ 
  messages: AgentMessage[]; 
  context: ConversationContext;
  usage?: { inputTokens: number; outputTokens: number };
}> {
  
  // Score the user message for troll behavior
  const trollScore = scoreTrollBehavior(userMessage, conversationHistory, context);
  
  // Update context with troll score
  context.trollScore = Math.max(context.trollScore || 0, trollScore.score);
  if (trollScore.reasons.length > 0) {
    context.trollHistory = [
      ...(context.trollHistory || []),
      ...trollScore.reasons
    ].slice(-10); // Keep last 10 patterns
  }
  
  // Decay troll score slightly if this message is normal (to allow redemption)
  if (trollScore.score < 20 && context.trollScore > 0) {
    context.trollScore = Math.max(0, context.trollScore - 5);
  }
  
  // Build enhanced system prompt with context
  const contextMessage = buildContextMessage(context);
  const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n${contextMessage}`;

  // Prepare messages for Claude
  const messages: ChatMessage[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage
    }
  ];

  // Call Claude with tools
  let response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    temperature: 0.7,
    system: enhancedSystemPrompt,
    tools: AGENT_TOOLS,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  });

  // Process tool calls iteratively until we get a final text response
  const toolResults: ToolCall[] = [];
  let iterations = 0;
  const maxIterations = 5; // Prevent infinite loops

  while (response.stop_reason === 'tool_use' && iterations < maxIterations) {
    iterations++;
    
    // Extract tool calls
    const toolUseBlocks = response.content.filter((block): block is Anthropic.ToolUseBlock => 
      block.type === 'tool_use'
    );

    // Execute each tool
    const newToolResults: any[] = [];
    for (const toolUse of toolUseBlocks) {
      const toolInput = toolUse.input as Record<string, any>;
      const result = await executeTool(toolUse.name, toolInput, context);
      toolResults.push({
        name: toolUse.name,
        parameters: toolInput,
        result
      });
      
      newToolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result)
      });
    }

    // Continue conversation with tool results
    messages.push({
      role: 'assistant',
      content: response.content
    });

    messages.push({
      role: 'user',
      content: newToolResults
    });

    // Get next response
    response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.7,
      system: enhancedSystemPrompt,
      tools: AGENT_TOOLS,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
  }

  // Extract final text response
  const textBlocks = response.content.filter((block): block is Anthropic.TextBlock => 
    block.type === 'text'
  );
  
  const finalText = textBlocks.map(block => block.text).join('\n\n');

  // Try to parse as JSON, fallback to plain text
  let agentMessages: AgentMessage[];
  let newState: AgentState = context.state;

  try {
    const parsed = JSON.parse(finalText);
    agentMessages = parsed.messages || [{ text: finalText }];
    newState = parsed.state || context.state;
  } catch {
    // Fallback: plain text response
    agentMessages = [{ text: finalText }];
  }

  // Update metadata
  context.metadata.messageCount++;
  context.metadata.lastInteraction = new Date().toISOString();
  context.state = newState;

  return {
    messages: agentMessages,
    context,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  };
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      conversationHistory = [],
      context: clientContext,
      isFirstMessage = false,
      leadData, // Legacy support
      sectionContext,
      sectionDescription
    } = body;

    // Detect legacy mode (old ChatWidgetAI.tsx)
    const isLegacyMode = leadData !== undefined && clientContext === undefined;

    // Initialize or restore context
    let context: ConversationContext = clientContext ? {
      ...clientContext,
      trollScore: clientContext.trollScore ?? 0,
      trollHistory: clientContext.trollHistory ?? []
    } : {
      state: 'greeting',
      cart: [],
      userInfo: {},
      metadata: {
        sessionStarted: new Date().toISOString(),
        lastInteraction: new Date().toISOString(),
        messageCount: 0,
        intentHistory: []
      },
      trollScore: 0,
      trollHistory: []
    };

    // Handle greeting sequence (first interaction) - only for new mode
    if (!isLegacyMode && (isFirstMessage || context.state === 'greeting')) {
      return NextResponse.json({
        success: true,
        messages: GREETING_SEQUENCE,
        context: {
          ...context,
          state: 'discovery',
          metadata: {
            ...context.metadata,
            messageCount: GREETING_SEQUENCE.length
          }
        },
        isGreeting: true
      });
    }

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long' },
        { status: 400 }
      );
    }

    // LEGACY MODE: Use old simplified prompt for backward compatibility
    if (isLegacyMode) {
      return await handleLegacyRequest(message, conversationHistory, leadData, sectionContext, sectionDescription);
    }

    // NEW MODE: Use agent orchestrator
    const result = await processWithAgent(
      message,
      conversationHistory,
      context
    );

    return NextResponse.json({
      success: true,
      messages: result.messages,
      context: result.context,
      usage: result.usage
    });

  } catch (error: any) {
    console.error('Error in chat-ai:', error);
    
    // Handle Anthropic-specific errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
