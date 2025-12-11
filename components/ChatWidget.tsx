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
  name?: string;
  email?: string;
  company?: string;
  platform?: string;
  monthlyRevenue?: string;
  cartValue?: string;
  challenge?: string;
}

type QuestionKey = keyof LeadData;

// Section-specific placeholder messages
const SECTION_PLACEHOLDERS: Record<string, string> = {
  'zed-hero': "Comment ZedCheckout peut transformer votre checkout ?",
  'zed-problem': "Votre checkout vous fait perdre des clients ?",
  'zed-solution': "Comment fonctionne l'IA conversationnelle ?",
  'zed-filter': "ZedCheckout est-il fait pour vous ?",
  'zed-process': "Comment se passe la mise en place ?",
  'zed-faq': "Une question sur ZedCheckout ?",
  'zed-cta': "Prêt à augmenter vos conversions ?",
  'default': "Demandez ce que vous voulez...",
};

const QUALIFICATION_FLOW: Array<{
  key: QuestionKey;
  question: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}> = [
  {
    key: 'name',
    question: "Pour commencer, comment vous appelez-vous ? 😊",
  },
  {
    key: 'email',
    question: "Parfait {name} ! Quel est votre email professionnel ?",
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: "Hmm, cet email ne semble pas valide. Pouvez-vous vérifier ?",
  },
  {
    key: 'company',
    question: "Super ! Quel est le nom de votre entreprise ou marque ?",
  },
  {
    key: 'platform',
    question: "Sur quelle plateforme e-commerce êtes-vous actuellement ? (Shopify, WooCommerce, Custom...)",
  },
  {
    key: 'monthlyRevenue',
    question: "Et quel est votre CA mensuel approximatif ? (ex: 10K, 50K, 100K+...)",
  },
  {
    key: 'cartValue',
    question: "Quel est votre panier moyen ? 🛒",
  },
  {
    key: 'challenge',
    question: "Dernière question : quel est votre plus grand défi avec votre checkout actuellement ? 🎯",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [isComplete, setIsComplete] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('default');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input when chat opens
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
      rootMargin: '-20% 0px -60% 0px', // Section is "active" when it's in the middle third of viewport
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

    // Observe all sections with IDs matching our placeholders
    const sections = document.querySelectorAll('[id^="zed-"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(text.length * 20, 2000);
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping || isComplete) return;

    const userInput = inputValue.trim();
    
    // First message: open chat, add user message, send greeting and start qualification
    if (!hasGreeted) {
      setIsOpen(true);
      addUserMessage(userInput);
      setInputValue('');
      setHasGreeted(true);
      setTimeout(() => {
        addBotMessage(
          "👋 Salut ! Je suis l'assistant ZedCheckout.\n\nJe vois que vous êtes intéressé par notre solution de checkout conversationnel.\n\nJ'ai quelques questions rapides pour mieux comprendre votre situation. Ça vous va ?"
        );
        setTimeout(() => {
          addBotMessage(QUALIFICATION_FLOW[0].question);
        }, 1500);
      }, 800);
      return;
    }

    addUserMessage(userInput);
    setInputValue('');

    // Validate input if validator exists
    const currentQuestion = QUALIFICATION_FLOW[currentQuestionIndex];
    if (currentQuestion.validator && !currentQuestion.validator(userInput)) {
      setTimeout(() => {
        addBotMessage(currentQuestion.errorMessage || "Désolé, cette réponse n'est pas valide.");
      }, 500);
      return;
    }

    // Save lead data
    const updatedLeadData = {
      ...leadData,
      [currentQuestion.key]: userInput,
    };
    setLeadData(updatedLeadData);

    // Move to next question or complete
    if (currentQuestionIndex < QUALIFICATION_FLOW.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      setTimeout(() => {
        let nextQuestion = QUALIFICATION_FLOW[nextIndex].question;
        // Replace placeholders
        nextQuestion = nextQuestion.replace('{name}', updatedLeadData.name || '');
        addBotMessage(nextQuestion);
      }, 800);
    } else {
      // Complete the qualification
      setIsComplete(true);
      
      setTimeout(() => {
        addBotMessage(
          `Parfait ${updatedLeadData.name} ! 🎉\n\nMerci d'avoir pris le temps de répondre. Voici ce que je retiens :\n\n` +
          `• Entreprise : ${updatedLeadData.company}\n` +
          `• Plateforme : ${updatedLeadData.platform}\n` +
          `• CA mensuel : ${updatedLeadData.monthlyRevenue}\n` +
          `• Panier moyen : ${updatedLeadData.cartValue}\n` +
          `• Défi principal : ${updatedLeadData.challenge}\n\n` +
          `Un membre de notre équipe va analyser votre profil et vous contacter sous 24h à ${updatedLeadData.email}.\n\n` +
          `En attendant, vous pouvez consulter notre démo interactive ci-dessous ! 👇`
        );
      }, 1000);

      // Send lead data to server
      setTimeout(async () => {
        try {
          const response = await fetch('/api/chat-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLeadData),
          });
          
          if (!response.ok) {
            console.error('Failed to send lead data');
          }
        } catch (error) {
          console.error('Error sending lead data:', error);
        }
      }, 500);
    }
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1E2A47]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">ZedCheckout Assistant</div>
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
                        placeholder="Tapez votre réponse..."
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
