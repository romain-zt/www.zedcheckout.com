'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { SessionContext, ConversationMessage } from '@/lib/zedcheckout-types';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ZedCheckoutChatProps {
  className?: string;
  autoOpen?: boolean;
}

// ============================================================================
// CHAT WIDGET COMPONENT
// ============================================================================

export default function ZedCheckoutChat({ className = '', autoOpen = false }: ZedCheckoutChatProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Send initial greeting when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && !sessionContext) {
      sendGreeting();
    }
  }, [isOpen]);

  // ============================================================================
  // SEND GREETING
  // ============================================================================

  const sendGreeting = () => {
    const greetingMessages: ChatMessage[] = [
      {
        role: 'assistant',
        content: 'Salut ! 👋',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: "Je suis l'assistant ZedCheckout.",
        timestamp: new Date(Date.now() + 800)
      },
      {
        role: 'assistant',
        content: "On aide les e-commerçants Shopify à optimiser leur checkout.",
        timestamp: new Date(Date.now() + 1600)
      },
      {
        role: 'assistant',
        content: "Vous êtes sur quelle plateforme ?",
        timestamp: new Date(Date.now() + 2400)
      }
    ];

    // Display messages with delays
    greetingMessages.forEach((msg, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, msg]);
      }, index * 800);
    });
  };

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Add user message to UI
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userChatMessage]);

    // Add to conversation history
    const userHistoryMessage: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [...conversationHistory, userHistoryMessage];
    setConversationHistory(updatedHistory);

    try {
      // Call API with SSE
      const response = await fetch('/api/zedcheckout-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: userMessage,
          conversationHistory: updatedHistory.slice(-20), // Last 20 messages
          context: sessionContext
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let currentMessageBuffer = '';
      const assistantMessages: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event:\s*(.+)$/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1]);

          switch (event) {
            case 'typing_start':
              setIsTyping(true);
              break;

            case 'message_chunk':
              currentMessageBuffer = data.content;
              break;

            case 'split_signal':
              // Add the completed message
              if (currentMessageBuffer) {
                assistantMessages.push(currentMessageBuffer);
                
                const assistantChatMessage: ChatMessage = {
                  role: 'assistant',
                  content: currentMessageBuffer,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantChatMessage]);
                
                currentMessageBuffer = '';
              }

              // Show typing indicator for the delay
              setIsTyping(true);
              await new Promise(resolve => setTimeout(resolve, data.typing_delay_ms || 1000));
              break;

            case 'message_complete':
              setIsTyping(false);
              
              // Add the last message if buffer is not empty
              if (currentMessageBuffer) {
                assistantMessages.push(currentMessageBuffer);
                
                const assistantChatMessage: ChatMessage = {
                  role: 'assistant',
                  content: currentMessageBuffer,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantChatMessage]);
              }

              // Update session context
              if (data.context) {
                setSessionContext(data.context);
              }

              // Update conversation history with assistant's full response
              const fullAssistantResponse = assistantMessages.join(' ');
              setConversationHistory(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content: fullAssistantResponse,
                  timestamp: new Date().toISOString()
                }
              ]);

              console.log('Usage:', data.usage);
              break;

            case 'error':
              setIsTyping(false);
              
              const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `⚠️ ${data.message || 'Une erreur est survenue'}`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Peux-tu réessayer ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-6 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} />
          <span className="font-medium">Besoin d'aide ?</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[600px] flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">ZedCheckout</h3>
              <p className="text-xs text-gray-300">Assistant conversationnel</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-navy-light p-2 rounded-full transition-colors"
              aria-label="Fermer le chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-navy text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-4 py-4 bg-white">
            {/* Qualification Stage Indicator */}
            {sessionContext && (
              <div className="text-xs text-gray-500 mb-2 px-2">
                Stage: <span className="font-medium">{sessionContext.funnelStage}</span>
                {sessionContext.qualificationData.qualified && (
                  <span className="ml-2 text-green-600 font-semibold">✓ Qualifié</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre message..."
                disabled={isSending}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isSending}
                className="bg-navy hover:bg-navy-light text-white p-3 rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Envoyer"
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
