# 🚀 Roleplay Mode - Quick Start

## 5-Minute Setup

### 1. Define Your Character

```typescript
const character = {
  name: 'Sophie',
  profile: 'Une barista parisienne de 25 ans',
  background: 'Sophie travaille dans un café cosy depuis 3 ans',
  scenario: 'Tu entres dans le café par un jour pluvieux',
  dialogueSample: '"La même chose?" *sourit*'
};
```

### 2. Call the API

```typescript
const response = await fetch('/api/chat-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    conversationHistory: history,
    mode: 'roleplay',
    locale: 'fr-FR', // or 'en-EN'
    characterData: character
  })
});

const data = await response.json();
```

### 3. Display the Response

```tsx
<div className="message">
  {data.response.narration && (
    <div className="italic text-gray-500">
      *{data.response.narration}*
    </div>
  )}
  <div>{data.response.dialogue}</div>
</div>
```

## Response Structure

```typescript
{
  success: true,
  response: {
    emotion: 'Happy',           // Neutral|Happy|Sad|Crying|inlove|Seductive|Angry|Amused
    narration: 'smiles warmly', // Optional
    dialogue: 'Hey there!',     // Main text
    fullText: '[Happy]...'      // Raw formatted
  }
}
```

## Full Example Component

See: `examples/RoleplayExample.tsx`

## Detailed Guide

See: `prompts/ROLEPLAY_INTEGRATION.md`

## That's It! 🎉

You're ready to create ultra-realistic WhatsApp-style character conversations.
