/**
 * ZedHumAIn - Human-like AI Conversation Engine
 * 
 * Core intelligence layer for ZedCheckout conversational AI.
 * Handles message queuing, intent analysis, context validation,
 * and smart response generation.
 * 
 * @author Romain Piveteau (ZedTech)
 * @version 0.1.0
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type IntentType = 
  | 'CORRECTION'      // User corrects previous info ("non, pas coiffure, massages")
  | 'CLARIFICATION'   // User adds details ("et plus", "aussi")
  | 'NEW_INFO'        // User provides new information
  | 'CONFIRMATION'    // User confirms ("oui", "ok", "d'accord")
  | 'QUESTION'        // User asks a question
  | 'OBJECTION';      // User raises concern ("trop cher", "pas maintenant")

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  processed?: boolean;
}

export interface MessageIntent {
  type: IntentType;
  confidence: number;
  keywords: string[];
  relatesTo?: string; // ID of related previous message
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: number; // 0-1 scale
}

export interface ConversationFact {
  key: string;
  value: any;
  confidence: number;
  source: string; // Message ID that established this fact
  timestamp: string;
}

export interface Correction {
  from: string;
  to: string;
  field: string;
  timestamp: string;
  messageId: string;
}

export interface ConversationContext {
  // Established facts about the user/business
  facts: Map<string, ConversationFact>;
  
  // History of corrections
  corrections: Correction[];
  
  // User's stated objectives
  objectives: string[];
  
  // Last action taken by the bot
  lastBotAction: string;
  
  // Questions already asked (to avoid repetition)
  questionsAsked: string[];
  
  // Current conversation stage
  stage: string;
  
  // Full message history (limited window)
  messageHistory: Message[];
}

export interface ContextAnalysis {
  newInfo: MessageIntent[];
  corrections: MessageIntent[];
  confirmations: MessageIntent[];
  clarifications: MessageIntent[];
  redundant: boolean;
  shouldAdvance: boolean; // Should move conversation forward
  needsCorrection: boolean; // Bot made an error that needs addressing
}

export interface ResponseStrategy {
  mode: 'SINGLE' | 'MULTI_COHERENT' | 'CORRECTION_FIRST';
  messageCount: number;
  actions: string[];
  tone: 'apologetic' | 'neutral' | 'enthusiastic' | 'professional';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Message queue settings
  DEBOUNCE_SINGLE_MS: 1000,      // Wait 1s for single message
  DEBOUNCE_BATCH_MS: 2500,       // Wait 2.5s for message batch
  MAX_QUEUE_SIZE: 10,            // Max messages to queue before forcing process
  
  // Context settings
  HISTORY_WINDOW: 20,            // Keep last 20 messages (10 exchanges)
  FACTS_RETENTION: 100,          // Max facts to retain
  
  // Response settings
  MAX_BOT_MESSAGES: 3,           // Max consecutive bot messages
  MIN_SIMILARITY_THRESHOLD: 0.8, // Similarity threshold for duplicate detection
  
  // Intent detection
  CONFIDENCE_THRESHOLD: 0.7,     // Min confidence to trust intent
};

// ============================================================================
// ZEDHUMAIN CORE CLASS
// ============================================================================

export class ZedHumAIn {
  private messageQueue: Message[] = [];
  private context: ConversationContext;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  
  // Callbacks
  private onResponseGenerated?: (messages: string[]) => void;
  private onContextUpdated?: (context: ConversationContext) => void;
  private onError?: (error: Error) => void;
  
  constructor(initialContext?: Partial<ConversationContext>) {
    this.context = {
      facts: new Map(),
      corrections: [],
      objectives: [],
      lastBotAction: '',
      questionsAsked: [],
      stage: 'initial',
      messageHistory: [],
      ...initialContext,
    };
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Process a new user message
   */
  async processMessage(newMessage: Message): Promise<void> {
    try {
      // 1. Add to queue
      this.messageQueue.push(newMessage);
      this.context.messageHistory.push(newMessage);
      
      // Trim history window
      if (this.context.messageHistory.length > CONFIG.HISTORY_WINDOW) {
        this.context.messageHistory = this.context.messageHistory.slice(-CONFIG.HISTORY_WINDOW);
      }
      
      // 2. Clear existing debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      
      // 3. Decide when to process
      const shouldProcessNow = this.shouldProcessImmediately();
      const debounceTime = shouldProcessNow 
        ? CONFIG.DEBOUNCE_SINGLE_MS 
        : CONFIG.DEBOUNCE_BATCH_MS;
      
      // 4. Set new timer
      this.debounceTimer = setTimeout(() => {
        this.batchProcess();
      }, debounceTime);
      
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  /**
   * Get current conversation context
   */
  getContext(): ConversationContext {
    return { ...this.context };
  }
  
  /**
   * Update a fact in the context
   */
  updateFact(key: string, value: any, confidence: number = 1.0, source: string = 'manual'): void {
    this.context.facts.set(key, {
      key,
      value,
      confidence,
      source,
      timestamp: new Date().toISOString(),
    });
    
    this.notifyContextUpdate();
  }
  
  /**
   * Register callbacks
   */
  onResponse(callback: (messages: string[]) => void): void {
    this.onResponseGenerated = callback;
  }
  
  onContextUpdate(callback: (context: ConversationContext) => void): void {
    this.onContextUpdated = callback;
  }
  
  onErrorCallback(callback: (error: Error) => void): void {
    this.onError = callback;
  }
  
  /**
   * Force process the queue (useful for testing or manual trigger)
   */
  async forceProcess(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await this.batchProcess();
  }
  
  // ============================================================================
  // PRIVATE METHODS - DECISION LOGIC
  // ============================================================================
  
  /**
   * Decide if we should process immediately or wait for more messages
   */
  private shouldProcessImmediately(): boolean {
    // Force process if queue is too large
    if (this.messageQueue.length >= CONFIG.MAX_QUEUE_SIZE) {
      return true;
    }
    
    // If only 1 message, process faster
    if (this.messageQueue.length === 1) {
      return true;
    }
    
    // If last message is a clear confirmation, process immediately
    const lastMsg = this.messageQueue[this.messageQueue.length - 1];
    if (this.isConfirmation(lastMsg.text)) {
      return true;
    }
    
    // If last message is a question, process immediately
    if (this.isQuestion(lastMsg.text)) {
      return true;
    }
    
    // Otherwise, wait for batch
    return false;
  }
  
  /**
   * Check if message is a confirmation
   */
  private isConfirmation(text: string): boolean {
    const confirmationPatterns = [
      /^(oui|ok|d'accord|vas-y|go|exact|c'est ça|parfait|super|génial)$/i,
      /^(yes|okay|sure|alright|sounds good|let's go)$/i,
    ];
    
    const normalized = text.trim().toLowerCase();
    return confirmationPatterns.some(pattern => pattern.test(normalized));
  }
  
  /**
   * Check if message is a question
   */
  private isQuestion(text: string): boolean {
    return text.trim().endsWith('?') || /^(comment|pourquoi|quand|où|qui|quoi|combien|how|why|when|where|who|what)/i.test(text);
  }
  
  // ============================================================================
  // PRIVATE METHODS - BATCH PROCESSING
  // ============================================================================
  
  /**
   * Main batch processing logic
   */
  private async batchProcess(): Promise<void> {
    if (this.isProcessing) {
      console.warn('[ZedHumAIn] Already processing, skipping');
      return;
    }
    
    if (this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      console.log(`[ZedHumAIn] Processing batch of ${this.messageQueue.length} message(s)`);
      
      // 1. Analyze intents
      const intents = this.analyzeIntents(this.messageQueue);
      console.log('[ZedHumAIn] Intents detected:', intents.map(i => i.type));
      
      // 2. Validate against context
      const contextAnalysis = this.validateContext(intents);
      console.log('[ZedHumAIn] Context analysis:', {
        newInfo: contextAnalysis.newInfo.length,
        corrections: contextAnalysis.corrections.length,
        confirmations: contextAnalysis.confirmations.length,
        redundant: contextAnalysis.redundant,
      });
      
      // 3. Determine response strategy
      const strategy = this.determineResponseStrategy(intents, contextAnalysis);
      console.log('[ZedHumAIn] Strategy:', strategy);
      
      // 4. Generate smart response
      const response = await this.generateSmartResponse(intents, contextAnalysis, strategy);
      console.log('[ZedHumAIn] Generated response:', response.length, 'message(s)');
      
      // 5. Self-check and validate
      const validated = this.selfCheck(response);
      console.log('[ZedHumAIn] Validated response:', validated.length, 'message(s)');
      
      // 6. Update context with extracted facts
      this.updateContextFromMessages(this.messageQueue, intents);
      
      // 7. Send response via callback
      if (this.onResponseGenerated) {
        this.onResponseGenerated(validated);
      }
      
      // 8. Clear queue
      this.messageQueue = [];
      
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  // ============================================================================
  // PRIVATE METHODS - INTENT ANALYSIS
  // ============================================================================
  
  /**
   * Analyze intents from a batch of messages
   */
  private analyzeIntents(messages: Message[]): MessageIntent[] {
    return messages.map((msg, index) => {
      const text = msg.text.toLowerCase();
      const prevMessage = index > 0 ? messages[index - 1] : null;
      
      // Pattern matching for V0 (simple but effective)
      
      // 1. CORRECTION detection
      if (this.isCorrectionPattern(text)) {
        return {
          type: 'CORRECTION',
          confidence: 0.9,
          keywords: this.extractKeywords(text),
          relatesTo: prevMessage?.id,
          sentiment: 'neutral',
          urgency: 0.8,
        };
      }
      
      // 2. CONFIRMATION detection
      if (this.isConfirmation(text)) {
        return {
          type: 'CONFIRMATION',
          confidence: 0.95,
          keywords: [],
          sentiment: 'positive',
          urgency: 0.9,
        };
      }
      
      // 3. CLARIFICATION detection
      if (this.isClarificationPattern(text)) {
        return {
          type: 'CLARIFICATION',
          confidence: 0.85,
          keywords: this.extractKeywords(text),
          relatesTo: prevMessage?.id,
          sentiment: 'neutral',
          urgency: 0.6,
        };
      }
      
      // 4. OBJECTION detection
      if (this.isObjectionPattern(text)) {
        return {
          type: 'OBJECTION',
          confidence: 0.8,
          keywords: this.extractKeywords(text),
          sentiment: 'negative',
          urgency: 0.7,
        };
      }
      
      // 5. QUESTION detection
      if (this.isQuestion(text)) {
        return {
          type: 'QUESTION',
          confidence: 0.9,
          keywords: this.extractKeywords(text),
          sentiment: 'neutral',
          urgency: 0.8,
        };
      }
      
      // 6. Default: NEW_INFO
      return {
        type: 'NEW_INFO',
        confidence: 0.7,
        keywords: this.extractKeywords(text),
        sentiment: this.detectSentiment(text),
        urgency: 0.5,
      };
    });
  }
  
  /**
   * Pattern matchers
   */
  private isCorrectionPattern(text: string): boolean {
    const patterns = [
      /\b(non|pas|erreur|plutôt|en fait|correction|actually|not)\b/i,
      /\b(je fais|c'est|il s'agit de)\b.*\b(pas|non)\b/i,
    ];
    return patterns.some(p => p.test(text));
  }
  
  private isClarificationPattern(text: string): boolean {
    const patterns = [
      /^(et|plus|aussi|en plus|également|and|also|plus)\b/i,
      /\b(je veux dire|c'est-à-dire|précision|en fait)\b/i,
    ];
    return patterns.some(p => p.test(text));
  }
  
  private isObjectionPattern(text: string): boolean {
    const patterns = [
      /\b(trop|cher|coûte|prix|budget|expensive|costly)\b/i,
      /\b(pas|non|ne|jamais|not|never)\b.*\b(possible|intéressé|temps|maintenant)\b/i,
      /\b(mais|cependant|toutefois|néanmoins|but|however)\b/i,
    ];
    return patterns.some(p => p.test(text));
  }
  
  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove stop words and extract meaningful terms
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc',
      'de', 'du', 'à', 'au', 'en', 'sur', 'pour', 'par', 'dans',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
      'i', 'you', 'he', 'she', 'we', 'they',
    ]);
    
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    return [...new Set(words)]; // Unique words only
  }
  
  /**
   * Detect sentiment (simple V0 implementation)
   */
  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = /\b(super|génial|parfait|excellent|cool|top|great|awesome|good)\b/i;
    const negativeWords = /\b(nul|mauvais|problème|souci|erreur|bug|bad|wrong|issue|problem)\b/i;
    
    if (positiveWords.test(text)) return 'positive';
    if (negativeWords.test(text)) return 'negative';
    return 'neutral';
  }
  
  // ============================================================================
  // PRIVATE METHODS - CONTEXT VALIDATION
  // ============================================================================
  
  /**
   * Validate intents against existing context
   */
  private validateContext(intents: MessageIntent[]): ContextAnalysis {
    const newInfo: MessageIntent[] = [];
    const corrections: MessageIntent[] = [];
    const confirmations: MessageIntent[] = [];
    const clarifications: MessageIntent[] = [];
    
    let redundant = false;
    let needsCorrection = false;
    
    for (const intent of intents) {
      switch (intent.type) {
        case 'CORRECTION':
          corrections.push(intent);
          needsCorrection = true;
          break;
          
        case 'CONFIRMATION':
          confirmations.push(intent);
          break;
          
        case 'CLARIFICATION':
          clarifications.push(intent);
          break;
          
        case 'NEW_INFO':
          // Check if we already have this info
          const alreadyKnown = intent.keywords.some(keyword =>
            Array.from(this.context.facts.values()).some(fact =>
              String(fact.value).toLowerCase().includes(keyword)
            )
          );
          
          if (!alreadyKnown) {
            newInfo.push(intent);
          } else {
            redundant = true;
          }
          break;
          
        default:
          newInfo.push(intent);
      }
    }
    
    // Determine if we should advance the conversation
    const shouldAdvance = 
      confirmations.length > 0 ||
      (newInfo.length > 0 && corrections.length === 0);
    
    return {
      newInfo,
      corrections,
      confirmations,
      clarifications,
      redundant,
      shouldAdvance,
      needsCorrection,
    };
  }
  
  // ============================================================================
  // PRIVATE METHODS - RESPONSE GENERATION
  // ============================================================================
  
  /**
   * Determine response strategy based on analysis
   */
  private determineResponseStrategy(
    intents: MessageIntent[],
    analysis: ContextAnalysis
  ): ResponseStrategy {
    // If correction needed, address it first
    if (analysis.needsCorrection) {
      return {
        mode: 'CORRECTION_FIRST',
        messageCount: 2,
        actions: ['APOLOGIZE', 'CORRECT', 'CONTINUE'],
        tone: 'apologetic',
      };
    }
    
    // If confirmation, move forward quickly
    if (analysis.confirmations.length > 0) {
      return {
        mode: 'SINGLE',
        messageCount: 1,
        actions: ['ACKNOWLEDGE', 'ADVANCE'],
        tone: 'enthusiastic',
      };
    }
    
    // If multiple new info pieces, synthesize
    if (analysis.newInfo.length > 1 || analysis.clarifications.length > 0) {
      return {
        mode: 'MULTI_COHERENT',
        messageCount: 2,
        actions: ['SYNTHESIZE', 'ASK_NEXT'],
        tone: 'professional',
      };
    }
    
    // Default: single response
    return {
      mode: 'SINGLE',
      messageCount: 1,
      actions: ['RESPOND', 'ASK'],
      tone: 'neutral',
    };
  }
  
  /**
   * Generate smart, context-aware response
   */
  private async generateSmartResponse(
    intents: MessageIntent[],
    analysis: ContextAnalysis,
    strategy: ResponseStrategy
  ): Promise<string[]> {
    const messages: string[] = [];
    
    // CORRECTION FIRST strategy
    if (strategy.mode === 'CORRECTION_FIRST') {
      messages.push("Ah pardon, j'avais mal compris ! 🙏");
      
      // Extract what was corrected
      const correctionKeywords = analysis.corrections
        .flatMap(c => c.keywords)
        .slice(0, 3);
      
      if (correctionKeywords.length > 0) {
        messages.push(`Ok, donc c'est bien ${correctionKeywords.join(', ')}. Noté !`);
      }
    }
    
    // CONFIRMATION strategy
    else if (analysis.confirmations.length > 0) {
      const confirmationPhrases = [
        "Parfait ! 🎯",
        "Super ! On avance.",
        "Ok, c'est noté !",
        "Génial, merci !",
      ];
      messages.push(confirmationPhrases[Math.floor(Math.random() * confirmationPhrases.length)]);
    }
    
    // MULTI_COHERENT strategy (synthesize multiple messages)
    else if (strategy.mode === 'MULTI_COHERENT') {
      const allKeywords = [
        ...analysis.newInfo.flatMap(i => i.keywords),
        ...analysis.clarifications.flatMap(i => i.keywords),
      ];
      
      messages.push(`Je comprends : ${allKeywords.slice(0, 5).join(', ')}.`);
    }
    
    // Default: acknowledge the input
    else {
      const keywords = intents.flatMap(i => i.keywords).slice(0, 3);
      if (keywords.length > 0) {
        messages.push(`Ok, ${keywords.join(' et ')}.`);
      }
    }
    
    // Limit to max messages
    return messages.slice(0, CONFIG.MAX_BOT_MESSAGES);
  }
  
  // ============================================================================
  // PRIVATE METHODS - SELF-CHECK
  // ============================================================================
  
  /**
   * Self-check generated response for quality and coherence
   */
  private selfCheck(response: string[]): string[] {
    const lastBotMessages = this.getLastBotMessages(5);
    
    // 1. Remove duplicate messages (similarity check)
    const filtered = response.filter(msg =>
      !lastBotMessages.some(prev =>
        this.calculateSimilarity(msg, prev) > CONFIG.MIN_SIMILARITY_THRESHOLD
      )
    );
    
    // 2. Remove questions we've already asked
    const withoutDuplicateQuestions = filtered.map(msg => {
      let cleaned = msg;
      
      // Extract questions from message
      const questions = this.extractQuestions(msg);
      
      questions.forEach(question => {
        if (this.context.questionsAsked.includes(question.toLowerCase())) {
          // Remove this question
          cleaned = cleaned.replace(question, '').trim();
        }
      });
      
      return cleaned;
    }).filter(msg => msg.length > 0);
    
    // 3. Ensure messages are not empty
    return withoutDuplicateQuestions.filter(msg => msg.trim().length > 10);
  }
  
  /**
   * Calculate similarity between two strings (simple Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Extract questions from text
   */
  private extractQuestions(text: string): string[] {
    // Simple regex to find question patterns
    const questionPattern = /([^.!?]+\?)/g;
    const matches = text.match(questionPattern);
    return matches || [];
  }
  
  /**
   * Get last N bot messages from history
   */
  private getLastBotMessages(count: number): string[] {
    return this.context.messageHistory
      .filter(msg => msg.sender === 'assistant')
      .slice(-count)
      .map(msg => msg.text);
  }
  
  // ============================================================================
  // PRIVATE METHODS - CONTEXT UPDATE
  // ============================================================================
  
  /**
   * Update context with facts extracted from messages
   */
  private updateContextFromMessages(messages: Message[], intents: MessageIntent[]): void {
    messages.forEach((msg, index) => {
      const intent = intents[index];
      
      // Extract and store facts based on keywords
      intent.keywords.forEach(keyword => {
        // Check if this looks like a fact (URL, number, specific term)
        if (this.looksLikeFact(keyword, msg.text)) {
          this.updateFact(
            keyword,
            this.extractFactValue(keyword, msg.text),
            intent.confidence,
            msg.id
          );
        }
      });
    });
    
    this.notifyContextUpdate();
  }
  
  /**
   * Check if a keyword represents a fact
   */
  private looksLikeFact(keyword: string, fullText: string): boolean {
    // URL pattern
    if (/^https?:\/\//.test(keyword) || /\.(com|fr|net|org)/.test(keyword)) {
      return true;
    }
    
    // Number pattern
    if (/^\d+/.test(keyword)) {
      return true;
    }
    
    // Specific business terms
    const factTerms = ['shopify', 'woocommerce', 'prestashop', 'magento', 'site', 'boutique', 'shop'];
    if (factTerms.some(term => keyword.includes(term))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Extract fact value from text
   */
  private extractFactValue(keyword: string, fullText: string): any {
    // For URLs, extract full URL
    const urlMatch = fullText.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return urlMatch[0];
    }
    
    // For numbers, extract numeric value
    const numberMatch = fullText.match(/\d+[k€$]?/i);
    if (numberMatch) {
      return numberMatch[0];
    }
    
    // Default: return the keyword itself
    return keyword;
  }
  
  // ============================================================================
  // PRIVATE METHODS - UTILITIES
  // ============================================================================
  
  private notifyContextUpdate(): void {
    if (this.onContextUpdated) {
      this.onContextUpdated(this.context);
    }
  }
  
  private handleError(error: Error): void {
    console.error('[ZedHumAIn] Error:', error);
    if (this.onError) {
      this.onError(error);
    }
  }
  
  // ============================================================================
  // PUBLIC UTILITIES
  // ============================================================================
  
  /**
   * Export context as JSON (for persistence)
   */
  exportContext(): string {
    const exportData = {
      facts: Array.from(this.context.facts.entries()),
      corrections: this.context.corrections,
      objectives: this.context.objectives,
      lastBotAction: this.context.lastBotAction,
      questionsAsked: this.context.questionsAsked,
      stage: this.context.stage,
      messageHistory: this.context.messageHistory.slice(-10), // Last 10 only
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import context from JSON
   */
  importContext(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      
      this.context.facts = new Map(data.facts || []);
      this.context.corrections = data.corrections || [];
      this.context.objectives = data.objectives || [];
      this.context.lastBotAction = data.lastBotAction || '';
      this.context.questionsAsked = data.questionsAsked || [];
      this.context.stage = data.stage || 'initial';
      this.context.messageHistory = data.messageHistory || [];
      
      this.notifyContextUpdate();
    } catch (error) {
      this.handleError(new Error('Failed to import context: ' + (error as Error).message));
    }
  }
  
  /**
   * Reset the conversation (clear all context)
   */
  reset(): void {
    this.messageQueue = [];
    this.context = {
      facts: new Map(),
      corrections: [],
      objectives: [],
      lastBotAction: '',
      questionsAsked: [],
      stage: 'initial',
      messageHistory: [],
    };
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.isProcessing = false;
    this.notifyContextUpdate();
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

/**
 * Create a new ZedHumAIn instance with default configuration
 */
export function createZedHumAIn(config?: Partial<ConversationContext>): ZedHumAIn {
  return new ZedHumAIn(config);
}

/**
 * Helper to format facts for display
 */
export function formatFacts(facts: Map<string, ConversationFact>): string {
  const entries = Array.from(facts.entries());
  
  if (entries.length === 0) {
    return 'No facts collected yet.';
  }
  
  return entries
    .map(([key, fact]) => `• ${key}: ${fact.value} (confidence: ${Math.round(fact.confidence * 100)}%)`)
    .join('\n');
}
