'use client';

/**
 * Example: Ultra-Realistic Roleplay Chat
 * 
 * This component demonstrates how to use the roleplay mode
 * in ChatWidgetAI for WhatsApp-style character conversations.
 */

import { useState } from 'react';

interface RoleplayCharacter {
  name: string;
  profile: string;
  background: string;
  scenario: string;
  dialogueSample: string;
}

interface Message {
  id: string;
  text: string;
  narration?: string;
  emotion?: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function RoleplayExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Example character - easily swap with database data
  const character: RoleplayCharacter = {
    name: 'Sophie',
    profile: 'Une barista française de 25 ans, passionnée par le café et les bonnes conversations',
    background: 'Sophie a grandi à Paris et travaille dans un café cosy depuis 3 ans. Elle connaît tous ses clients par leur prénom et leurs commandes favorites.',
    scenario: 'Tu entres dans le café par un après-midi pluvieux. Sophie essuie le comptoir et lève les yeux avec un sourire en te voyant.',
    dialogueSample: `"La même chose que d'hab ?" *sourit* "J'ai déjà commencé ton cappuccino."\n"Longue journée ?" *s'accoude au comptoir* "Raconte-moi."`
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call roleplay API
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.narration 
              ? `[${m.emotion}]\n***${m.narration}***\n${m.text}`
              : m.text
          })),
          mode: 'roleplay',
          locale: 'fr-FR',
          characterData: character
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add bot message with emotion and narration
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.dialogue,
          narration: data.response.narration,
          emotion: data.response.emotion,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const getEmotionStyle = (emotion?: string) => {
    const styles: Record<string, string> = {
      'Happy': 'bg-yellow-50 border-yellow-200',
      'Sad': 'bg-blue-50 border-blue-200',
      'inlove': 'bg-pink-50 border-pink-200',
      'Seductive': 'bg-purple-50 border-purple-200',
      'Angry': 'bg-red-50 border-red-200',
      'Amused': 'bg-green-50 border-green-200',
      'Crying': 'bg-indigo-50 border-indigo-200',
      'Neutral': 'bg-gray-50 border-gray-200'
    };
    return styles[emotion || 'Neutral'] || styles['Neutral'];
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white border-b p-4 rounded-t-lg">
        <h2 className="font-semibold text-lg">{character.name}</h2>
        <p className="text-sm text-gray-500">En ligne</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 italic py-8">
            {character.scenario}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : `border-2 ${getEmotionStyle(message.emotion)}`
              }`}
            >
              {/* Narration (only for bot) */}
              {message.narration && message.sender === 'bot' && (
                <div className="text-xs italic text-gray-600 mb-1">
                  *{message.narration}*
                </div>
              )}
              
              {/* Dialogue */}
              <div className="text-sm">
                {message.text}
              </div>
              
              {/* Timestamp */}
              <div className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 rounded-b-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écris un message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-500 text-white rounded-full px-6 py-2 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
