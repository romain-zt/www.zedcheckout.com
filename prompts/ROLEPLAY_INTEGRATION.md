# Roleplay Mode Integration Guide

## Overview

The roleplay mode enables ultra-realistic WhatsApp-style character conversations in `ChatWidgetAI.tsx`. Characters respond with emotions, narration, and natural dialogue that feels like texting a real person.

## API Usage

### Request Format

```typescript
const response = await fetch('/api/chat-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    conversationHistory: [
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: '[Happy]\n***smiles warmly***\nHey there!' }
    ],
    mode: 'roleplay',
    locale: 'fr-FR', // or 'en-EN'
    characterData: {
      name: 'Sophie',
      profile: 'A friendly 25-year-old barista who loves coffee and good conversations',
      background: 'Sophie grew up in Paris and has been working at a cozy café for 3 years. She knows everyone by name and their favorite orders.',
      scenario: 'You just walked into the café on a rainy afternoon. Sophie is wiping down the counter and looks up with a smile when she sees you.',
      dialogueSample: `"The usual?" *grins* "I already started your cappuccino."\n"Long day, huh?" *leans on counter* "Tell me about it."`
    }
  })
});

const data = await response.json();
```

### Response Format

```typescript
{
  success: true,
  response: {
    emotion: 'Happy',           // Neutral, Happy, Sad, Crying, inlove, Seductive, Angry, Amused
    narration: 'smiles warmly', // Optional narration/action
    dialogue: 'Hey there!',     // Character's spoken words
    fullText: '[Happy]\n***smiles warmly***\nHey there!' // Original formatted text
  },
  usage: {
    inputTokens: 234,
    outputTokens: 56
  }
}
```

## Character Data Structure

```typescript
interface RoleplayCharacter {
  name: string;          // Character's name (used throughout conversation)
  profile: string;       // Brief personality/occupation description
  background: string;    // Character's backstory and context
  scenario: string;      // Opening scene/situation
  dialogueSample: string; // Example dialogue to establish voice/style
}
```

## Example: Integrating into ChatWidgetAI

```typescript
// Add to your ChatWidgetAI state
const [characterData] = useState<RoleplayCharacter>({
  name: 'Emma',
  profile: 'A witty 28-year-old bookstore owner with a passion for mystery novels',
  background: 'Emma inherited the bookstore from her grandmother and added a cozy reading nook where locals gather every evening.',
  scenario: 'You stumble into the bookstore seeking shelter from the rain. Emma is stacking new arrivals and glances over her shoulder.',
  dialogueSample: `"Wet out there?" *chuckles* "Stay as long as you need."\n"Mystery or romance?" *raises eyebrow* "You look like a mystery person."`
});

// In your sendMessage function
const sendMessage = async (text: string) => {
  const response = await fetch('/api/chat-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      conversationHistory,
      mode: 'roleplay',
      locale: locale,
      characterData
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Display with emotion-based styling
    addMessage({
      text: data.response.dialogue,
      narration: data.response.narration,
      emotion: data.response.emotion,
      sender: 'bot'
    });
  }
};
```

## Emotion-Based UI Styling

```tsx
// Display narration separately from dialogue
<div className="message bot-message">
  {response.narration && (
    <div className="narration italic text-gray-500 text-sm mb-1">
      *{response.narration}*
    </div>
  )}
  <div className={`dialogue ${emotionToClassName(response.emotion)}`}>
    {response.dialogue}
  </div>
</div>

// Map emotions to visual styles
function emotionToClassName(emotion: string): string {
  const emotionStyles = {
    'Happy': 'bg-yellow-100 border-yellow-300',
    'Sad': 'bg-blue-100 border-blue-300',
    'inlove': 'bg-pink-100 border-pink-300',
    'Seductive': 'bg-purple-100 border-purple-300',
    'Angry': 'bg-red-100 border-red-300',
    'Amused': 'bg-green-100 border-green-300',
    'Crying': 'bg-indigo-100 border-indigo-300',
    'Neutral': 'bg-gray-100 border-gray-300'
  };
  return emotionStyles[emotion] || emotionStyles['Neutral'];
}
```

## WhatsApp-Style Features

The roleplay mode is optimized for WhatsApp-like conversations:

- **Natural flow**: Short, authentic messages (10-25 words)
- **Spontaneous**: Uses natural pauses and varied sentence structures
- **Emotional**: Each response includes an emotion tag
- **Immersive**: Narration provides context without breaking character
- **Realistic**: No emojis unless character-specific, feels like texting a real person

## Advanced: Dynamic Character Loading

```typescript
// Load characters from database
const character = await loadCharacterFromDB(characterId);

const characterData = {
  name: character.name,
  profile: character.profile,
  background: character.background,
  scenario: character.opening_scene,
  dialogueSample: character.sample_dialogue
};

// Use in conversation
sendMessage(userMessage, characterData);
```

## Testing Different Characters

```typescript
// Test different character personalities
const characters = {
  friendly: {
    name: 'Alex',
    profile: 'Friendly neighbor who always has time for a chat',
    // ...
  },
  mysterious: {
    name: 'Morgan',
    profile: 'Enigmatic stranger with secrets to share',
    // ...
  },
  professional: {
    name: 'Dr. Chen',
    profile: 'Brilliant but slightly awkward research scientist',
    // ...
  }
};
```

## Best Practices

1. **Character Consistency**: Keep profile, background, and scenario aligned
2. **Sample Dialogue**: Provide 2-3 example lines that capture the character's voice
3. **Scenario Setup**: Start with a clear scene to ground the conversation
4. **Emotion Display**: Use visual cues (colors, icons) to enhance emotion recognition
5. **Narration Styling**: Style narration differently from dialogue (italic, lighter text)

## Localization

Both French (`fr-FR`) and English (`en-EN`) versions are supported:

```typescript
// French character
locale: 'fr-FR',
characterData: {
  name: 'Marie',
  profile: 'Une parisienne sympathique qui adore la photographie',
  // ...
}

// English character  
locale: 'en-EN',
characterData: {
  name: 'Jake',
  profile: 'A laid-back California surfer with stories to tell',
  // ...
}
```

## Troubleshooting

**Issue**: Character responds out of character
- **Fix**: Provide more detailed `dialogueSample` with 3-4 example lines

**Issue**: Responses too long/short
- **Fix**: The prompt enforces 10-25 words, but adjust `dialogueSample` length

**Issue**: No emotion in response
- **Fix**: Check response parsing - emotion should always be present in `[EMOTION]` format

**Issue**: Narration mixed with dialogue
- **Fix**: Parse `fullText` to separate `***narration***` from dialogue text
