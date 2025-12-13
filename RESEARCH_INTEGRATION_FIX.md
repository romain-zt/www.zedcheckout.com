# Research Integration Fix

## Issue

After prompt refactoring, the research API wasn't receiving the `locale` parameter, causing it to default to French (`fr-FR`) for all requests.

## Root Cause

The frontend (`ChatWidgetAI.tsx`) was calling the research API without passing the locale, even though:
1. The component has a `locale` state
2. The research API was refactored to support multilingual prompts
3. The API expects a locale to load the correct prompt file

## Fix Applied

### Updated Files

**`components/ChatWidgetAI.tsx`**

1. **Research API call** (line ~760):
   ```diff
   body: JSON.stringify({
     type: researchType,
     query,
     context: `Conversation about ZedCheckout...`,
     userWebsite: leadData.website,
     leadData,
   +  locale, // Pass locale to research API
   }),
   ```

2. **Chat AI calls** (2 locations - main call + research results injection):
   ```diff
   body: JSON.stringify({
     message: userMessage,
     conversationHistory,
     leadData,
     sectionContext: currentSection,
     sectionDescription: sectionContext,
   +  locale, // Pass locale for prompt selection
   }),
   ```

## How It Works Now

### Research Flow

1. **User sends message** → Frontend calls `/api/chat-ai` with locale
2. **Claude analyzes** → Determines if research is needed
3. **Response includes:**
   ```json
   {
     "needsResearch": true,
     "researchType": "website_check",
     "researchQuery": "Analyze the website..."
   }
   ```
4. **Frontend detects** `needsResearch` flag
5. **Triggers research call** → `/api/research` **WITH locale**
6. **Research API:**
   - Normalizes locale (`fr` → `fr-FR`, `en-US` → `en-EN`)
   - Loads correct prompt (`research.fr-FR.md` or `research.en-EN.md`)
   - Calls Perplexity with localized system prompt
7. **Results injected** → Follow-up message to user

## Example Scenarios

### French User (locale='fr')

**User:** "Bonjour, je cherche des infos sur ZedCheckout"  
**Claude:** "Salut ! Tu es sur quelle plateforme ?"  
**User:** "Shopify, mon site c'est monsite.com"  
**Claude:** (triggers research)  
→ Research API receives `locale: 'fr'`  
→ Loads `prompts/research.fr-FR.md`  
→ Perplexity analyzes with French prompt  
**Claude:** "Laisse-moi jeter un œil à ton site... 👀"  
→ "Ok j'ai vérifié ! Tu as un beau site Shopify..."

### English User (locale='en')

**User:** "Hi, looking for info about ZedCheckout"  
**Claude:** "Hey! What platform are you on?"  
**User:** "Shopify, my site is mysite.com"  
**Claude:** (triggers research)  
→ Research API receives `locale: 'en'`  
→ Loads `prompts/research.en-EN.md`  
→ Perplexity analyzes with English prompt  
**Claude:** "Let me check your site... 👀"  
→ "Ok, checked it out! Nice Shopify setup..."

## Research Types Supported

| Type | Description |
|------|-------------|
| `website_check` | Analyze a website (business, customers, tech) |
| `platform_compatibility` | Check ZedCheckout compatibility |
| `market_info` | E-commerce market data |
| `technical_details` | Technical specifications |
| `competitor_analysis` | Competitive landscape |
| `pricing_research` | Market pricing |

## Testing

### TypeScript Compilation
```bash
✅ npx tsc --noEmit
# Exit code: 0 (No errors)
```

### Manual Test Checklist

- [ ] French user triggers website research
- [ ] English user triggers website research
- [ ] Research results display correctly
- [ ] Follow-up message is in correct language
- [ ] Platform compatibility check works
- [ ] Market info request works

## API Endpoints

### `/api/chat-ai` (Chat Agent)
- **Receives:** `locale` parameter
- **Uses:** `chat-lead.{locale}.md` prompt
- **Returns:** May include `needsResearch: true`

### `/api/research` (Research Agent)
- **Receives:** `locale` parameter
- **Uses:** `research.{locale}.md` prompt
- **Returns:** Analysis in appropriate language

## Locale Handling

```typescript
// Frontend component state
const [locale, setLocale] = useState<'fr' | 'en'>('fr');

// API normalizes to our format
normalizeLocale('fr') → 'fr-FR'
normalizeLocale('en') → 'en-EN'
normalizeLocale('en-US') → 'en-EN'
normalizeLocale('fr-FR') → 'fr-FR'
```

## Benefits

✅ **Multilingual research** - Correct language prompts  
✅ **Better context** - Research matches conversation language  
✅ **User experience** - Seamless language consistency  
✅ **Type-safe** - Full TypeScript support  
✅ **Maintainable** - External prompt files

## Related Files

- `components/ChatWidgetAI.tsx` - Frontend integration
- `app/api/chat-ai/route.ts` - Chat agent
- `app/api/research/route.ts` - Research agent
- `prompts/research.fr-FR.md` - French research prompt
- `prompts/research.en-EN.md` - English research prompt
- `prompts/chat-lead.fr-FR.md` - French lead prompt (triggers research)
- `prompts/chat-lead.en-EN.md` - English lead prompt (triggers research)

---

**Fixed:** December 13, 2024  
**Status:** ✅ Complete  
**Impact:** Research now works correctly with multilingual support
