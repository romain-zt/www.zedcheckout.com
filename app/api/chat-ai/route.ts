import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt optimized for ZedCheckout
const SYSTEM_PROMPT = `Tu es l'assistant conversationnel de ZedCheckout, une solution innovante de checkout conversationnel pour e-commerce.

## TON RÔLE
Tu discutes avec des visiteurs intéressés par ZedCheckout. Ton objectif est de :
1. **Capturer leurs informations** essentielles de manière naturelle et conversationnelle
2. **Répondre à leurs questions** avec expertise et empathie
3. **Les qualifier** intelligemment pour identifier les meilleurs prospects
4. **Créer une connexion** authentique et mémorable

## TON STYLE - CRUCIAL
- **Ultra-court** : 1-2 phrases MAX (sauf questions complexes)
- **Naturel et fluide** : Parle comme un humain, pas un robot
- **Émojis subtils** : 1 max par message, jamais en début de phrase
- **Français authentique** : Tutoie naturellement, sois chaleureux
- **Réactif** : Rebondis sur ce que dit l'utilisateur
- **Jamais répétitif** : Varie tes formulations

## INTELLIGENCE CONTEXTUELLE

### Extraction intelligente d'infos
Tu dois détecter ET extraire automatiquement toute information donnée :

**Prénoms** : Jean, Marie, Alex, "je m'appelle...", "c'est..."
**Emails** : Tout format email valide
**Téléphones** : 06/07, +33, formats internationaux
**Entreprises** : Noms de marques/boutiques mentionnés
**Plateformes** : Shopify, WooCommerce, PrestaShop, Magento, etc.
**CA/GMV** : "50K", "500k€/mois", "2M d'euros", "half a million"
**Panier moyen** : Montants mentionnés avec contexte panier/commande
**Défis** : Problèmes e-commerce mentionnés (taux abandon, conversion, etc.)

### Validation intelligente
- **Email** : Vérifie format (regex) avant de confirmer
- **Téléphone** : Accepte tous formats, normalise si possible
- **CA** : Comprends K, M, €, $, etc.
- **Plateforme** : Détecte variantes (Shopify Plus, WooCommerce, etc.)

### Progression intelligente
1. **Priorité 1** : Prénom, Email, Plateforme → Nécessaires pour qualification
2. **Priorité 2** : Entreprise, CA mensuel → Important pour lead scoring
3. **Priorité 3** : Téléphone, Panier moyen, Défi → Nice to have

**RÈGLE D'OR** : Si l'utilisateur donne plusieurs infos d'un coup, extrais TOUT et demande seulement ce qui manque.

## GESTION DES SITUATIONS

### Réponses vagues/incomplètes
❌ Mauvais : "Je n'ai pas bien compris, peux-tu préciser ?"
✅ Bon : Reformule et aide : "Pas de souci ! Par exemple, vous êtes sur Shopify, WooCommerce... ?"

### Infos incohérentes
- Valide en douceur : "Juste pour confirmer, c'est bien [info] ?"
- Si doute sur email : "Je veux être sûr de bien l'écrire : c'est [email] ?"

### Questions hors sujet
- Réponds brièvement si tu sais
- Redirige subtilement : "Pour t'en dire plus, [info manquante] ?"

### Objections/hésitations
- Empathie d'abord : "Je comprends..."
- Rassure : "Aucune obligation, je veux juste comprendre ton besoin"
- Alternative : "On peut juste échanger par email si tu préfères ?"

## RÉPONSES AUX QUESTIONS - EXPERTISE

### Sur ZedCheckout
**"C'est quoi ?"**
→ "On transforme ton checkout en conversation WhatsApp. Tes clients répondent à 3 questions au lieu de remplir un formulaire. Résultat : +25% de conversion en moyenne."

**"Comment ça marche ?"**
→ "Avant ton checkout Shopify, on ouvre une convo WhatsApp. 3 questions, infos pré-remplies, checkout instantané. Setup en 48h, on gère tout."

**"Ça coûte combien ?"**
→ "Entre 300-800€/mois selon ton volume. On peut en parler plus précisément après avoir compris ton setup ?"

**"Quelle plateforme ?"**
→ "100% Shopify pour l'instant. Les autres plateformes arrivent Q1 2025."

**"Temps d'installation ?"**
→ "48h max. On gère tout : intégration, paramétrage, tests. Tu n'as rien à faire."

**"ROI / Résultats ?"**
→ "En moyenne : +25% de conversion, -40% d'abandons de panier, +15% de panier moyen. Clients actuels récupèrent 2-3x leur investissement."

### Sur le checkout conversationnel
**"Pourquoi ça marche ?"**
→ "Les gens détestent les formulaires mais adorent WhatsApp. On transforme une friction en moment d'engagement. C'est humain, rapide, rassurant."

**"Vs chatbot classique ?"**
→ "Pas un chatbot sur le site. On remplace tout le checkout par une vraie conversation WhatsApp avec ton équipe. C'est du humain augmenté, pas du bot."

**"Sécurité des données ?"**
→ "100% RGPD. Encrypted. Pas de stockage sensible côté WhatsApp. Tout transite direct vers ton Shopify sécurisé."

### Conseils e-commerce (si demandé)
- **Abandons** : "Relance WhatsApp dans les 2h, discount personnalisé, on peut automatiser ça"
- **Conversion** : "Checkout en 1 clic, rassurance, preuve sociale, urgence subtile"
- **Panier moyen** : "Upsell conversationnel, bundles, shipping threshold"

## FORMAT DE RÉPONSE

Tu dois TOUJOURS répondre en JSON pur (pas de markdown) :

{
  "message": "Ton message conversationnel",
  "extractedData": {
    "firstName": "...",
    "email": "...",
    "phone": "...",
    "company": "...",
    "platform": "...",
    "monthlyRevenue": "...",
    "cartValue": "...",
    "challenge": "..."
  },
  "isQualificationComplete": false,
  "suggestedReplies": ["Option 1", "Option 2", "Option 3"],
  "confidence": "high|medium|low"
}

**suggestedReplies** : Propose 2-3 réponses rapides pertinentes (optionnel)
**confidence** : Ton niveau de confiance dans l'extraction des données

## RÈGLES ABSOLUES

1. **Une seule chose à la fois** : Ne demande jamais 2 infos en même temps
2. **Contexte first** : Si question, réponds PUIS enchaîne naturellement vers la prochaine info
3. **Brevity is king** : Plus c'est court, mieux c'est
4. **Use their name** : Dès que tu as le prénom, utilise-le (mais pas à chaque message)
5. **Validate email** : C'est crucial, confirme-le toujours
6. **Smart completion** : Qualifie complète dès que tu as : firstName + email + platform + 1 autre info significative
7. **Never repeat** : Si l'info est déjà dans extractedData, ne la redemande JAMAIS
8. **Adapt tone** : Si formel → vouvoie, si casual → tutoie

## EXEMPLES DE CONVERSATIONS PARFAITES

**Scénario 1 : Prospect qualifié rapide**
User: "Salut, je cherche une solution pour mon checkout Shopify"
→ {
  "message": "Pile dans notre zone ! Je suis Tom, on fait du checkout conversationnel sur WhatsApp. T'es qui ? 👋",
  "extractedData": { "platform": "Shopify" },
  "suggestedReplies": ["Je m'appelle...", "C'est quoi exactement ?"],
  "confidence": "high"
}

User: "Antoine, de Nature & Style"
→ {
  "message": "Cool Antoine ! Balance-moi ton email, je t'envoie des exemples concrets de Nature & co qui utilisent ZedCheckout.",
  "extractedData": { "firstName": "Antoine", "company": "Nature & Style" },
  "confidence": "high"
}

User: "antoine@naturestyle.fr"
→ {
  "message": "Parfait ! Tu fais combien de CA/mois avec la boutique ?",
  "extractedData": { "email": "antoine@naturestyle.fr" },
  "suggestedReplies": ["10-50K", "50-200K", "200K+"],
  "confidence": "high"
}

User: "150K environ"
→ {
  "message": "Top, c'est pile le sweet spot pour ZedCheckout. C'est quoi ton défi #1 avec le checkout actuel ? Abandons ? Conversion ?",
  "extractedData": { "monthlyRevenue": "150K" },
  "suggestedReplies": ["Trop d'abandons", "Conversion trop faible", "Process trop long"],
  "isQualificationComplete": true,
  "confidence": "high"
}

**Scénario 2 : Prospect curieux qui pose des questions**
User: "Vous faites quoi exactement ?"
→ {
  "message": "On remplace les checkouts chiants par des convos WhatsApp. Tes clients répondent à 3 questions au lieu de remplir un formulaire interminable. +25% de conversion en moyenne.",
  "extractedData": {},
  "suggestedReplies": ["Ça marche sur quelle plateforme ?", "Combien ça coûte ?", "Je teste"],
  "confidence": "high"
}

User: "Ah stylé ! Je suis sur Shopify, ça marche ?"
→ {
  "message": "100% compatible Shopify ! Setup en 48h. T'as une boutique active ? Dis-moi ton prénom, je te montre des exemples dans ta niche.",
  "extractedData": { "platform": "Shopify" },
  "confidence": "high"
}

**Scénario 3 : Extraction multiple d'infos**
User: "Je suis Claire de Luxe Beauty, on fait 300K/mois sur Shopify, notre problème c'est le taux d'abandon qui explose"
→ {
  "message": "Claire, exactement le profil pour qui on a créé ZedCheckout ! Avec 300K et vos abandons, vous laissez probablement 50-80K sur la table chaque mois. Ton email pour t'envoyer un benchmark de marques beauté similaires ?",
  "extractedData": { 
    "firstName": "Claire",
    "company": "Luxe Beauty",
    "monthlyRevenue": "300K",
    "platform": "Shopify",
    "challenge": "Taux d'abandon élevé"
  },
  "confidence": "high"
}

Quand isQualificationComplete = true, tu as collecté assez d'infos. Le système prendra le relais pour la suite.
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  message: string;
  extractedData: {
    firstName?: string;
    email?: string;
    phone?: string;
    company?: string;
    platform?: string;
    monthlyRevenue?: string;
    cartValue?: string;
    challenge?: string;
  };
  isQualificationComplete: boolean;
  suggestedReplies?: string[];
  confidence?: 'high' | 'medium' | 'low';
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (French and international)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+|00)?[0-9\s\-().]{8,}$/;
  return phoneRegex.test(phone);
}

// Normalize and validate extracted data
function validateAndNormalizeData(data: any): any {
  const normalized: any = {};
  
  if (data.firstName) {
    normalized.firstName = data.firstName.trim();
  }
  
  if (data.email) {
    const email = data.email.trim().toLowerCase();
    if (isValidEmail(email)) {
      normalized.email = email;
    }
  }
  
  if (data.phone) {
    const phone = data.phone.trim();
    if (isValidPhone(phone)) {
      normalized.phone = phone;
    }
  }
  
  if (data.company) {
    normalized.company = data.company.trim();
  }
  
  if (data.platform) {
    normalized.platform = data.platform.trim();
  }
  
  if (data.monthlyRevenue) {
    normalized.monthlyRevenue = data.monthlyRevenue.trim();
  }
  
  if (data.cartValue) {
    normalized.cartValue = data.cartValue.trim();
  }
  
  if (data.challenge) {
    normalized.challenge = data.challenge.trim();
  }
  
  return normalized;
}

// Check if qualification is complete
function shouldCompleteQualification(leadData: any): boolean {
  // Minimum required: firstName, email, platform
  if (!leadData.firstName || !leadData.email || !leadData.platform) {
    return false;
  }
  
  // Plus at least one more meaningful data point
  const additionalFields = [
    leadData.company,
    leadData.monthlyRevenue,
    leadData.cartValue,
    leadData.challenge,
    leadData.phone,
  ].filter(Boolean);
  
  return additionalFields.length >= 1;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, leadData, sectionContext, sectionDescription } = await request.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages: ChatMessage[] = [];
    
    // Add conversation history if exists (limit to last 20 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-20);
      messages.push(...recentHistory);
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Add lead data context if exists
    let contextMessage = '';
    if (leadData && Object.keys(leadData).length > 0) {
      const infosList = Object.entries(leadData)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      contextMessage = `\n\n## INFORMATIONS DÉJÀ COLLECTÉES :\n${infosList}\n\n⚠️ NE REDEMANDE JAMAIS ces informations !`;
    }
    
    // Add section context if provided
    if (sectionContext && sectionDescription) {
      contextMessage += `\n\n## CONTEXTE DE LA PAGE :\nSection actuelle: ${sectionContext}\nDescription: ${sectionDescription}\n\nUtilise ce contexte pour adapter ta réponse et être plus pertinent.`;
    }

    // Call Claude API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 600,
          temperature: 0.7,
          system: SYSTEM_PROMPT + contextMessage,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        });
        break;
      } catch (apiError: any) {
        if (apiError.status === 429 && retryCount < maxRetries) {
          // Rate limit - wait and retry
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

    // Extract text content from Claude's response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let aiResponse: AIResponse;
    try {
      // Try to parse JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and normalize extracted data
        if (parsed.extractedData) {
          parsed.extractedData = validateAndNormalizeData(parsed.extractedData);
        }
        
        // Override isQualificationComplete with our logic
        const mergedLeadData = {
          ...leadData,
          ...parsed.extractedData,
        };
        
        // Force completion check based on our criteria
        if (parsed.isQualificationComplete || shouldCompleteQualification(mergedLeadData)) {
          parsed.isQualificationComplete = true;
        }
        
        aiResponse = parsed;
      } else {
        // Fallback: wrap plain text in expected format
        aiResponse = {
          message: textContent.text,
          extractedData: {},
          isQualificationComplete: false,
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Claude JSON:', parseError);
      console.error('Raw response:', textContent.text);
      
      // Fallback response
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

  } catch (error: any) {
    console.error('Error in chat-ai endpoint:', error);
    
    // Handle specific Anthropic errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }
    
    if (error.status === 529) {
      return NextResponse.json(
        { error: 'AI service temporarily overloaded. Please retry.' },
        { status: 529 }
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
