// ============================================================================
// ZEDCHECKOUT CONVERSATIONAL AI - TYPES & INTERFACES
// ============================================================================

export type FunnelStage =
  | 'initial'                    // Premier contact
  | 'platform_identification'    // Q1: Quelle plateforme ?
  | 'traffic_volume'             // Q2: Combien visiteurs/mois ?
  | 'revenue_check'              // Q3: CA annuel ?
  | 'frustration_discovery'      // Q4: Quelle frustration ?
  | 'abandon_rate_analysis'      // Q5: Taux d'abandon ?
  | 'urgency_assessment'         // Q6: Dans quel délai ?
  | 'booking_proposal'           // Q7: Proposition audit
  | 'qualified'                  // Lead HOT
  | 'disqualified';              // Lead éliminé

export type Platform = 'shopify' | 'woocommerce' | 'prestashop' | 'other' | null;

export type UrgencyLevel = 'week' | 'month' | 'exploring' | null;

export interface QualificationData {
  platform: Platform;
  shopifyPlan?: 'standard' | 'plus' | 'unknown';
  trafficMonthly: number | null;    // Nombre de visiteurs/mois
  revenueAnnual: number | null;     // CA annuel en €
  frustrations: string[];           // Liste des frustrations
  abandonRate: number | null;       // Taux d'abandon en %
  urgency: UrgencyLevel;
  qualified: boolean;
  disqualifiedReason: string | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SessionContext {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  messagesCount: number;
  funnelStage: FunnelStage;
  qualificationData: QualificationData;
  spamScore: number; // 0-100
  spamHistory: string[];
}

export interface StreamMessage {
  content: string;
  typingDelayMs: number;
}

export interface SSEEvent {
  event: 'typing_start' | 'message_chunk' | 'split_signal' | 'message_complete' | 'error';
  data: any;
}
