# ZedCheckout AI Prompts

This directory contains all AI prompts for the ZedCheckout conversational checkout system, externalized from TypeScript files for better maintainability and iteration.

## Architecture

### Prompt Stack
- **Claude 3.5 Sonnet** (Anthropic): Main conversational agent - optimized for emotional intelligence, human-like responses, and natural conversation
- **Perplexity AI (Sonar)**: Research agent for real-time web information

This setup follows the research recommendation that Claude 3.5 Sonnet excels at human-realistic, empathetic conversations—critical for e-commerce conversions.

---

## File Structure

```
prompts/
├── chat-agent.fr-FR.md           # Main checkout agent (French)
├── chat-agent.en-EN.md           # Main checkout agent (English)
├── chat-lead.fr-FR.md            # Lead generation agent (French)
├── chat-lead.en-EN.md            # Lead generation agent (English)
├── research.fr-FR.md             # Research agent (French)
├── research.en-EN.md             # Research agent (English)
├── roleplay-character.fr-FR.md   # Character roleplay (French)
├── roleplay-character.en-EN.md   # Character roleplay (English)
├── ROLEPLAY_INTEGRATION.md       # Roleplay integration guide
└── README.md                     # This file
```

### Naming Convention

`<PROMPT_NAME>.<LOCALE>.<EXT>`

- **PROMPT_NAME**: `chat-agent`, `chat-lead`, `research`, `roleplay-character`
- **LOCALE**: `fr-FR` (French) or `en-EN` (English)
- **EXT**: `.md` (Markdown for readability and structure)

---

## Prompt Types

### 1. Chat Agent (`chat-agent`)
**Purpose:** Main conversational checkout agent for e-commerce transactions.

**Key Characteristics:**
- **Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Focus:** Convert conversations into completed transactions
- **Tone:** Warm, efficient, human-like (leveraging Claude's EQ strengths)
- **Tools:** Cart manipulation, customer info capture, checkout finalization

**API Route:** `/app/api/chat-ai/route.ts` (new mode)

**Input/Output:** JSON formatted
```json
{
  "messages": [
    {
      "text": "Your message here",
      "suggestedReplies": ["Option 1", "Option 2"]
    }
  ],
  "state": "discovery|product_selection|customization|checkout|completed",
  "confidence": "high|medium|low"
}
```

---

### 2. Chat Lead (`chat-lead`)
**Purpose:** Lead generation and qualification for ZedCheckout prospects.

**Key Characteristics:**
- **Model:** Claude 3.5 Haiku (claude-3-5-haiku-20241022) - faster, cost-effective for lead gen
- **Focus:** Qualify visitors, capture essential info naturally
- **Tone:** Professional, conversational, authentic
- **Features:** Troll detection, research integration, WhatsApp option

**API Route:** `/app/api/chat-ai/route.ts` (legacy mode)

**Input/Output:** JSON formatted
```json
{
  "message": "Your message here",
  "extractedData": {
    "website": "https://...",
    "firstName": "...",
    "platform": "Shopify",
    "challenge": "cart abandonment"
  },
  "isQualificationComplete": false,
  "confidence": 0.75,
  "needsResearch": false
}
```

---

### 3. Research (`research`)
**Purpose:** Real-time web research for business analysis and qualification.

**Key Characteristics:**
- **Model:** Perplexity AI (Sonar)
- **Focus:** Customer-first business analysis
- **Priority:** Understand BUSINESS → CUSTOMERS → TECH (in that order)
- **Use cases:** Website checks, platform compatibility, market info

**API Route:** `/app/api/research/route.ts`

**Input/Output:** JSON formatted
```json
{
  "success": true,
  "data": {
    "raw": "Full analysis text...",
    "type": "website_check",
    "timestamp": "2024-..."
  },
  "summary": "Structured analysis...",
  "citations": [...]
}
```

---

### 4. Roleplay Character (`roleplay-character`)
**Purpose:** Ultra-realistic WhatsApp-style character conversations.

**Key Characteristics:**
- **Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Focus:** Immersive, natural roleplay conversations with emotion/narration
- **Tone:** WhatsApp-like, spontaneous, authentic
- **Features:** Emotion tags, narration, character consistency, 10-25 word responses

**API Route:** `/app/api/chat-ai/route.ts` (roleplay mode)

**Input:** Dynamic character data from database
```typescript
{
  mode: 'roleplay',
  characterData: {
    name: 'Sophie',
    profile: 'Une barista parisienne de 25 ans',
    background: 'Sophie a grandi à Paris...',
    scenario: 'Tu entres dans le café...',
    dialogueSample: '"La même chose?" *sourit*'
  }
}
```

**Output:** Structured emotion + narration + dialogue
```json
{
  "emotion": "Happy",
  "narration": "smiles warmly",
  "dialogue": "Hey there!",
  "fullText": "[Happy]\n***smiles warmly***\nHey there!"
}
```

**See:** `ROLEPLAY_INTEGRATION.md` for full integration guide and `examples/RoleplayExample.tsx`

---

## Prompt Design Principles

### 1. Claude 3.5 Sonnet Strengths (Applied)

Based on industry research, Claude 3.5 Sonnet excels at:
- **Emotional Intelligence (EQ > IQ)**: Detects nuances, tone, emotional states
- **Human-like Conversation**: Avoids robotic phrases, feels authentic
- **Natural Warmth**: Less "corporate", more genuine

**How we leverage this:**
- Explicit emotional adaptation instructions
- Troll detection with intelligent, humorous responses
- Natural conversation flow over rigid scripts
- Empathy-first approach

### 2. JSON-First Architecture

All prompts enforce JSON input/output:
- **Structured data extraction**
- **Type-safe interfaces**
- **Easy integration with frontend**
- **Predictable error handling**

### 3. Localization

- **French (fr-FR)**: Natural tutoiement, warm but efficient
- **English (en-EN)**: Casual, professional, conversational

Both maintain the same structure and capabilities.

---

## Loading Prompts

### In Code

```typescript
import { loadPrompt, normalizeLocale } from '@/lib/prompt-loader';

// Load a prompt
const prompt = loadPrompt('chat-agent', 'fr-FR');

// Normalize locale from various inputs
const locale = normalizeLocale('fr'); // → 'fr-FR'
const locale2 = normalizeLocale('en-US'); // → 'en-EN'
```

### Caching

Prompts are cached in memory on first load:
- ✅ **No repeated file reads**
- ✅ **Fast runtime performance**
- ⚠️ **Restart required** after prompt updates (development)

---

## Editing Prompts

### Best Practices

1. **Test thoroughly** after changes
2. **Maintain JSON structure** requirements
3. **Keep tone consistent** across languages
4. **Preserve tool call instructions** (critical for functionality)
5. **Document significant changes** in git commits

### Prompt Sections

Each prompt file follows this structure:

```markdown
# Title

## IDENTITY & MISSION
## STYLE - HUMAN FIRST
## CONVERSATION MANAGEMENT
## AVAILABLE TOOLS (if applicable)
## EMOTIONAL ADAPTATION
## TROLL MANAGEMENT
## RESPONSE FORMAT (JSON)
## EXAMPLES
## KEY PRINCIPLES
```

---

## Research Insights (Why This Architecture)

From 2024-2025 industry benchmarks:

> **Claude 3.5 Sonnet** consistently scores higher on "EQ" (emotional intelligence), nuance, and human-like conversation—critical factors for sales and support where robotic responses kill conversion.

**Comparison:**
- **Claude 3.5 Sonnet**: 🏆 Best for human-realistic agents
- **GPT-4o**: Better for complex logic/math, but feels "corporate"
- **Llama 3.3 70B**: Cost-effective, but less consistent emotional warmth

**Our choice:**
- **Checkout Agent**: Sonnet (emotional intelligence crucial for conversion)
- **Lead Agent**: Haiku (faster, cheaper, good enough for qualification)
- **Research**: Perplexity (real-time web data)

---

## API Routes

### Chat AI (`/api/chat-ai`)

**Handles three modes:**
1. **Agent Mode**: Checkout agent (Sonnet) with tools
2. **Roleplay Mode**: Character conversations (Sonnet) with emotions
3. **Legacy Mode**: Lead generation (Haiku)

**Detection:**
```typescript
const isRoleplayMode = mode === 'roleplay' && characterData !== undefined;
const isLegacyMode = leadData !== undefined && clientContext === undefined;
```

### Research (`/api/research`)

**Purpose:** External research via Perplexity

**Types:**
- `website_check`: Analyze a website
- `platform_compatibility`: Check ZedCheckout compatibility
- `market_info`: E-commerce market data
- `technical_details`: Technical information
- `competitor_analysis`: Competitive landscape
- `pricing_research`: Market pricing

---

## Performance

### Token Usage

**Chat Agent (Sonnet):**
- Max tokens: 1024
- Temperature: 0.7
- Typical response: 100-300 tokens

**Lead Agent (Haiku):**
- Max tokens: 400
- Temperature: 0.5
- Typical response: 50-200 tokens

**Research (Perplexity):**
- Max tokens: 1000
- Temperature: 0.2
- Typical response: 200-800 tokens

### Costs (Approximate)

**Claude 3.5 Sonnet:**
- Input: $3/MTok
- Output: $15/MTok

**Claude 3.5 Haiku:**
- Input: $1/MTok
- Output: $5/MTok

**Perplexity Sonar:**
- ~$1-2/MTok (varies)

---

## Troubleshooting

### Prompt not loading

```bash
# Check file exists
ls -la prompts/

# Check file permissions
chmod 644 prompts/*.md

# Check path in error logs
# Prompts are loaded from: process.cwd() + '/prompts/'
```

### JSON parsing errors

- Check prompt file's JSON examples are valid
- Verify response format section is clear
- Test with smaller prompts first

### Locale issues

```typescript
// Debug locale normalization
console.log(normalizeLocale('fr')); // Should output: 'fr-FR'
console.log(normalizeLocale('en-US')); // Should output: 'en-EN'
```

---

## Future Improvements

### Planned

- [ ] **Prompt versioning**: Track prompt performance over time
- [ ] **A/B testing**: Compare prompt variations
- [ ] **Analytics integration**: Measure conversion impact
- [ ] **Multilingual expansion**: Add Spanish, German, Italian
- [ ] **Dynamic prompts**: Inject product catalog context

### Research

- [ ] **EVI (Empathic Voice Interface)**: Explore Hume AI for voice
- [ ] **Semantic memory**: Implement Zep/Mem0 for user memory
- [ ] **Fine-tuning**: Test Llama 3.3 70B fine-tuned on brand voice

---

## Contributing

When updating prompts:

1. **Branch**: Create a feature branch (`prompt/improve-checkout-agent`)
2. **Test**: Validate in development first
3. **Document**: Update this README if architecture changes
4. **Commit**: Clear commit message explaining the "why"
5. **Deploy**: Test in staging before production

---

## Resources

- [Anthropic Claude 3.5 Sonnet docs](https://docs.anthropic.com/claude/docs)
- [Perplexity AI API docs](https://docs.perplexity.ai/)
- [Cursor workspace]: `/Users/romainpiveteau/Projects/ZedTech/www.zedcheckout.com`

---

**Last updated:** December 2024  
**Maintained by:** ZedTech Team
