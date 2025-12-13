import { NextRequest, NextResponse } from 'next/server';
import { loadPrompt, normalizeLocale, type Locale } from '@/lib/prompt-loader';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';

// Cache prompts in memory
let CACHED_RESEARCH_PROMPTS: Record<string, string> = {};

function getResearchSystemPrompt(locale: Locale): string {
  if (!CACHED_RESEARCH_PROMPTS[locale]) {
    CACHED_RESEARCH_PROMPTS[locale] = loadPrompt('research', locale);
  }
  return CACHED_RESEARCH_PROMPTS[locale];
}

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
  locale?: string;            // Locale for the research (fr-FR, en-EN)
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
      return `🔍 VISIT AND ANALYZE: ${userWebsite || 'mentioned'}

⚠️ CRITICAL INSTRUCTIONS:
1. **VISIT THE ACTUAL WEBSITE** - Don't just search about it, GO TO IT
2. Access the homepage and read the real content
3. Look at navigation menus, product categories, about page
4. If the site redirects (e.g., to www version), follow it
5. DO NOT make assumptions based on domain name alone

BUSINESS ANALYSIS (Priority 1):
1. What does this business ACTUALLY sell? (Be specific - don't guess)
   - Exact products/services listed on the site
   - Industry: beauty/wellness, fashion, home goods, food, services, etc.
   - B2C, B2B, or both?
2. Who are their target customers?
   - Demographics, needs, pain points
3. What is their unique value proposition?
   - What makes them different?
   - What problem do they solve?
4. Main product/service categories visible on the site

TECHNICAL SETUP (Priority 2):
5. Website accessibility (does it work?)
6. E-commerce platform (Shopify, WooCommerce, PrestaShop, custom, etc.)
7. Professional vs basic setup
8. Customer experience quality (navigation, checkout flow)

Context: ${context}
Query: ${query}

⚠️ VALIDATION CHECKLIST:
- [ ] Did you actually visit the site?
- [ ] Did you read real product names/categories?
- [ ] Did you check the About section?
- [ ] Are you being specific (not generic)?

IMPORTANT: A beauty salon is NOT home decor. A wellness spa is NOT fashion. Read the ACTUAL content!

Provide a detailed, factual analysis based on what you SEE on the site.`;

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
// DIRECT WEBSITE DETECTION (Fallback when Perplexity can't access)
// ============================================================================

interface WebsiteDetectionResult {
  accessible: boolean;
  platform?: string;
  shopifyId?: string;
  redirectUrl?: string;
  error?: string;
}

async function detectWebsiteDirect(url: string): Promise<WebsiteDetectionResult> {
  // Normalize URL and generate variants to try
  let baseUrl = url.trim();
  
  // Remove protocol if present
  baseUrl = baseUrl.replace(/^https?:\/\//, '');
  
  // Generate URL variants to try (in priority order)
  const urlVariants = [
    `https://www.${baseUrl.replace(/^www\./, '')}`, // Try with www first (most common)
    `https://${baseUrl.replace(/^www\./, '')}`,     // Try without www
    `http://www.${baseUrl.replace(/^www\./, '')}`,  // Fallback to http with www
    `http://${baseUrl.replace(/^www\./, '')}`,      // Fallback to http without www
  ];

  console.log(`[Research] Trying URL variants for ${url}:`, urlVariants);

  // Try each variant until one works
  for (const testUrl of urlVariants) {
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        redirect: 'follow', // FOLLOW redirects automatically
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZedCheckout/1.0; +https://zedcheckout.com)',
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      if (response.ok) {
        console.log(`[Research] ✅ Success with ${testUrl}`);
        
        const result: WebsiteDetectionResult = {
          accessible: true,
          redirectUrl: response.url !== testUrl ? response.url : undefined,
        };

        // Detect Shopify
        if (headers['x-shopid'] || headers['x-sorting-hat-shopid']) {
          result.platform = 'Shopify';
          result.shopifyId = headers['x-shopid'] || headers['x-sorting-hat-shopid'];
        }

        return result;
      }

    } catch (error) {
      // Continue to next variant
      console.log(`[Research] ❌ Failed with ${testUrl}:`, error instanceof Error ? error.message : 'Unknown error');
      continue;
    }
  }

  // All variants failed
  return {
    accessible: false,
    error: 'All URL variants failed to connect',
  };
}

// ============================================================================
// PERPLEXITY API CALL
// ============================================================================

async function callPerplexity(query: string, locale: Locale = 'fr-FR'): Promise<any> {
  // Load the research system prompt for the appropriate locale
  const systemPrompt = getResearchSystemPrompt(locale);
  
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
          content: systemPrompt
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
    const { type, query, context, userWebsite, leadData, locale: requestLocale } = body;
    
    // Normalize locale
    const locale = normalizeLocale(requestLocale);

    // Validate request
    if (!type || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing type or query' },
        { status: 400 }
      );
    }

    console.log(`[Research] Starting ${type} research (${locale}):`, query);

    // 🔥 NEW: Direct website detection for website_check
    let directDetection: WebsiteDetectionResult | null = null;
    if (type === 'website_check' && userWebsite) {
      console.log(`[Research] Attempting direct detection for ${userWebsite}`);
      directDetection = await detectWebsiteDirect(userWebsite);
      console.log(`[Research] Direct detection result:`, directDetection);
    }

    // Build Perplexity query (enriched with direct detection if available)
    let perplexityQuery = buildPerplexityQuery(body);
    
    // Enrich query with direct detection results
    if (directDetection && directDetection.accessible) {
      const finalUrl = directDetection.redirectUrl || userWebsite;
      
      const detectionInfo = [
        `\n\n[TECHNICAL INFO DETECTED]:`,
        `- Site accessible: ✅ YES`,
        `- Working URL: ${finalUrl}`,
        directDetection.platform ? `- Platform: ${directDetection.platform}` : null,
        directDetection.shopifyId ? `- Shopify ID: ${directDetection.shopifyId}` : null,
      ].filter(Boolean).join('\n');
      
      perplexityQuery += detectionInfo;
      perplexityQuery += `\n\n⚠️ IMPORTANT: The working URL is ${finalUrl} - USE THIS URL to visit and analyze the site.
      
Visit ${finalUrl} RIGHT NOW and read the ACTUAL content (homepage, products, about page, categories).`;
    } else if (directDetection && !directDetection.accessible) {
      perplexityQuery += `\n\n[TECHNICAL INFO]: Direct connection to ${userWebsite} failed. Try to find information about this business through other means (search, public records, etc.).`;
    }

    // Call Perplexity with locale
    const perplexityResponse = await callPerplexity(perplexityQuery, locale);

    // Extract the response content
    let researchResult = perplexityResponse.choices?.[0]?.message?.content || '';

    // 🔥 FALLBACK: If Perplexity fails to provide useful info and we have direct detection
    if (directDetection && directDetection.accessible && type === 'website_check') {
      // Check if Perplexity response is too generic or says it can't access
      const isGenericResponse = 
        researchResult.includes('Impossible à déterminer') ||
        researchResult.includes('Non identifiable') ||
        researchResult.includes('Cannot determine') ||
        researchResult.includes('Unable to access') ||
        researchResult.length < 200;

      if (isGenericResponse) {
        console.log(`[Research] Perplexity response too generic, using direct detection fallback`);
        
        const finalUrl = directDetection.redirectUrl || userWebsite;
        
        // Generate a better response based on direct detection
        const fallbackResponse = `## ANALYSE TECHNIQUE (Détection Directe)

**Accessibilité :** ✅ Site accessible et fonctionnel
**URL vérifiée :** ${finalUrl}
${directDetection.platform ? `**Plateforme e-commerce :** ${directDetection.platform}` : ''}
${directDetection.shopifyId ? `**Shopify Store ID :** ${directDetection.shopifyId}` : ''}

## COMPATIBILITÉ ZEDCHECKOUT

${directDetection.platform === 'Shopify' ? `
✅ **Excellente compatibilité** - Shopify est pleinement supporté par ZedCheckout

**Intégration estimée :** 2-3 jours ouvrés
**Support API :** Complet (Storefront API, Admin API, Webhooks)
**Complexité :** Faible - Intégration standard

**Avantages pour ce site :**
- Checkout conversationnel peut remplacer le checkout Shopify standard
- Réduction estimée d'abandons de panier : -25 à -35%
- Support natif des produits, variantes, et inventaire
- Webhooks pour synchronisation en temps réel
` : `
**Plateforme détectée :** ${directDetection.platform || 'Non identifiée'}
**Statut de compatibilité :** À vérifier

Le site est accessible et fonctionnel. Pour une analyse complète, une visite manuelle est recommandée.
`}

## 💡 INSIGHTS POUR L'AI

**Accroches à utiliser :**
${directDetection.platform === 'Shopify' 
  ? `- "Super, je vois que tu es sur Shopify ! 🎉 C'est la plateforme qu'on supporte le mieux."
- "Shopify + ZedCheckout, c'est une intégration ultra rapide - 2-3 jours max."
- "Ton checkout Shopify actuel, tu as combien d'abandons de panier ?"` 
  : `- "J'ai vérifié, ton site est bien en ligne et fonctionnel ✅"
- "Peux-tu me parler un peu de ton business ? Qu'est-ce que tu vends exactement ?"`
}

**Questions pertinentes à poser :**
- "Quel est ton principal défi actuellement avec ton checkout ?"
- "Tu as une idée de ton taux d'abandon de panier ?"
- "Combien de commandes tu traites par mois environ ?"

**Prochaines étapes recommandées :**
1. Comprendre le business exact (produits/services vendus)
2. Identifier les pain points checkout actuels
3. Estimer le volume de transactions
4. Qualifier l'intérêt et l'urgence

---

**Note :** L'analyse complète du business nécessite de visiter le site manuellement. Les infos ci-dessus sont basées sur la détection technique automatique.`;

        researchResult = fallbackResponse;
      }
    }

    console.log(`[Research] Completed ${type} research`);

    // Parse and structure the response based on type
    let structuredData: any = {
      raw: researchResult,
      type,
      query,
      timestamp: new Date().toISOString(),
      directDetection: directDetection || undefined,
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
