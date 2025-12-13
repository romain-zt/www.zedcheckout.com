import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  EmotionDetectionEngine, 
  EmotionOutput,
  KINESTHETIC_RESPONSE_TEMPLATES,
  toKinestheticLanguage
} from '@/lib/emotion-detection-engine';
import { loadPrompt, normalizeLocale, type Locale } from '@/lib/prompt-loader';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to convert our Locale type to emotion engine's expected format
function toEmotionLocale(locale: Locale): 'fr' | 'en' {
  return locale.startsWith('fr') ? 'fr' : 'en';
}

// Initialize emotion detection engine
const emotionEngine = new EmotionDetectionEngine();

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

interface RoleplayCharacter {
  name: string;
  profile: string;
  background: string;
  scenario: string;
  dialogueSample: string;
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
// SYSTEM PROMPTS - Loaded from external files
// ============================================================================

// Cache prompts in memory to avoid reading files repeatedly
let CACHED_PROMPTS: Record<string, string> = {};

function getSystemPrompt(locale: Locale): string {
  const cacheKey = `chat-agent-${locale}`;
  if (!CACHED_PROMPTS[cacheKey]) {
    CACHED_PROMPTS[cacheKey] = loadPrompt('chat-agent', locale);
  }
  return CACHED_PROMPTS[cacheKey];
}

function getLegacySystemPrompt(locale: Locale): string {
  const cacheKey = `chat-lead-${locale}`;
  if (!CACHED_PROMPTS[cacheKey]) {
    CACHED_PROMPTS[cacheKey] = loadPrompt('chat-lead', locale);
  }
  return CACHED_PROMPTS[cacheKey];
}

function getRoleplaySystemPrompt(locale: Locale, characterData: RoleplayCharacter): string {
  // Don't cache roleplay prompts since they're personalized per character
  const basePrompt = loadPrompt('roleplay-character', locale);
  
  // Replace placeholder variables with actual character data
  return basePrompt
    .replace(/\$fromdb_name/g, characterData.name || 'Character')
    .replace(/\$fromdb_profile/g, characterData.profile || '')
    .replace(/\$fromdb_background/g, characterData.background || '')
    .replace(/\$fromdb_scenario/g, characterData.scenario || '')
    .replace(/\$fromdb_sample/g, characterData.dialogueSample || '');
}


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

async function handleLegacyRequest(
  message: string,
  conversationHistory: ChatMessage[],
  leadData: any,
  sectionContext?: string,
  sectionDescription?: string,
  locale: Locale = 'fr-FR'
): Promise<NextResponse> {
  
  // Calculate troll score using old method
  const messageCount = conversationHistory.filter(m => m.role === 'user').length + 1;
  const sessionStarted = conversationHistory.length > 0 
    ? new Date(Date.now() - (conversationHistory.length * 30000)).toISOString() // Estimate session start
    : new Date().toISOString();
  
  const trollScore = scoreTrollBehavior(
    message, 
    conversationHistory,
    { messageCount, sessionStarted }
  );
  
  // 🔥 NEW: Advanced emotion detection
  let emotionAnalysis: EmotionOutput | null = null;
  try {
    emotionAnalysis = emotionEngine.analyze({
      message,
      conversationHistory: conversationHistory.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
      })),
      context: {
        messageCount,
        sessionDuration: Math.floor((Date.now() - new Date(sessionStarted).getTime()) / 1000),
        previousScore: trollScore.score,
        locale: toEmotionLocale(locale)
      }
    });
  } catch (err) {
    console.error('Emotion analysis failed:', err);
  }
  
  // Build context message for lead data
  let contextMessage = '';
  
  // 🔥 NEW: Add advanced emotion analysis context
  if (emotionAnalysis) {
    contextMessage += `\n\n## ANALYSE ÉMOTIONNELLE AVANCÉE :`;
    contextMessage += `\n- État émotionnel principal : ${emotionAnalysis.emotionalState.primary.toUpperCase()} (confiance: ${Math.round(emotionAnalysis.emotionalState.confidence * 100)}%)`;
    contextMessage += `\n- Score comportemental : ${emotionAnalysis.behaviorScore.current}/100 (Tier ${emotionAnalysis.behaviorScore.tier})`;
    contextMessage += `\n- Tendance : ${emotionAnalysis.behaviorScore.trend}`;
    contextMessage += `\n- Rédemption possible : ${emotionAnalysis.behaviorScore.redemptionPossible ? 'Oui' : 'Non'}`;
    
    // Intent breakdown
    contextMessage += `\n\n### Analyse d'intention :`;
    contextMessage += `\n- Intention authentique : ${Math.round(emotionAnalysis.intentScore.genuine * 100)}%`;
    contextMessage += `\n- Intention troll : ${Math.round(emotionAnalysis.intentScore.trolling * 100)}%`;
    contextMessage += `\n- Confusion : ${Math.round(emotionAnalysis.intentScore.confused * 100)}%`;
    
    // Kinesthetic signals detected
    if (emotionAnalysis.emotionalState.kinestheticSignals.length > 0) {
      contextMessage += `\n\n### Signaux kinesthésiques détectés :`;
      emotionAnalysis.emotionalState.kinestheticSignals.forEach(signal => {
        contextMessage += `\n- ${signal}`;
      });
    }
    
    // Suggested response style
    contextMessage += `\n\n### STYLE DE RÉPONSE RECOMMANDÉ :`;
    contextMessage += `\n- Ton : ${emotionAnalysis.suggestedResponse.tone}`;
    contextMessage += `\n- Exemple : "${emotionAnalysis.suggestedResponse.example}"`;
    contextMessage += `\n- Éléments kinesthésiques à utiliser : ${emotionAnalysis.suggestedResponse.kinestheticElements.join(', ')}`;
    
    // Patterns detected
    if (emotionAnalysis.detectionPatterns.positive.length > 0) {
      contextMessage += `\n\n✅ Patterns positifs : ${emotionAnalysis.detectionPatterns.positive.slice(0, 3).join(', ')}`;
    }
    if (emotionAnalysis.detectionPatterns.negative.length > 0) {
      contextMessage += `\n⚠️ Patterns négatifs : ${emotionAnalysis.detectionPatterns.negative.slice(0, 3).join(', ')}`;
    }
  }
  
  // Add troll score context (legacy fallback)
  if (trollScore.score > 0 && !emotionAnalysis) {
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

  // Load the appropriate prompt for lead generation
  const legacyPrompt = getLegacySystemPrompt(locale);
  
  // Call Claude API
  let response;
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        temperature: 0.5,
        system: legacyPrompt + contextMessage,
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
    let jsonText = textContent.text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    
    // Try to extract JSON from the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let rawJson = jsonMatch[0];
      
      // Fix unescaped newlines in JSON strings (Claude sometimes forgets to escape them)
      // This is tricky - we need to escape newlines that are inside string values
      // Strategy: Find string values and escape their newlines
      rawJson = rawJson.replace(
        /"message"\s*:\s*"([\s\S]*?)"/,
        (match, content) => {
          // Escape unescaped newlines in the message field
          const escaped = content
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          return `"message": "${escaped}"`;
        }
      );
      
      aiResponse = JSON.parse(rawJson);
      
      // Validate that we got a proper response object
      if (!aiResponse.message || typeof aiResponse.message !== 'string') {
        throw new Error('Invalid JSON structure: missing or invalid message field');
      }
    } else {
      // Fallback: treat entire text as message
      aiResponse = {
        message: textContent.text,
        extractedData: {},
        isQualificationComplete: false,
      };
    }
  } catch (parseError) {
    console.error('Failed to parse Claude JSON:', parseError);
    console.error('Raw text:', textContent.text);
    
    // Fallback: use raw text as message
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

  // 🔥 Enrich response with emotion analysis data
  const enrichedResponse = {
    ...aiResponse,
    // Add emotion analysis if available
    emotionAnalysis: emotionAnalysis ? {
      emotionalState: emotionAnalysis.emotionalState.primary,
      emotionConfidence: emotionAnalysis.emotionalState.confidence,
      behaviorScore: emotionAnalysis.behaviorScore.current,
      behaviorTier: emotionAnalysis.behaviorScore.tier,
      behaviorTrend: emotionAnalysis.behaviorScore.trend,
      redemptionPossible: emotionAnalysis.behaviorScore.redemptionPossible,
      intentScore: emotionAnalysis.intentScore,
      suggestedTone: emotionAnalysis.suggestedResponse.tone,
      kinestheticSignals: emotionAnalysis.emotionalState.kinestheticSignals,
    } : null
  };

  return NextResponse.json({
    success: true,
    response: enrichedResponse,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  });
}

// ============================================================================
// ROLEPLAY MODE HANDLER
// ============================================================================

async function handleRoleplayRequest(
  message: string,
  conversationHistory: ChatMessage[],
  characterData: RoleplayCharacter,
  locale: Locale = 'fr-FR'
): Promise<NextResponse> {
  
  // Get the roleplay system prompt with character data
  const systemPrompt = getRoleplaySystemPrompt(locale, characterData);
  
  // Prepare messages for Claude
  const messages: ChatMessage[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: message
    }
  ];

  // Call Claude for roleplay
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    temperature: 0.9, // Higher temperature for more creative/natural roleplay
    system: systemPrompt,
    messages: messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    }))
  });

  // Extract text response
  const textContent = response.content.find((block): block is Anthropic.TextBlock => 
    block.type === 'text'
  );

  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  const responseText = textContent.text.trim();

  // Parse emotion from response format: [EMOTION]\n***narration***\ndialogue
  let emotion = 'Neutral';
  let narration = '';
  let dialogue = '';
  
  // Extract emotion tag
  const emotionMatch = responseText.match(/^\[(\w+)\]/);
  if (emotionMatch) {
    emotion = emotionMatch[1];
  }
  
  // Remove emotion tag and split into narration and dialogue
  const contentWithoutEmotion = responseText.replace(/^\[(\w+)\]\s*/, '');
  const narrationMatch = contentWithoutEmotion.match(/^\*\*\*([\s\S]*?)\*\*\*\s*/);
  
  if (narrationMatch) {
    narration = narrationMatch[1].trim();
    dialogue = contentWithoutEmotion.replace(/^\*\*\*([\s\S]*?)\*\*\*\s*/, '').trim();
  } else {
    dialogue = contentWithoutEmotion.trim();
  }

  return NextResponse.json({
    success: true,
    response: {
      emotion,
      narration,
      dialogue,
      fullText: responseText
    },
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
  context: ConversationContext,
  locale: Locale = 'fr-FR'
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
  
  // Load the appropriate prompt for checkout agent
  const systemPrompt = getSystemPrompt(locale);
  
  // Build enhanced system prompt with context
  const contextMessage = buildContextMessage(context);
  const enhancedSystemPrompt = `${systemPrompt}\n\n${contextMessage}`;

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
import characterDataRaw from "./character.json";

// Extract character data to match RoleplayCharacter interface
const characterData: RoleplayCharacter = {
  name: characterDataRaw.character.name,
  profile: characterDataRaw.character.profile,
  background: characterDataRaw.character.background,
  scenario: characterDataRaw.scenarios.map(s => `${s.id}: ${s.goal}`).join('; '),
  dialogueSample: characterDataRaw.response_structure.format
};

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
      sectionDescription,
      locale: requestLocale, // New: locale from request
      mode, // New: 'roleplay' | 'agent' | 'lead'
    } = body;

    // Detect and normalize locale from request or Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const rawLocale = requestLocale || (acceptLanguage.startsWith('en') ? 'en' : 'fr');
    const locale: Locale = normalizeLocale(rawLocale);

    // Detect mode
    const isRoleplayMode = mode === 'roleplay' && characterData !== undefined;
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

    if (message.length > 200_000) {
      return NextResponse.json(
        { error: 'Message too long' },
        { status: 400 }
      );
    }

    // ROLEPLAY MODE: Ultra-realistic WhatsApp-style character roleplay
    if (isRoleplayMode) {
      return await handleRoleplayRequest(message, conversationHistory, characterData, locale);
    }

    // LEGACY MODE: Use old simplified prompt for backward compatibility
    if (isLegacyMode) {
      return await handleLegacyRequest(message, conversationHistory, leadData, sectionContext, sectionDescription, locale);
    }

    // NEW MODE: Use agent orchestrator
    const result = await processWithAgent(
      message,
      conversationHistory,
      context,
      locale
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
