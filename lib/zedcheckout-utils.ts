// ============================================================================
// ZEDCHECKOUT CONVERSATIONAL AI - UTILITIES
// ============================================================================

import { ConversationMessage, SessionContext } from './zedcheckout-types';

/**
 * Calcule le délai de typing basé sur la longueur du message
 * Simule un comportement humain naturel
 */
export function calculateTypingDelay(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount <= 5) {
    return 600 + Math.random() * 400; // 600-1000ms
  }
  
  if (wordCount <= 15) {
    return 1000 + Math.random() * 500; // 1000-1500ms
  }
  
  if (wordCount <= 25) {
    return 1200 + Math.random() * 600; // 1200-1800ms
  }
  
  // Messages plus longs (exception)
  return 1500 + Math.random() * 1000; // 1500-2500ms
}

/**
 * Score le comportement spam/troll
 * Retourne un score de 0 à 100
 */
export interface SpamScore {
  score: number;
  reasons: string[];
  isSpam: boolean;
}

export function scoreSpamBehavior(
  message: string,
  conversationHistory: ConversationMessage[],
  sessionContext?: SessionContext
): SpamScore {
  let score = 0;
  const reasons: string[] = [];
  
  const msgLower = message.toLowerCase().trim();
  const msgLength = message.trim().length;
  
  // Pattern 1: Messages très courts répétés
  if (msgLength <= 3) {
    score += 20;
    reasons.push('very_short_message');
  }
  
  // Pattern 2: Répétition excessive
  const recentUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content.toLowerCase().trim());
  
  const repetitionCount = recentUserMessages.filter(m => m === msgLower).length;
  if (repetitionCount >= 2) {
    score += 30 * repetitionCount;
    reasons.push('message_repetition');
  }
  
  // Pattern 3: Gibberish (chaîne aléatoire de caractères)
  const hasOnlyNonsense = /^[a-z]{15,}$/.test(msgLower.replace(/\s/g, '')) && 
                          !/\b(bonjour|merci|oui|non|salut|hello|ok|shopify)\b/.test(msgLower);
  if (hasOnlyNonsense) {
    score += 35;
    reasons.push('gibberish');
  }
  
  // Pattern 4: Messages trop longs (>500 caractères = suspect)
  if (msgLength > 500) {
    score += 15;
    reasons.push('excessively_long');
  }
  
  // Pattern 5: Phrases de test communes
  const testPhrases = [
    'test', 'lol', 'mdr', 'xd', 'ptdr', 'haha',
    'je test', 'je teste', 'test test',
    'blabla', 'gnagnagna'
  ];
  
  const hasTestPhrase = testPhrases.some(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    return regex.test(msgLower);
  });
  
  if (hasTestPhrase && msgLength < 20) {
    score += 25;
    reasons.push('test_phrase');
  }
  
  // Pattern 6: Rapid fire (nombreux messages en peu de temps)
  if (sessionContext) {
    const timeSinceStart = Date.now() - new Date(sessionContext.createdAt).getTime();
    const messagesPerMinute = (sessionContext.messagesCount / timeSinceStart) * 60000;
    
    if (messagesPerMinute > 8 && sessionContext.messagesCount > 5) {
      score += 20;
      reasons.push('rapid_fire');
    }
  }
  
  // Pattern 7: Contenu absurde
  const absurdPatterns = [
    /^[0-9]+$/,           // Seulement des chiffres
    /(.)\1{10,}/,         // Même caractère répété 10+ fois
    /^[!?.,;:]+$/,        // Seulement de la ponctuation
  ];
  
  if (absurdPatterns.some(pattern => pattern.test(message))) {
    score += 30;
    reasons.push('absurd_content');
  }
  
  // Cap le score à 100
  score = Math.min(100, score);
  
  return {
    score,
    reasons,
    isSpam: score >= 50 // Seuil: 50+ = spam probable
  };
}

/**
 * Compresse l'historique de conversation pour ne garder que les 10 derniers messages
 */
export function compressContext(fullHistory: ConversationMessage[]): ConversationMessage[] {
  return fullHistory.slice(-10);
}

/**
 * Extrait les données de qualification depuis le contexte
 */
export function extractQualificationInsights(context: SessionContext): string {
  const insights: string[] = [];
  const data = context.qualificationData;
  
  if (data.platform) {
    insights.push(`Plateforme: ${data.platform}`);
    if (data.shopifyPlan) {
      insights.push(`Plan Shopify: ${data.shopifyPlan}`);
    }
  }
  
  if (data.trafficMonthly !== null) {
    insights.push(`Trafic: ${data.trafficMonthly} visiteurs/mois`);
  }
  
  if (data.revenueAnnual !== null) {
    insights.push(`CA: ${data.revenueAnnual}€/an`);
  }
  
  if (data.frustrations.length > 0) {
    insights.push(`Frustrations: ${data.frustrations.join(', ')}`);
  }
  
  if (data.abandonRate !== null) {
    insights.push(`Taux abandon: ${data.abandonRate}%`);
  }
  
  if (data.urgency) {
    insights.push(`Urgence: ${data.urgency}`);
  }
  
  if (data.disqualifiedReason) {
    insights.push(`⚠️ Disqualifié: ${data.disqualifiedReason}`);
  }
  
  return insights.length > 0 ? insights.join('\n') : 'Aucune donnée collectée';
}

/**
 * Formate un événement SSE
 */
export function formatSSE(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Parse les messages split depuis la réponse LLM
 */
export function parseSplitMessages(fullResponse: string): Array<{ content: string; delay: number }> {
  const parts = fullResponse.split('[SPLIT]').map(s => s.trim()).filter(s => s.length > 0);
  
  return parts.map(content => ({
    content,
    delay: calculateTypingDelay(content)
  }));
}
