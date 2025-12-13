# Prompt System - Quick Reference

## 📁 File Structure

```
prompts/
├── chat-agent.fr-FR.md    # Checkout agent (FR) - Sonnet
├── chat-agent.en-EN.md    # Checkout agent (EN) - Sonnet
├── chat-lead.fr-FR.md     # Lead generation (FR) - Haiku
├── chat-lead.en-EN.md     # Lead generation (EN) - Haiku
├── research.fr-FR.md      # Research (FR) - Perplexity
└── research.en-EN.md      # Research (EN) - Perplexity
```

---

## 🎯 Usage in Code

```typescript
import { loadPrompt, normalizeLocale } from '@/lib/prompt-loader';

// Load a prompt
const prompt = loadPrompt('chat-agent', 'fr-FR');

// Normalize locale
const locale = normalizeLocale('fr'); // → 'fr-FR'
```

---

## 🤖 Models Used

| Prompt Type | Model | Why |
|-------------|-------|-----|
| `chat-agent` | Claude 3.5 Sonnet | Best EQ for conversions |
| `chat-lead` | Claude 3.5 Haiku | Fast & cost-effective |
| `research` | Perplexity Sonar | Real-time web data |

---

## ✏️ Editing Prompts

1. **Edit:** `prompts/chat-agent.fr-FR.md`
2. **Restart:** Dev server (for cache refresh)
3. **Test:** Browser / API
4. **Commit:** `git commit -m "improve: chat-agent prompt for X"`

---

## 📊 JSON Response Formats

### Chat Agent

```json
{
  "messages": [{ "text": "...", "suggestedReplies": [...] }],
  "state": "discovery|product_selection|checkout|...",
  "confidence": "high|medium|low"
}
```

### Lead Agent

```json
{
  "message": "...",
  "extractedData": { "platform": "...", "website": "..." },
  "confidence": 0.75,
  "needsResearch": false
}
```

### Research

```json
{
  "success": true,
  "summary": "Analysis text...",
  "data": { "type": "website_check", "timestamp": "..." }
}
```

---

## 🔍 API Endpoints

| Endpoint | Prompt | Model |
|----------|--------|-------|
| `/api/chat-ai` (new) | `chat-agent` | Sonnet |
| `/api/chat-ai` (legacy) | `chat-lead` | Haiku |
| `/api/research` | `research` | Perplexity |

---

## 🚀 Key Features

### Chat Agent
- ✅ Cart manipulation tools
- ✅ Emotional adaptation
- ✅ Troll detection & handling
- ✅ Multi-phase checkout flow

### Lead Agent
- ✅ Natural qualification
- ✅ Research integration
- ✅ WhatsApp option
- ✅ Data extraction

### Research
- ✅ Customer-first analysis
- ✅ Website verification
- ✅ Platform compatibility
- ✅ Market information

---

## 🎨 Tone Guidelines

### French (fr-FR)
- Tutoiement naturel
- Chaleureux mais efficace
- Émojis subtils (1 max)
- 2-3 phrases par message

### English (en-EN)
- Casual, conversational
- Warm but efficient
- Subtle emojis (1 max)
- 2-3 sentences per message

---

## 🐛 Troubleshooting

### Prompt not loading
```bash
# Check file exists
ls prompts/

# Check logs
# Look for: "[PromptLoader] Failed to load prompt"
```

### Locale issues
```typescript
// Debug
console.log(normalizeLocale('en-US')); // Should: 'en-EN'
console.log(normalizeLocale('fr')); // Should: 'fr-FR'
```

### Cache issues
**Solution:** Restart dev server

---

## 📚 Documentation

- **Full docs:** `prompts/README.md` (358 lines)
- **Summary:** `PROMPT_REFACTORING_SUMMARY.md`
- **This file:** Quick reference

---

## ⚡ Performance

- **First load:** ~2-5ms (read + cache)
- **Subsequent:** <0.1ms (memory cache)
- **Impact:** Negligible on API response

---

## 🔄 Updating

**Before deploy:**
1. Edit prompt file
2. Test locally
3. Check TypeScript: `npx tsc --noEmit`
4. Commit changes

**Deploy checklist:**
- [ ] TypeScript compiles ✅
- [ ] API tests pass ✅
- [ ] Conversation quality verified ✅
- [ ] Both locales tested ✅

---

**Last updated:** December 2024  
**Questions?** Check `prompts/README.md` or team docs
