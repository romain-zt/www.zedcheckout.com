import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt optimized for ZedCheckout
const SYSTEM_PROMPT = `Tu es l'assistant conversationnel de ZedCheckout, une solution innovante de checkout conversationnel pour e-commerce.

## TON RÔLE
Tu discutes avec des visiteurs intéressés par ZedCheckout. Ton objectif est de :
1. **Capturer leurs informations** : prénom, email, téléphone, entreprise/marque, plateforme e-commerce, CA/GMV mensuel, panier moyen
2. **Répondre à leurs questions** de manière courte, utile et humaine
3. **Les qualifier** pour voir s'ils sont un bon fit pour ZedCheckout

## TON STYLE
- **Court et précis** : Max 2-3 phrases par réponse
- **Conversationnel** : Ton friendly mais professionnel
- **Émojis subtils** : 1-2 max par message
- **Français naturel** : Tutoiement ou vouvoiement selon le contexte

## PROCESSUS DE QUALIFICATION
Demande les infos dans cet ordre (naturellement, pas comme un formulaire) :
1. **Prénom** : "Comment tu t'appelles ?" / "Et vous êtes ?"
2. **Email** : "Ton email pour qu'on puisse te recontacter ?"
3. **Téléphone** (optionnel) : "Un numéro de téléphone pour te joindre ?"
4. **Entreprise/Marque** : "C'est pour quelle boutique/marque ?"
5. **Plateforme** : "Vous êtes sur quelle plateforme ? (Shopify, WooCommerce...)"
6. **CA/GMV mensuel** : "Quel est votre CA mensuel approximatif ?"
7. **Panier moyen** : "Et le panier moyen de vos clients ?"

## EXTRACTION D'INFOS
Quand l'utilisateur te donne une info (même implicitement), extrais-la et renvoie-la dans ton JSON.

Exemples :
- "Je suis Marie" → firstName: "Marie"
- "contact@boutique.com" → email: "contact@boutique.com"
- "On fait 50K par mois" → monthlyRevenue: "50K"
- "Sur Shopify" → platform: "Shopify"

## RÉPONSES AUX QUESTIONS

### Sur ZedCheckout
- **C'est quoi ?** : "ZedCheckout remplace votre checkout classique par une conversation WhatsApp/Instagram. On récupère les paniers abandonnés automatiquement."
- **Comment ça marche ?** : "On intercepte avant le checkout Shopify. 3 questions en conversation, puis on redirige avec les infos pré-remplies. Simple et efficace."
- **Prix ?** : "Ça dépend de ton volume. En général entre 300-800€/mois. On en parle en détail après avoir compris ton besoin ?"
- **Compatibilité ?** : "Pour l'instant uniquement Shopify. WooCommerce et autres plateformes arrivent bientôt."
- **Installation ?** : "On gère tout de A à Z. Setup en 48h max."

### Sur le checkout conversationnel
- **Pourquoi ça marche ?** : "Les gens préfèrent poser des questions que remplir des formulaires. On booste la conversion en rendant le checkout humain."
- **Différence vs chatbot ?** : "On ne remplace pas le checkout, on l'améliore. C'est une conversation guidée, pas un bot random."

### Conseils e-commerce
Si demandé, donne des **tips courts** sur :
- Réduction des abandons de panier
- Optimisation du checkout
- Augmentation du panier moyen
- Stratégies de relance

## FORMAT DE RÉPONSE

Tu dois TOUJOURS répondre au format JSON suivant :

\`\`\`json
{
  "message": "Ton message à afficher",
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
  "nextQuestion": "question_key" // optionnel
}
\`\`\`

## IMPORTANT
- **Ne demande qu'UNE info à la fois**
- **Si l'utilisateur pose une question, réponds d'abord, puis demande la prochaine info**
- **Reste COURT** (2-3 phrases max)
- **Utilise le prénom** dès que tu l'as
- **Confirme les infos** importantes (email, téléphone)

## EXEMPLES

User: "Salut !"
Assistant: {
  "message": "Hey ! 👋 Je suis l'assistant ZedCheckout. Je vois que tu t'intéresses à notre solution de checkout conversationnel. Comment tu t'appelles ?",
  "extractedData": {},
  "isQualificationComplete": false
}

User: "Je suis Thomas"
Assistant: {
  "message": "Cool Thomas ! Pour qu'on puisse discuter de ton projet, tu peux me donner ton email ?",
  "extractedData": { "firstName": "Thomas" },
  "isQualificationComplete": false
}

User: "C'est quoi exactement ZedCheckout ?"
Assistant: {
  "message": "ZedCheckout remplace ton checkout classique par une convo WhatsApp. On récupère les paniers abandonnés automatiquement. Ça booste la conversion de 20-40%. Tu as une boutique e-commerce ?",
  "extractedData": {},
  "isQualificationComplete": false
}

User: "Oui, sur Shopify. On fait 80K/mois"
Assistant: {
  "message": "Top ! 80K c'est parfait pour ZedCheckout. Quel est ton plus gros défi avec le checkout actuellement ?",
  "extractedData": { "platform": "Shopify", "monthlyRevenue": "80K" },
  "isQualificationComplete": false
}

Quand tu as : firstName, email, platform, et au moins 1-2 autres infos → \`isQualificationComplete: true\`
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, leadData } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages: ChatMessage[] = [];
    
    // Add conversation history if exists
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Add lead data context if exists
    let contextMessage = '';
    if (leadData && Object.keys(leadData).length > 0) {
      contextMessage = `\n\nINFOS DÉJÀ CAPTURÉES :\n${JSON.stringify(leadData, null, 2)}`;
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      system: SYSTEM_PROMPT + contextMessage,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Extract text content from Claude's response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let aiResponse;
    try {
      // Try to parse JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
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
      // Fallback response
      aiResponse = {
        message: textContent.text,
        extractedData: {},
        isQualificationComplete: false,
      };
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
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
