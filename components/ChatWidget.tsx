'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  suggestedReplies?: string[];
}

interface ConversationContext {
  state: string;
  cart: any[];
  userInfo: Record<string, any>;
  metadata: {
    sessionStarted: string;
    lastInteraction: string;
    messageCount: number;
    intentHistory: string[];
  };
  trollScore?: number;
  trollHistory?: string[];
}

// Section-specific placeholder messages
const SECTION_PLACEHOLDERS: Record<string, string> = {
  'zed-hero': "Que puis-je faire pour vous ?",
  'zed-problem': "Un problème avec votre checkout ?",
  'zed-solution': "Comment puis-je vous aider ?",
  'zed-filter': "Une question ?",
  'zed-process': "Besoin d'aide ?",
  'zed-faq': "Posez votre question...",
  'zed-cta': "Prêt à passer commande ?",
  'default': "Écrivez votre message...",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('default');
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Scroll detection for section-based placeholder updates
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId) {
            setCurrentSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('[id^="zed-"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Add bot message with typing simulation
  const addBotMessage = (text: string, suggestedReplies?: string[], delay: number = 0) => {
    setTimeout(() => {
      setIsTyping(true);
      
      const typingDelay = Math.min(text.length * 15, 1500);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}_${Math.random()}`,
            text,
            sender: 'bot',
            timestamp: new Date(),
            suggestedReplies
          },
        ]);
        setIsTyping(false);
      }, typingDelay);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random()}`,
        text,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);
  };

  // Handle greeting sequence (multi-message)
  const handleGreetingSequence = async (firstUserMessage: string) => {
    try {
      setIsTyping(true);
      
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: firstUserMessage,
          isFirstMessage: true,
          conversationHistory: []
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      
      if (data.isGreeting && data.messages) {
        // Display greeting sequence with delays
        let cumulativeDelay = 0;
        data.messages.forEach((msg: any, index: number) => {
          const messageDelay = index === 0 ? 500 : (msg.delay || 500);
          cumulativeDelay += messageDelay;
          
          addBotMessage(
            msg.text, 
            msg.suggestedReplies,
            cumulativeDelay
          );
        });

        // Update context
        setContext(data.context);
        
        // Update conversation history
        setConversationHistory([
          { role: 'user', content: firstUserMessage }
        ]);
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Error during greeting:', error);
      setIsTyping(false);
      addBotMessage(
        "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?",
        undefined,
        500
      );
    }
  };

  // Send message to AI agent
  const sendToAgent = async (userMessage: string) => {
    try {
      setIsTyping(true);

      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          context,
          isFirstMessage: false
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      // Update context
      if (data.context) {
        setContext(data.context);
      }

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.messages[0]?.text || '' }
      ]);

      // Display response messages
      if (data.messages && data.messages.length > 0) {
        let cumulativeDelay = 800;
        data.messages.forEach((msg: any, index: number) => {
          if (index > 0) {
            cumulativeDelay += msg.delay || 500;
          }
          
          addBotMessage(
            msg.text,
            msg.suggestedReplies,
            index === 0 ? 800 : cumulativeDelay
          );
        });
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addBotMessage(
        "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?",
        undefined,
        500
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent, quickReply?: string) => {
    e.preventDefault();
    
    const userInput = quickReply || inputValue.trim();
    
    if (!userInput || isTyping) return;

    // First message: start greeting sequence
    if (!hasStarted) {
      setIsOpen(true);
      setHasStarted(true);
      addUserMessage(userInput);
      setInputValue('');
      await handleGreetingSequence(userInput);
      return;
    }

    // Subsequent messages: send to agent
    addUserMessage(userInput);
    setInputValue('');
    await sendToAgent(userInput);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Simple Input - Closed State */}
      <AnimatePresence>
        {!isOpen && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 25 
            }}
            className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl"
          >
            <div className="relative group">
              {/* Visible glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E88B7A] via-[#FFC9B9] to-[#E88B7A] rounded-full opacity-50 group-hover:opacity-70 blur-xl transition-opacity duration-500 animate-pulse" />
              
              {/* Input field with button */}
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={SECTION_PLACEHOLDERS[currentSection] || SECTION_PLACEHOLDERS.default}
                    key={currentSection}
                    className="relative w-full px-5 py-3.5 pr-14 sm:px-6 sm:py-4 sm:pr-16 rounded-full backdrop-blur-2xl bg-white/80 border-2 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] text-gray-900 placeholder-gray-500 outline-none transition-all duration-500 focus:bg-white/90 focus:border-[#E88B7A]/60 focus:shadow-[0_20px_60px_rgba(232,139,122,0.3)] group-hover:bg-white/90 group-hover:border-white/70 placeholder:transition-opacity placeholder:duration-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] text-white flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1E2A47]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">ZedCheckout AI</div>
                        <div className="text-white/70 text-xs">
                          {context?.state ? `${context.state}` : 'En ligne'}
                          {process.env.NODE_ENV === 'development' && context?.trollScore !== undefined && context.trollScore > 0 && (
                            <span className="ml-2 text-yellow-300" title="Troll Score">
                              🎭 {context.trollScore}
                            </span>
                          )}
                        </div>
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
                <div className="h-[450px] overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white/40 to-white/60">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%]`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg whitespace-pre-wrap ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] text-white rounded-br-sm'
                              : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-gray-100'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{message.text}</div>
                        </div>
                        
                        {/* Suggested replies */}
                        {message.sender === 'bot' && message.suggestedReplies && message.suggestedReplies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.suggestedReplies.map((reply, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => handleSubmit(e, reply)}
                                disabled={isTyping}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/90 hover:border-[#E88B7A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                        
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
                  
                  {/* Cart indicator (if cart has items) */}
                  {context && context.cart.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {context.cart.length} article{context.cart.length > 1 ? 's' : ''} au panier
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
