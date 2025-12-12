import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';

// ============================================================================
// RESEARCH TYPES
// ============================================================================

export type ResearchType = 
  | 'website_check'           // Vérifier si un site existe, sa plateforme, compatibilité
  | 'competitor_analysis'     // Analyser les concurrents
  | 'market_info'            // Info sur le marché e-commerce
  | 'platform_compatibility' // Vérifier compatibilité plateforme
  | 'technical_details'      // Détails techniques sur une solution
  | 'pricing_research';      // Recherche sur les prix du marché

interface ResearchRequest {
  type: ResearchType;
  query: string;              // La question précise pour Perplexity
  context: string;            // Le contexte de la conversation
  userWebsite?: string;       // URL du site utilisateur si disponible
  leadData?: any;             // Données du lead pour contexte
}

interface ResearchResponse {
  success: boolean;
  data?: any;
  summary?: string;           // Résumé pour l'AI
  error?: string;
}

// ============================================================================
// RESEARCH QUERY BUILDERS
// ============================================================================

function buildPerplexityQuery(request: ResearchRequest): string {
  const { type, query, context, userWebsite } = request;
  
  switch (type) {
    case 'website_check':
      return `Analyze the website ${userWebsite || 'mentioned'} with a customer-first approach. 

CRITICAL: Focus on understanding the ACTUAL business, not just surface appearances.

Priority 1 - BUSINESS UNDERSTANDING:
1. What does this business ACTUALLY do? (Be specific - don't guess based on design)
   - What products/services do they sell?
   - What industry are they in? (e.g., beauty/wellness, fashion, home goods, services)
   - Are they B2C, B2B, or both?
2. Who are their target customers?
   - Demographics, needs, pain points
3. What is their unique value proposition?
   - What makes them different?
   - What problem do they solve for customers?
4. What are their main product/service categories?

Priority 2 - E-COMMERCE SETUP:
5. Does the website exist and is it accessible?
6. What e-commerce platform is it using (Shopify, WooCommerce, PrestaShop, custom, etc.)?
7. Is it a professional setup or basic?
8. What's their current customer experience like? (navigation, checkout flow if visible)

Context: ${context}
Query: ${query}

IMPORTANT: Read the actual content carefully. A beauty institute is NOT decoration. A wellness spa is NOT fashion. Be precise about what the business ACTUALLY offers.

Provide a structured analysis focusing on customer needs first, technical details second.`;

    case 'platform_compatibility':
      return `Check if ZedCheckout (a conversational AI checkout solution) is compatible with ${query}.

I need to know:
1. Technical compatibility (API access, webhook support)
2. Common integration challenges
3. Estimated integration time
4. Any known limitations

Context: ${context}

Provide a concise answer focusing on compatibility.`;

    case 'competitor_analysis':
      return `Quick competitive analysis for conversational checkout / AI checkout solutions.

Focus on: ${query}

Context: ${context}

I need a brief overview of:
1. Main competitors in this space
2. Key differentiators
3. Market positioning

Be concise and factual.`;

    case 'market_info':
      return `E-commerce market information needed: ${query}

Context: ${context}

Provide recent, factual data about:
1. Market trends
2. Statistics if available
3. Industry standards

Keep it brief and relevant.`;

    case 'technical_details':
      return `Technical information needed about: ${query}

Context: ${context}

Provide clear, accurate technical details that would help explain this to a potential customer.`;

    case 'pricing_research':
      return `Market pricing research for: ${query}

Context: ${context}

I need:
1. Typical pricing ranges in the market
2. Common pricing models
3. What influences the price

Be concise and factual.`;

    default:
      return `${query}\n\nContext: ${context}\n\nProvide a concise, factual answer.`;
  }
}

// ============================================================================
// PERPLEXITY API CALL
// ============================================================================

async function callPerplexity(query: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `You are a customer-focused business analyst specializing in e-commerce. 

Your priority is understanding:
1. What the business ACTUALLY does (not assumptions based on design)
2. Who their customers are and what they need
3. The business model and value proposition
4. Then the technical implementation

Be precise: A beauty institute is NOT decoration. A wellness spa is NOT fashion accessories. Read the actual content, products, and services offered.

Provide concise, factual, well-structured answers that prioritize customer understanding over technical details.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { type, query, context, userWebsite, leadData } = body;

    // Validate request
    if (!type || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing type or query' },
        { status: 400 }
      );
    }

    // Build Perplexity query
    const perplexityQuery = buildPerplexityQuery(body);

    console.log(`[Research] Starting ${type} research:`, query);

    // Call Perplexity
    const perplexityResponse = await callPerplexity(perplexityQuery);

    // Extract the response content
    const researchResult = perplexityResponse.choices?.[0]?.message?.content || '';

    console.log(`[Research] Completed ${type} research`);

    // Parse and structure the response based on type
    let structuredData: any = {
      raw: researchResult,
      type,
      query,
      timestamp: new Date().toISOString(),
    };

    // Try to extract JSON if present in the response
    try {
      const jsonMatch = researchResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData.parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If no JSON, that's fine - we'll use the raw text
    }

    return NextResponse.json({
      success: true,
      data: structuredData,
      summary: researchResult,
      citations: perplexityResponse.citations || [],
    });

  } catch (error: any) {
    console.error('[Research] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Research failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
