'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface LeadData {
  firstName?: string;
  email?: string;
  phone?: string;
  company?: string;
  platform?: string;
  monthlyRevenue?: string;
  cartValue?: string;
  challenge?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidgetAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setTimeout(() => {
        const greetingMessage = "👋 Salut ! Je suis l'assistant ZedCheckout.\n\nJe vois que tu t'intéresses à notre solution de checkout conversationnel.\n\nComment tu t'appelles ?";
        addBotMessage(greetingMessage);
        
        // Add to conversation history
        setConversationHistory([
          {
            role: 'assistant',
            content: greetingMessage,
          },
        ]);
        
        setHasGreeted(true);
      }, 800);
    }
  }, [isOpen, hasGreeted]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(text.length * 15, 1500);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, typingDelay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
  };

  const callAI = async (userMessage: string) => {
    try {
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          leadData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        const aiResponse = data.response;
        
        // Add AI message to UI
        addBotMessage(aiResponse.message);
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse.message },
        ]);
        
        // Merge extracted data with existing lead data
        if (aiResponse.extractedData && Object.keys(aiResponse.extractedData).length > 0) {
          setLeadData(prev => ({
            ...prev,
            ...aiResponse.extractedData,
          }));
        }
        
        // Check if qualification is complete
        if (aiResponse.isQualificationComplete) {
          setTimeout(() => {
            completeQualification();
          }, 2000);
        }
      } else {
        throw new Error('Invalid AI response format');
      }
      
    } catch (error) {
      console.error('Error calling AI:', error);
      
      // Fallback message
      addBotMessage(
        "Désolé, j'ai un petit souci technique. 😅\n\nPeux-tu réessayer dans quelques secondes ?"
      );
    }
  };

  const completeQualification = async () => {
    setIsComplete(true);
    
    // Prepare summary message
    const summaryParts = [];
    if (leadData.firstName) summaryParts.push(`👤 ${leadData.firstName}`);
    if (leadData.email) summaryParts.push(`📧 ${leadData.email}`);
    if (leadData.phone) summaryParts.push(`📱 ${leadData.phone}`);
    if (leadData.company) summaryParts.push(`🏢 ${leadData.company}`);
    if (leadData.platform) summaryParts.push(`🛒 ${leadData.platform}`);
    if (leadData.monthlyRevenue) summaryParts.push(`💰 ${leadData.monthlyRevenue}/mois`);
    if (leadData.cartValue) summaryParts.push(`🛍️ Panier moyen: ${leadData.cartValue}`);
    
    const summaryMessage = summaryParts.length > 0
      ? `Parfait ${leadData.firstName || ''} ! 🎉\n\nVoici ce que je retiens :\n\n${summaryParts.join('\n')}\n\nUn membre de notre équipe va analyser ton profil et te contacter rapidement à ${leadData.email || 'ton email'}.\n\nÀ très vite ! 👋`
      : `Parfait ! 🎉\n\nMerci pour cet échange. Notre équipe va revenir vers toi rapidement.\n\nÀ très vite ! 👋`;
    
    addBotMessage(summaryMessage);
    
    // Send lead data to server
    setTimeout(async () => {
      try {
        const response = await fetch('/api/chat-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadData.firstName || 'Anonymous',
            email: leadData.email || '',
            phone: leadData.phone,
            company: leadData.company || '',
            platform: leadData.platform || 'Non renseigné',
            monthlyRevenue: leadData.monthlyRevenue,
            cartValue: leadData.cartValue,
            challenge: leadData.challenge,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send lead data');
        }
      } catch (error) {
        console.error('Error sending lead data:', error);
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping || isComplete) return;

    const userInput = inputValue.trim();
    addUserMessage(userInput);
    setInputValue('');

    // Call AI to process the message
    await callAI(userInput);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 260, 
              damping: 20 
            }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 group"
            aria-label="Ouvrir le chat"
          >
            {/* Glassmorphism Bar */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E88B7A] via-[#FFC9B9] to-[#E88B7A] rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
              
              {/* Main bar */}
              <div className="relative px-8 py-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-[0_20px_60px_rgba(232,139,122,0.4)] transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  {/* Text with vanish effect */}
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm mb-0.5 group-hover:translate-x-1 transition-transform duration-300">
                      Discutons de votre projet
                    </div>
                    <div className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-300">
                      <span className="inline-block group-hover:translate-x-1 transition-transform duration-300 delay-75">
                        Cliquez pour commencer
                      </span>
                    </div>
                  </div>

                  {/* Arrow icon */}
                  <div className="ml-2 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4"
          >
            {/* Glass container */}
            <div className="relative">
              {/* Glow background */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#E88B7A] via-[#FFC9B9] to-[#E88B7A] rounded-3xl opacity-20 blur-xl" />
              
              {/* Main chat container */}
              <div className="relative rounded-3xl backdrop-blur-2xl bg-white/90 border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative px-6 py-4 bg-gradient-to-r from-[#1E2A47] to-[#2D3E5F] border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1E2A47]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm flex items-center gap-2">
                          ZedCheckout Assistant
                          <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full">
                            AI
                          </span>
                        </div>
                        <div className="text-white/70 text-xs">En ligne</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-white/70 hover:text-white transition-colors duration-200 hover:rotate-90 transition-transform"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white/40 to-white/60">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg whitespace-pre-wrap ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] text-white rounded-br-sm'
                              : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-gray-100'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{message.text}</div>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-5 py-3 shadow-lg border border-gray-100">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {!isComplete && (
                  <form onSubmit={handleSubmit} className="relative p-4 bg-white/60 backdrop-blur-sm border-t border-gray-100">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isTyping}
                        placeholder="Tapez votre message..."
                        className="w-full px-5 py-3 pr-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-[#E88B7A] focus:ring-2 focus:ring-[#E88B7A]/20 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] text-white flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </form>
                )}

                {/* Completion state */}
                {isComplete && (
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-t border-green-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-lg font-semibold text-gray-800 mb-1">Merci !</div>
                      <div className="text-sm text-gray-600">Nous revenons vers vous très vite</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
