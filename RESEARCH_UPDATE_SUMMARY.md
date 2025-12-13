# Research Update Summary

## Changes Made

Updated AI prompts to trigger research **much more aggressively**.

### Before
- Research was triggered only in specific cases
- AI had to "decide" if research was needed
- Sometimes the AI would skip research even when it had info

### After
- Research is now **AUTOMATIC** in 3 key scenarios:
  1. ✅ **URL received** → ALWAYS research (mandatory)
  2. ✅ **Name/company/phone received** → ALWAYS research (highly recommended)
  3. ✅ **Any doubt about business** → ALWAYS research (recommended)

## Key Principle Added

**"When in doubt, research"**

The AI now asks itself before every response:
1. Do I have all the info to personalize my response?
2. Could I better understand their business?
3. Do I know their platform/current setup?

If the answer is "no" to any → `needsResearch: true`

## Files Updated

- ✅ `prompts/chat-lead.fr-FR.md` - French prompt (lead generation)
- ✅ `prompts/chat-lead.en-EN.md` - English prompt (lead generation)

## New Behavior

### Scenario 1: User gives URL
**Before:** Sometimes researched, sometimes didn't
**Now:** **ALWAYS** triggers research immediately

Example:
```
User: "Mon site c'est monsite.com"
AI: "Laisse-moi jeter un œil à ton site... 👀"
→ needsResearch: true, type: "website_check"
```

### Scenario 2: User gives name/company
**Before:** Never researched based on this alone
**Now:** **ALWAYS** triggers research to find their business

Example:
```
User: "Je m'appelle Sophie, je gère Les Petites Merveilles"
AI: "Enchanté Sophie ! Laisse-moi regarder ton business rapidement..."
→ needsResearch: true, type: "market_info"
```

### Scenario 3: Any doubt about business
**Before:** AI would guess or ask generic questions
**Now:** Triggers research to get accurate info

Example:
```
User: "Je vends des cosmétiques bio"
AI: [doesn't know their platform/setup]
→ Asks for website
→ needsResearch: true when URL is given
```

## Impact

The AI will now:
- Personalize responses better (knows the actual business)
- Qualify leads more accurately (real data, not guesses)
- Provide more relevant suggestions (based on research)
- Build trust faster (shows it actually checked)

## Testing

Try these scenarios:
1. Give a website URL → Should immediately research
2. Give a name/company → Should research business info
3. Mention your business type → AI should ask for URL, then research

The AI should now feel much more "intelligent" because it actively seeks information rather than making assumptions.
