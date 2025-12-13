/**
 * ADVANCED EMOTION DETECTION & INTELLIGENT SCORING ENGINE
 * 
 * System Objectives:
 * 1. Detect TRUE user intent vs. trolling behavior
 * 2. Recognize emotional states (stress, enthusiasm, curiosity, skepticism, boredom)
 * 3. Adapt responses with kinesthetic language
 * 4. Score behavior intelligently with redemption paths
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EmotionalState = 
  | 'curious'
  | 'stressed'
  | 'skeptical'
  | 'enthusiastic'
  | 'bored'
  | 'trolling'
  | 'confused'
  | 'neutral';

export type ResponseTone = 
  | 'professional'
  | 'empathetic'
  | 'ironic'
  | 'direct'
  | 'warm'
  | 'playful';

export type TrollTier = 1 | 2 | 3 | 4 | 5;

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface EmotionInput {
  message: string;
  conversationHistory: ConversationMessage[];
  context: {
    messageCount: number;
    sessionDuration: number; // in seconds
    previousScore: number;
    locale?: 'fr' | 'en';
  };
}

export interface EmotionalStateResult {
  primary: EmotionalState;
  confidence: number;
  kinestheticSignals: string[];
}

export interface IntentScore {
  genuine: number;
  trolling: number;
  confused: number;
}

export interface BehaviorScore {
  current: number;
  trend: 'improving' | 'stable' | 'degrading';
  redemptionPossible: boolean;
  tier: TrollTier;
}

export interface SuggestedResponse {
  tone: ResponseTone;
  kinestheticElements: string[];
  example: string;
  templateKey: string;
}

export interface DetectionPatterns {
  positive: string[];
  negative: string[];
  neutral: string[];
}

export interface EmotionOutput {
  emotionalState: EmotionalStateResult;
  intentScore: IntentScore;
  behaviorScore: BehaviorScore;
  suggestedResponse: SuggestedResponse;
  detectionPatterns: DetectionPatterns;
  rawAnalysis: {
    wordCount: number;
    hasURL: boolean;
    hasBusinessContext: boolean;
    hasQuestion: boolean;
    sentimentScore: number;
  };
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

const POSITIVE_PATTERNS = {
  fr: [
    /pourquoi|comment|combien|quand|quelle?s?/i,  // Questions
    /mon site|ma boutique|mon business|mon entreprise/i,  // Business context
    /https?:\/\/|\.com|\.fr|\.net/i,  // URLs
    /intéress|curieux|découvrir|comprendre/i,  // Interest
    /€|euros?|budget|prix|tarif|coût/i,  // Purchase intent
    /email|contact|téléphone|rappel/i,  // Contact intent
    /chiffre d'affaires|ca|trafic|visit/i,  // Business metrics
    /shopify|woocommerce|prestashop/i,  // Platform mentions
  ],
  en: [
    /why|how|much|when|which|what/i,  // Questions
    /my site|my store|my business|my company/i,  // Business context
    /https?:\/\/|\.com|\.fr|\.net/i,  // URLs
    /interest|curious|discover|understand/i,  // Interest
    /€|\$|euros?|dollars?|budget|price|cost/i,  // Purchase intent
    /email|contact|phone|callback/i,  // Contact intent
    /revenue|turnover|traffic|visit/i,  // Business metrics
    /shopify|woocommerce|prestashop/i,  // Platform mentions
  ]
};

const NEGATIVE_PATTERNS = {
  fr: [
    /^(test|lol|mdr|xd|ptdr|haha|hehe|ok)+$/i,  // Pure troll
    /(.)\1{5,}/,  // Character repetition
    /^[!?.,;:]+$/,  // Just punctuation
    /blabla|gnagna|nanana/i,  // Nonsense
    /nul|pourri|naze|stupide|con/i,  // Insults
    /^[a-z]{20,}$/i,  // Long gibberish
    /spam|fake|arnaque|scam/i,  // Distrust words
  ],
  en: [
    /^(test|lol|lmao|xd|haha|hehe|ok)+$/i,  // Pure troll
    /(.)\1{5,}/,  // Character repetition
    /^[!?.,;:]+$/,  // Just punctuation
    /blah|whatever|nonsense/i,  // Nonsense
    /stupid|dumb|trash|sucks/i,  // Insults
    /^[a-z]{20,}$/i,  // Long gibberish
    /spam|fake|scam/i,  // Distrust words
  ]
};

const KINESTHETIC_SIGNALS = {
  fr: {
    actionVerbs: ['ressentir', 'sentir', 'expérimenter', 'toucher', 'saisir', 'prendre', 'lancer', 'avancer'],
    physicalSensations: ['lourd', 'léger', 'pression', 'tension', 'fluidité', 'blocage', 'déclic', 'élan'],
    movementMetaphors: ['flow', 'flux', 'mouvement', 'pas', 'chemin', 'parcours', 'avancer', 'progresser'],
  },
  en: {
    actionVerbs: ['feel', 'sense', 'experience', 'touch', 'grasp', 'take', 'launch', 'move'],
    physicalSensations: ['heavy', 'light', 'pressure', 'tension', 'flow', 'stuck', 'click', 'momentum'],
    movementMetaphors: ['flow', 'movement', 'step', 'path', 'journey', 'forward', 'progress'],
  }
};

const EMOTIONAL_INDICATORS = {
  stressed: {
    fr: ['urgent', 'vite', 'rapidement', 'pressé', 'asap', 'maintenant', 'help', 'aide', 'problème', 'bloqué'],
    en: ['urgent', 'quick', 'fast', 'asap', 'now', 'help', 'problem', 'stuck', 'hurry']
  },
  enthusiastic: {
    fr: ['super', 'génial', 'parfait', 'top', 'excellent', 'love', 'adore', 'hâte', 'excité'],
    en: ['great', 'awesome', 'perfect', 'amazing', 'excellent', 'love', 'excited', 'can\'t wait']
  },
  skeptical: {
    fr: ['vraiment', 'sérieux', 'prouve', 'preuve', 'garantie', 'sûr', 'doute', 'mais', 'cependant'],
    en: ['really', 'seriously', 'prove', 'proof', 'guarantee', 'sure', 'doubt', 'but', 'however']
  },
  curious: {
    fr: ['comment', 'pourquoi', 'expliquer', 'détail', 'comprendre', 'savoir', 'intéress'],
    en: ['how', 'why', 'explain', 'detail', 'understand', 'know', 'interest']
  },
  bored: {
    fr: ['ok', 'ouais', 'mouais', 'bof', 'peu importe', 'whatever'],
    en: ['ok', 'yeah', 'meh', 'whatever', 'fine', 'sure']
  }
};

// ============================================================================
// RESPONSE TEMPLATES (Kinesthetic Language)
// ============================================================================

export const KINESTHETIC_RESPONSE_TEMPLATES = {
  stressed: {
    fr: {
      tone: 'direct' as ResponseTone,
      kinestheticElements: ["Réponses courtes", "Focus action", "Éliminer la friction"],
      example: "Compris. Voici ce qu'on fait : [une ligne]. Tu veux les détails ou on démarre ?",
      templateKey: 'stressed_fr'
    },
    en: {
      tone: 'direct' as ResponseTone,
      kinestheticElements: ["Short responses", "Action-focused", "Remove friction"],
      example: "Got it. Here's what we do: [one line]. Want details or ready to start?",
      templateKey: 'stressed_en'
    }
  },
  curious: {
    fr: {
      tone: 'warm' as ResponseTone,
      kinestheticElements: ["Détails modérés", "Ton éducatif", "Inviter à explorer"],
      example: "Bonne question ! Voilà comment ça fonctionne... Quelle partie t'intéresse le plus ?",
      templateKey: 'curious_fr'
    },
    en: {
      tone: 'warm' as ResponseTone,
      kinestheticElements: ["Moderate detail", "Educational tone", "Invite exploration"],
      example: "Great question! Here's how it works... What part interests you most?",
      templateKey: 'curious_en'
    }
  },
  skeptical: {
    fr: {
      tone: 'professional' as ResponseTone,
      kinestheticElements: ["Preuve sociale", "Exemples concrets", "Reconnaître les doutes"],
      example: "Je comprends le scepticisme. Voici ce qu'on observe avec nos bêta-testeurs... Des questions ?",
      templateKey: 'skeptical_fr'
    },
    en: {
      tone: 'professional' as ResponseTone,
      kinestheticElements: ["Social proof", "Concrete examples", "Acknowledge concerns"],
      example: "I get the skepticism. Here's what we're seeing with beta users... Questions?",
      templateKey: 'skeptical_en'
    }
  },
  enthusiastic: {
    fr: {
      tone: 'playful' as ResponseTone,
      kinestheticElements: ["Matcher l'énergie", "Aller vite", "Capitaliser le momentum"],
      example: "J'adore l'énergie ! On te setup direct. C'est quoi ton URL ?",
      templateKey: 'enthusiastic_fr'
    },
    en: {
      tone: 'playful' as ResponseTone,
      kinestheticElements: ["Match energy", "Move fast", "Capitalize momentum"],
      example: "Love the energy! Let's get you set up. What's your URL?",
      templateKey: 'enthusiastic_en'
    }
  },
  trolling_tier3: {
    fr: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Ironie légère", "Redirection directe", "Dernière chance"],
      example: "Ok, question sérieuse : tu veux vraiment qu'on parle business ou... ?",
      templateKey: 'troll_3_fr'
    },
    en: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Light irony", "Direct redirect", "Last chance"],
      example: "Ok, serious question: do you actually want to talk business or...?",
      templateKey: 'troll_3_en'
    }
  },
  trolling_tier4: {
    fr: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Sarcasme intelligent", "Offre finale", "Meta-humour"],
      example: "Je suis une IA mais j'ai quand même des standards. Question réelle ou on se dit au revoir ?",
      templateKey: 'troll_4_fr'
    },
    en: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Intelligent sarcasm", "Final offer", "Meta-humor"],
      example: "I'm an AI but I still have standards. Real question or goodbye?",
      templateKey: 'troll_4_en'
    }
  },
  trolling_tier5: {
    fr: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Meta-humour max", "Dernière offre", "Exit avec classe"],
      example: "Impressionnant ton niveau de troll. Dernière chance : business ou on arrête là ?",
      templateKey: 'troll_5_fr'
    },
    en: {
      tone: 'ironic' as ResponseTone,
      kinestheticElements: ["Max meta-humor", "Final offer", "Classy exit"],
      example: "Impressive troll game. Last chance: business or bust?",
      templateKey: 'troll_5_en'
    }
  }
};

// ============================================================================
// MAIN DETECTION ENGINE
// ============================================================================

export class EmotionDetectionEngine {
  private locale: 'fr' | 'en';
  
  constructor(locale: 'fr' | 'en' = 'fr') {
    this.locale = locale;
  }
  
  /**
   * Main analysis function - returns complete emotion output
   */
  analyze(input: EmotionInput): EmotionOutput {
    const { message, conversationHistory, context } = input;
    this.locale = context.locale || 'fr';
    
    // Raw analysis
    const rawAnalysis = this.performRawAnalysis(message);
    
    // Emotional state detection
    const emotionalState = this.detectEmotionalState(message, conversationHistory, rawAnalysis);
    
    // Intent scoring
    const intentScore = this.calculateIntentScore(message, conversationHistory, rawAnalysis);
    
    // Behavior scoring with tiers
    const behaviorScore = this.calculateBehaviorScore(
      message, 
      conversationHistory, 
      context.previousScore,
      intentScore
    );
    
    // Generate suggested response
    const suggestedResponse = this.generateSuggestedResponse(
      emotionalState.primary,
      behaviorScore.tier
    );
    
    // Compile detection patterns found
    const detectionPatterns = this.compileDetectionPatterns(message, conversationHistory);
    
    return {
      emotionalState,
      intentScore,
      behaviorScore,
      suggestedResponse,
      detectionPatterns,
      rawAnalysis
    };
  }
  
  /**
   * Perform raw text analysis
   */
  private performRawAnalysis(message: string): EmotionOutput['rawAnalysis'] {
    const msgLower = message.toLowerCase().trim();
    
    return {
      wordCount: message.split(/\s+/).filter(w => w.length > 0).length,
      hasURL: /https?:\/\/|\.com|\.fr|\.net|\.org/i.test(message),
      hasBusinessContext: this.hasBusinessContext(message),
      hasQuestion: /\?|comment|pourquoi|combien|quand|how|why|what|when/i.test(message),
      sentimentScore: this.calculateSentimentScore(message)
    };
  }
  
  /**
   * Check for business context in message
   */
  private hasBusinessContext(message: string): boolean {
    const businessTerms = this.locale === 'fr'
      ? /site|boutique|business|entreprise|€|euros?|chiffre|trafic|conversion|vente|client/i
      : /site|store|business|company|\$|dollars?|revenue|traffic|conversion|sale|customer/i;
    
    return businessTerms.test(message);
  }
  
  /**
   * Calculate basic sentiment score (-1 to 1)
   */
  private calculateSentimentScore(message: string): number {
    let score = 0;
    const msgLower = message.toLowerCase();
    
    // Positive indicators
    const positiveWords = this.locale === 'fr'
      ? ['merci', 'super', 'génial', 'parfait', 'bien', 'intéress', 'oui', 'ok', 'd\'accord']
      : ['thanks', 'great', 'awesome', 'perfect', 'good', 'interest', 'yes', 'ok', 'agree'];
    
    positiveWords.forEach(word => {
      if (msgLower.includes(word)) score += 0.2;
    });
    
    // Negative indicators
    const negativeWords = this.locale === 'fr'
      ? ['non', 'pas', 'jamais', 'nul', 'mauvais', 'problème', 'impossible']
      : ['no', 'not', 'never', 'bad', 'poor', 'problem', 'impossible'];
    
    negativeWords.forEach(word => {
      if (msgLower.includes(word)) score -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, score));
  }
  
  /**
   * Detect primary emotional state
   */
  private detectEmotionalState(
    message: string, 
    history: ConversationMessage[],
    rawAnalysis: EmotionOutput['rawAnalysis']
  ): EmotionalStateResult {
    const msgLower = message.toLowerCase();
    const scores: Record<EmotionalState, number> = {
      curious: 0,
      stressed: 0,
      skeptical: 0,
      enthusiastic: 0,
      bored: 0,
      trolling: 0,
      confused: 0,
      neutral: 0.3 // Base score
    };
    
    // Check for emotional indicators
    Object.entries(EMOTIONAL_INDICATORS).forEach(([emotion, indicators]) => {
      const localeIndicators = indicators[this.locale as keyof typeof indicators] || indicators.fr;
      localeIndicators.forEach(indicator => {
        if (msgLower.includes(indicator.toLowerCase())) {
          scores[emotion as EmotionalState] += 0.3;
        }
      });
    });
    
    // Question marks boost curiosity
    if (rawAnalysis.hasQuestion) {
      scores.curious += 0.25;
    }
    
    // Business context boosts genuine intent
    if (rawAnalysis.hasBusinessContext || rawAnalysis.hasURL) {
      scores.curious += 0.2;
      scores.enthusiastic += 0.15;
    }
    
    // Check for troll patterns
    const negativePatterns = NEGATIVE_PATTERNS[this.locale] || NEGATIVE_PATTERNS.fr;
    negativePatterns.forEach(pattern => {
      if (pattern.test(message)) {
        scores.trolling += 0.4;
      }
    });
    
    // Very short messages without context
    if (rawAnalysis.wordCount <= 3 && !rawAnalysis.hasQuestion && !rawAnalysis.hasURL) {
      scores.bored += 0.2;
      scores.trolling += 0.1;
    }
    
    // Find primary emotion
    let primary: EmotionalState = 'neutral';
    let maxScore = 0;
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion as EmotionalState;
      }
    });
    
    // Detect kinesthetic signals
    const kinestheticSignals = this.detectKinestheticSignals(message);
    
    return {
      primary,
      confidence: Math.min(0.95, maxScore),
      kinestheticSignals
    };
  }
  
  /**
   * Detect kinesthetic language signals
   */
  private detectKinestheticSignals(message: string): string[] {
    const signals: string[] = [];
    const msgLower = message.toLowerCase();
    const kinesthetic = KINESTHETIC_SIGNALS[this.locale] || KINESTHETIC_SIGNALS.fr;
    
    kinesthetic.actionVerbs.forEach(verb => {
      if (msgLower.includes(verb.toLowerCase())) {
        signals.push(`Uses action verb: "${verb}"`);
      }
    });
    
    kinesthetic.physicalSensations.forEach(sensation => {
      if (msgLower.includes(sensation.toLowerCase())) {
        signals.push(`Expresses physical sensation: "${sensation}"`);
      }
    });
    
    kinesthetic.movementMetaphors.forEach(metaphor => {
      if (msgLower.includes(metaphor.toLowerCase())) {
        signals.push(`Uses movement metaphor: "${metaphor}"`);
      }
    });
    
    return signals;
  }
  
  /**
   * Calculate intent score
   */
  private calculateIntentScore(
    message: string,
    history: ConversationMessage[],
    rawAnalysis: EmotionOutput['rawAnalysis']
  ): IntentScore {
    let genuine = 0.5; // Base
    let trolling = 0;
    let confused = 0.1; // Small base
    
    const positivePatterns = POSITIVE_PATTERNS[this.locale] || POSITIVE_PATTERNS.fr;
    const negativePatterns = NEGATIVE_PATTERNS[this.locale] || NEGATIVE_PATTERNS.fr;
    
    // Positive signals boost genuine intent
    positivePatterns.forEach(pattern => {
      if (pattern.test(message)) {
        genuine += 0.1;
        trolling = Math.max(0, trolling - 0.05);
      }
    });
    
    // Negative signals boost troll detection
    negativePatterns.forEach(pattern => {
      if (pattern.test(message)) {
        trolling += 0.15;
        genuine = Math.max(0, genuine - 0.1);
      }
    });
    
    // URL is strong genuine signal
    if (rawAnalysis.hasURL) {
      genuine += 0.25;
      trolling = Math.max(0, trolling - 0.2);
    }
    
    // Business context is genuine signal
    if (rawAnalysis.hasBusinessContext) {
      genuine += 0.15;
    }
    
    // Questions boost genuine or confused
    if (rawAnalysis.hasQuestion) {
      genuine += 0.1;
      confused += 0.05;
    }
    
    // Check conversation history for patterns
    const recentUserMessages = history
      .filter(m => m.role === 'user')
      .slice(-5)
      .map(m => m.content.toLowerCase());
    
    // Repetition check
    const currentLower = message.toLowerCase();
    const repetitions = recentUserMessages.filter(m => m === currentLower).length;
    if (repetitions > 0) {
      trolling += repetitions * 0.2;
      genuine = Math.max(0, genuine - repetitions * 0.1);
    }
    
    // Normalize to ensure sum is roughly 1
    const total = genuine + trolling + confused;
    
    return {
      genuine: Math.min(1, genuine / total),
      trolling: Math.min(1, trolling / total),
      confused: Math.min(1, confused / total)
    };
  }
  
  /**
   * Calculate behavior score with tiers and redemption
   */
  private calculateBehaviorScore(
    message: string,
    history: ConversationMessage[],
    previousScore: number,
    intentScore: IntentScore
  ): BehaviorScore {
    let current = previousScore;
    
    // Add points for troll signals
    current += intentScore.trolling * 30;
    
    // Remove points for genuine signals (REDEMPTION)
    if (intentScore.genuine > 0.6) {
      current -= 15; // Genuine question redemption
    }
    
    // URL provided = major redemption
    if (/https?:\/\/|\.com|\.fr/i.test(message)) {
      current -= 20;
    }
    
    // Business context = redemption
    if (this.hasBusinessContext(message)) {
      current -= 10;
    }
    
    // Clamp score
    current = Math.max(0, Math.min(100, current));
    
    // Determine trend
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    const diff = current - previousScore;
    if (diff < -5) trend = 'improving';
    else if (diff > 5) trend = 'degrading';
    
    // Determine tier
    let tier: TrollTier = 1;
    if (current >= 80) tier = 5;
    else if (current >= 60) tier = 4;
    else if (current >= 40) tier = 3;
    else if (current >= 20) tier = 2;
    
    return {
      current: Math.round(current),
      trend,
      redemptionPossible: current < 80,
      tier
    };
  }
  
  /**
   * Generate suggested response based on emotional state and troll tier
   */
  private generateSuggestedResponse(
    emotionalState: EmotionalState,
    tier: TrollTier
  ): SuggestedResponse {
    // Handle troll tiers
    if (tier >= 3) {
      const trollKey = `trolling_tier${Math.min(tier, 5)}` as keyof typeof KINESTHETIC_RESPONSE_TEMPLATES;
      const template = KINESTHETIC_RESPONSE_TEMPLATES[trollKey]?.[this.locale];
      if (template) {
        return template;
      }
    }
    
    // Handle emotional states
    const template = KINESTHETIC_RESPONSE_TEMPLATES[emotionalState as keyof typeof KINESTHETIC_RESPONSE_TEMPLATES]?.[this.locale];
    
    if (template) {
      return template;
    }
    
    // Default response
    return {
      tone: 'professional',
      kinestheticElements: ["Use 'feel', 'sense', 'experience'", "Reference movement/flow metaphors"],
      example: this.locale === 'fr' 
        ? "Je sens que tu explores les options. Qu'est-ce qui te semble le plus adapté à ton business ?"
        : "I sense you're exploring options. What feels right for your business?",
      templateKey: 'default'
    };
  }
  
  /**
   * Compile detection patterns found in message
   */
  private compileDetectionPatterns(
    message: string,
    history: ConversationMessage[]
  ): DetectionPatterns {
    const positive: string[] = [];
    const negative: string[] = [];
    const neutral: string[] = [];
    
    const positivePatterns = POSITIVE_PATTERNS[this.locale] || POSITIVE_PATTERNS.fr;
    const negativePatterns = NEGATIVE_PATTERNS[this.locale] || NEGATIVE_PATTERNS.fr;
    
    positivePatterns.forEach(pattern => {
      if (pattern.test(message)) {
        positive.push(pattern.source);
      }
    });
    
    negativePatterns.forEach(pattern => {
      if (pattern.test(message)) {
        negative.push(pattern.source);
      }
    });
    
    // Neutral patterns
    if (message.length > 10 && message.length < 100) {
      neutral.push('Moderate message length');
    }
    
    if (/^[A-Z]/.test(message)) {
      neutral.push('Starts with capital (proper formatting)');
    }
    
    return { positive, negative, neutral };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick emotion check - lightweight version for real-time UI updates
 */
export function quickEmotionCheck(message: string, locale: 'fr' | 'en' = 'fr'): EmotionalState {
  const msgLower = message.toLowerCase();
  
  // Quick checks in order of priority
  if (NEGATIVE_PATTERNS[locale].some(p => p.test(message))) {
    return 'trolling';
  }
  
  if (EMOTIONAL_INDICATORS.enthusiastic[locale].some(w => msgLower.includes(w))) {
    return 'enthusiastic';
  }
  
  if (EMOTIONAL_INDICATORS.stressed[locale].some(w => msgLower.includes(w))) {
    return 'stressed';
  }
  
  if (EMOTIONAL_INDICATORS.skeptical[locale].some(w => msgLower.includes(w))) {
    return 'skeptical';
  }
  
  if (/\?|comment|pourquoi|how|why|what/.test(msgLower)) {
    return 'curious';
  }
  
  if (message.length < 10 && EMOTIONAL_INDICATORS.bored[locale].some(w => msgLower.includes(w))) {
    return 'bored';
  }
  
  return 'neutral';
}

/**
 * Generate kinesthetic alternative for a phrase
 */
export function toKinestheticLanguage(phrase: string, locale: 'fr' | 'en' = 'fr'): string {
  const replacements = locale === 'fr' ? {
    'Voulez-vous acheter': 'Qu\'est-ce qui vous semble adapté à votre business ?',
    'Notre solution aide': 'Imaginez le poids qui se lève quand la friction du checkout disparaît',
    'Inscrivez-vous maintenant': 'Prêt à avancer ?',
    'Cliquez ici': 'Faites le premier pas',
    'Commandez': 'Passez à l\'action',
  } : {
    'Do you want to buy': 'What feels like the right fit for your business?',
    'Our solution helps': 'Imagine the weight lifting when checkout friction disappears',
    'Sign up now': 'Feel ready to move forward?',
    'Click here': 'Take the first step',
    'Order': 'Take action',
  };
  
  let result = phrase;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'gi'), value);
  });
  
  return result;
}

// Export singleton instance
export const emotionEngine = new EmotionDetectionEngine();
