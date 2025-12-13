import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  SessionContext,
  ConversationMessage,
  QualificationData,
  FunnelStage
} from '@/lib/zedcheckout-types';
import {
  calculateTypingDelay,
  scoreSpamBehavior,
  compressContext,
  extractQualificationInsights,
  formatSSE,
  parseSplitMessages
} from '@/lib/zedcheckout-utils';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// SYSTEM PROMPT LOADING
// ============================================================================

let CACHED_SYSTEM_PROMPT: string | null = null;

function getSystemPrompt(): string {
  if (!CACHED_SYSTEM_PROMPT) {
    const promptPath = path.join(process.cwd(), 'prompts', 'zedcheckout-qualification.txt');
    CACHED_SYSTEM_PROMPT = fs.readFileSync(promptPath, 'utf-8');
  }
  return CACHED_SYSTEM_PROMPT;
}

// ============================================================================
// CONTEXT BUILDER
// ============================================================================

function buildEnhancedSystemPrompt(
  sessionContext: SessionContext,
  conversationHistory: ConversationMessage[]
): string {
  const basePrompt = getSystemPrompt();
  
  // Build session data section
  const sessionData = `
### Informations de session

- **ID de session**: ${sessionContext.sessionId}
- **Stage actuel**: ${sessionContext.funnelStage}
- **Nombre de messages**: ${sessionContext.messagesCount}
- **Qualifié**: ${sessionContext.qualificationData.qualified ? 'Oui' : 'Non'}
- **Score spam**: ${sessionContext.spamScore}/100

### Données de qualification collectées

${extractQualificationInsights(sessionContext)}

### Historique spam

${sessionContext.spamHistory.length > 0 
  ? sessionContext.spamHistory.slice(-5).join(', ') 
  : 'Aucun pattern suspect'}
`;

  // Build conversation history section
  const compressedHistory = compressContext(conversationHistory);
  const historyText = compressedHistory.length > 0
    ? compressedHistory.map(msg => 
        `**${msg.role === 'user' ? 'Client' : 'Assistant'}**: ${msg.content}`
      ).join('\n\n')
    : 'Aucun historique (premier message)';

  // Replace placeholders
  return basePrompt
    .replace('{{SESSION_DATA}}', sessionData)
    .replace('{{CONVERSATION_HISTORY}}', historyText);
}

// ============================================================================
// SESSION INITIALIZATION
// ============================================================================

function createNewSession(sessionId: string): SessionContext {
  return {
    sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    messagesCount: 0,
    funnelStage: 'initial',
    qualificationData: {
      platform: null,
      shopifyPlan: undefined,
      trafficMonthly: null,
      revenueAnnual: null,
      frustrations: [],
      abandonRate: null,
      urgency: null,
      qualified: false,
      disqualifiedReason: null,
    },
    spamScore: 0,
    spamHistory: [],
  };
}

// ============================================================================
// STREAMING HANDLER
// ============================================================================

async function streamResponse(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  sessionContext: SessionContext
): Promise<Response> {
  
  // Check spam score
  const spamAnalysis = scoreSpamBehavior(userMessage, conversationHistory, sessionContext);
  
  // Update context with spam score
  sessionContext.spamScore = Math.max(sessionContext.spamScore, spamAnalysis.score);
  if (spamAnalysis.reasons.length > 0) {
    sessionContext.spamHistory = [
      ...sessionContext.spamHistory,
      ...spamAnalysis.reasons
    ].slice(-10);
  }
  
  // If spam score is too high, return error
  if (spamAnalysis.isSpam && sessionContext.spamScore > 70) {
    return new Response(
      formatSSE('error', { 
        message: 'Comportement suspect détecté. Conversation terminée.',
        code: 'SPAM_DETECTED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
  
  // Build enhanced system prompt with context
  const systemPrompt = buildEnhancedSystemPrompt(sessionContext, conversationHistory);
  
  // Prepare messages for Claude
  const messages: Anthropic.MessageParam[] = [
    ...compressContext(conversationHistory).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  // Create ReadableStream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send typing_start event
        controller.enqueue(
          encoder.encode(formatSSE('typing_start', { typing: true }))
        );
        
        // Call Claude API
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          temperature: 0.7,
          system: systemPrompt,
          messages,
        });
        
        // Extract text content
        const textContent = response.content.find((block) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text content in Claude response');
        }
        
        const fullResponse = textContent.text.trim();
        
        // Parse split messages
        const splitMessages = parseSplitMessages(fullResponse);
        
        // Stream each message chunk with delays
        for (let i = 0; i < splitMessages.length; i++) {
          const { content, delay } = splitMessages[i];
          
          // Send message chunk
          controller.enqueue(
            encoder.encode(formatSSE('message_chunk', { 
              content,
              index: i,
              total: splitMessages.length
            }))
          );
          
          // Send split signal if not the last message
          if (i < splitMessages.length - 1) {
            controller.enqueue(
              encoder.encode(formatSSE('split_signal', {
                split: true,
                typing_delay_ms: delay
              }))
            );
          }
        }
        
        // Update session context
        sessionContext.messagesCount += 2; // User message + assistant response
        sessionContext.lastActivity = new Date().toISOString();
        
        // Send message_complete event with updated context
        controller.enqueue(
          encoder.encode(formatSSE('message_complete', {
            typing: false,
            session_updated: true,
            context: sessionContext,
            usage: {
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens,
            }
          }))
        );
        
        // Close the stream
        controller.close();
        
      } catch (error: any) {
        console.error('Streaming error:', error);
        
        controller.enqueue(
          encoder.encode(formatSSE('error', {
            message: 'Erreur lors de la génération de la réponse',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          }))
        );
        
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      message,
      conversationHistory = [],
      context: clientContext
    } = body;
    
    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message trop long. Maximum 500 caractères.' },
        { status: 400 }
      );
    }
    
    // Initialize or restore session context
    const sessionContext: SessionContext = clientContext 
      ? {
          ...clientContext,
          lastActivity: new Date().toISOString(),
        }
      : createNewSession(sessionId || `session_${Date.now()}`);
    
    // Stream the response
    return await streamResponse(message, conversationHistory, sessionContext);
    
  } catch (error: any) {
    console.error('Error in zedcheckout-chat:', error);
    
    // Handle specific Anthropic errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'API key invalide' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Limite de taux dépassée' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'zedcheckout-chat',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
