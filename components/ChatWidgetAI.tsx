'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  suggestedReplies?: string[];
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

// Section-specific placeholder messages (FR + EN)
const SECTION_PLACEHOLDERS: Record<string, { fr: string; en: string }> = {
  'zed-hero': {
    fr: "Comment ZedCheckout peut transformer votre checkout ?",
    en: "How can ZedCheckout transform your checkout?"
  },
  'zed-problem': {
    fr: "Votre checkout vous fait perdre des clients ?",
    en: "Is your checkout losing customers?"
  },
  'zed-solution': {
    fr: "Comment fonctionne l'IA conversationnelle ?",
    en: "How does conversational AI work?"
  },
  'zed-filter': {
    fr: "ZedCheckout est-il fait pour vous ?",
    en: "Is ZedCheckout right for you?"
  },
  'zed-process': {
    fr: "Comment se passe la mise en place ?",
    en: "How does the implementation work?"
  },
  'zed-faq': {
    fr: "Une question sur ZedCheckout ?",
    en: "Any questions about ZedCheckout?"
  },
  'zed-cta': {
    fr: "Prêt à augmenter vos conversions ?",
    en: "Ready to boost your conversions?"
  },
  'default': {
    fr: "Demandez ce que vous voulez...",
    en: "Ask anything you want..."
  },
};

// Section descriptions for AI context
const SECTION_DESCRIPTIONS: Record<string, { fr: string; en: string }> = {
  'zed-hero': {
    fr: "L'utilisateur regarde la section hero/introduction de ZedCheckout",
    en: "User is viewing the hero/introduction section of ZedCheckout"
  },
  'zed-problem': {
    fr: "L'utilisateur lit sur les problèmes du checkout traditionnel (abandons de panier, friction)",
    en: "User is reading about traditional checkout problems (cart abandonment, friction)"
  },
  'zed-solution': {
    fr: "L'utilisateur découvre la solution ZedCheckout et l'IA conversationnelle",
    en: "User is discovering the ZedCheckout solution and conversational AI"
  },
  'zed-filter': {
    fr: "L'utilisateur vérifie si ZedCheckout est adapté à son profil e-commerce",
    en: "User is checking if ZedCheckout is suitable for their e-commerce profile"
  },
  'zed-process': {
    fr: "L'utilisateur consulte le processus de mise en place et d'intégration",
    en: "User is reviewing the implementation and integration process"
  },
  'zed-faq': {
    fr: "L'utilisateur cherche des réponses à des questions fréquentes",
    en: "User is looking for answers to frequently asked questions"
  },
  'zed-cta': {
    fr: "L'utilisateur est dans la section appel à l'action finale",
    en: "User is in the final call-to-action section"
  },
  'default': {
    fr: "L'utilisateur navigue sur la page",
    en: "User is navigating the page"
  },
};

// Analytics helper
const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  console.log('📊 Event:', eventName, properties);
};

const STORAGE_KEY = 'zed_chat_state';

export default function ChatWidgetAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('default');
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userHasTyped = useRef<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved);
          // Only restore if not complete and recent (within 24h)
          const savedTime = new Date(state.timestamp).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
          
          if (!state.isComplete && hoursDiff < 24) {
            setMessages(state.messages?.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })) || []);
            setLeadData(state.leadData || {});
            setConversationHistory(state.conversationHistory || []);
            setHasGreeted(state.hasGreeted || false);
            setIsComplete(state.isComplete || false);
            
            trackEvent('chat_restored', { messageCount: state.messages?.length || 0 });
          }
        }
      } catch (err) {
        console.error('Failed to restore chat state:', err);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (messages.length > 0 || hasGreeted)) {
      try {
        const state = {
          messages,
          leadData,
          conversationHistory,
          hasGreeted,
          isComplete,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save chat state:', err);
      }
    }
  }, [messages, leadData, conversationHistory, hasGreeted, isComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isComplete) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        trackEvent('chat_closed_keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          if (sectionId && SECTION_PLACEHOLDERS[sectionId]) {
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

  // Detect locale from document or browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlLang = document.documentElement.lang;
      if (htmlLang.startsWith('en')) {
        setLocale('en');
      } else {
        setLocale('fr');
      }
    }
  }, []);

  // Natural greeting: wait 3s, cancel if user types
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      trackEvent('chat_opened');
      userHasTyped.current = false;
      
      // Start 3-second timer for greeting
      greetingTimeoutRef.current = setTimeout(async () => {
        if (!userHasTyped.current && !hasGreeted) {
          // Use AI to generate a short, natural greeting with section context
          const sectionContext = SECTION_DESCRIPTIONS[currentSection]?.[locale] || SECTION_DESCRIPTIONS.default[locale];
          try {
            const response = await fetch('/api/chat-ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `[SYSTEM: Generate a very short greeting (max 2 sentences) to welcome the user and ask their name. Be casual and friendly. CONTEXT: ${sectionContext}]`,
                conversationHistory: [],
                leadData: {},
                sectionContext: currentSection,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.response) {
                const greetingMessage = data.response.message;
                addBotMessage(greetingMessage, data.response.suggestedReplies || ["Je m'appelle...", "C'est quoi ZedCheckout ?"]);
                
                setConversationHistory([{
                  role: 'assistant',
                  content: greetingMessage,
                }]);
                
                setHasGreeted(true);
              }
            }
          } catch (error) {
            // Fallback to simple greeting if AI fails
            const fallbackGreeting = "Salut ! 👋 Comment tu t'appelles ?";
            addBotMessage(fallbackGreeting, ["Je m'appelle...", "C'est quoi ZedCheckout ?"]);
            setConversationHistory([{
              role: 'assistant',
              content: fallbackGreeting,
            }]);
            setHasGreeted(true);
          }
        }
      }, 3000);
    }
    
    // Cleanup timeout on unmount or when chat closes
    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
        greetingTimeoutRef.current = null;
      }
    };
  }, [isOpen, hasGreeted]);

  const addBotMessage = (text: string, suggestedReplies?: string[]) => {
    setIsTyping(true);
    setError(null); // Clear any previous errors
    
    // More natural typing delay: faster for short messages, slower for long ones
    // Average reading speed: ~200 words per minute = ~3.3 words per second
    const wordCount = text.split(/\s+/).length;
    const baseDelay = Math.min(wordCount * 200, 2500); // 200ms per word, max 2.5s
    const variance = Math.random() * 300; // Add 0-300ms randomness for naturalness
    const typingDelay = baseDelay + variance;
    
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          sender: 'bot',
          timestamp: new Date(),
          suggestedReplies,
        },
      ]);
      setIsTyping(false);
      typingTimeoutRef.current = null;
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

  const callAI = async (userMessage: string, isRetry: boolean = false) => {
    try {
      setError(null);
      
      trackEvent('message_sent', { 
        messageLength: userMessage.length,
        isRetry,
        conversationLength: conversationHistory.length,
        currentSection 
      });
      
      // Add section context to the first message
      const sectionContext = SECTION_DESCRIPTIONS[currentSection]?.[locale] || SECTION_DESCRIPTIONS.default[locale];
      
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          leadData,
          sectionContext: currentSection,
          sectionDescription: sectionContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Trop de requêtes. Attends quelques secondes...');
        }
        
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        const aiResponse = data.response;
        
        // Reset retry count on success
        setRetryCount(0);
        
        // Add AI message to UI with suggested replies
        addBotMessage(aiResponse.message, aiResponse.suggestedReplies);
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse.message },
        ]);
        
        // Merge extracted data with existing lead data
        if (aiResponse.extractedData && Object.keys(aiResponse.extractedData).length > 0) {
          const newData = aiResponse.extractedData;
          setLeadData(prev => {
            const merged = { ...prev, ...newData };
            
            // Track data collection progress
            const fieldsCollected = Object.keys(merged).length;
            trackEvent('lead_data_updated', {
              fieldsCollected,
              newFields: Object.keys(newData),
              confidence: aiResponse.confidence,
            });
            
            return merged;
          });
        }
        
        // Check if qualification is complete
        if (aiResponse.isQualificationComplete) {
          trackEvent('qualification_complete', {
            fieldsCollected: Object.keys(leadData).length,
            conversationLength: conversationHistory.length,
          });
          
          setTimeout(() => {
            completeQualification();
          }, 2000);
        }
        
        trackEvent('ai_response_received', {
          hasExtractedData: !!(aiResponse.extractedData && Object.keys(aiResponse.extractedData).length > 0),
          hasSuggestions: !!(aiResponse.suggestedReplies && aiResponse.suggestedReplies.length > 0),
          confidence: aiResponse.confidence,
        });
      } else {
        throw new Error('Réponse invalide du serveur');
      }
      
    } catch (error: any) {
      console.error('Error calling AI:', error);
      
      const errorMessage = error.message || 'Erreur inconnue';
      setError(errorMessage);
      
      // Smart retry logic
      if (retryCount < 2 && !isRetry) {
        setRetryCount(prev => prev + 1);
        
        addBotMessage(
          "Oups, petit bug... 😅 Je réessaie dans 2 secondes !",
          []
        );
        
        setTimeout(() => {
          callAI(userMessage, true);
        }, 2000);
      } else {
        // Final fallback after retries
        addBotMessage(
          "Désolé, j'ai un souci technique. 😅\n\nPeux-tu réessayer ton dernier message ? Ou clique ici pour continuer par email.",
          ["Réessayer", "Continuer par email"]
        );
        
        trackEvent('ai_error', {
          error: errorMessage,
          retryCount,
          conversationLength: conversationHistory.length,
        });
      }
    }
  };

  const completeQualification = async () => {
    setIsComplete(true);
    
    trackEvent('qualification_completing', {
      collectedFields: Object.keys(leadData),
      totalMessages: messages.length,
    });
    
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
      ? `Parfait ${leadData.firstName || ''} ! 🎉\n\nVoici ce que je retiens :\n\n${summaryParts.join('\n')}\n\nUn membre de notre équipe va analyser ton profil et te contacter rapidement${leadData.email ? ` à ${leadData.email}` : ''}.\n\nÀ très vite ! 👋`
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
        
        if (response.ok) {
          const data = await response.json();
          trackEvent('lead_submitted_success', {
            qualified: data.qualified,
            fieldsCount: Object.keys(leadData).length,
          });
        } else {
          trackEvent('lead_submission_failed', {
            status: response.status,
          });
          console.error('Failed to send lead data');
        }
      } catch (error) {
        trackEvent('lead_submission_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error('Error sending lead data:', error);
      }
    }, 500);
  };

  // Reset conversation (for development/testing)
  const resetConversation = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setMessages([]);
    setLeadData({});
    setConversationHistory([]);
    setHasGreeted(false);
    setIsComplete(false);
    setError(null);
    setRetryCount(0);
    setInputValue('');
    trackEvent('conversation_reset');
  }, []);

  const handleQuickReply = (reply: string) => {
    if (isTyping || isComplete) return;
    
    if (reply === "Continuer par email") {
      // Handle email fallback
      window.location.href = "mailto:romain@zedcheckout.com?subject=Contact depuis le chat";
      trackEvent('fallback_to_email');
      return;
    }
    
    if (reply === "Réessayer") {
      // Retry last user message
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      if (lastUserMessage) {
        callAI(lastUserMessage.text, false);
        trackEvent('manual_retry');
      }
      return;
    }
    
    addUserMessage(reply);
    trackEvent('quick_reply_clicked', { reply });
    callAI(reply);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping || isComplete) return;

    const userInput = inputValue.trim();
    
    // First message: open chat if not open
    if (!isOpen) {
      setIsOpen(true);
    }
    
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
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    // Cancel greeting if user starts typing
                    if (!hasGreeted && e.target.value.length > 0) {
                      userHasTyped.current = true;
                      if (greetingTimeoutRef.current) {
                        clearTimeout(greetingTimeoutRef.current);
                        greetingTimeoutRef.current = null;
                      }
                    }
                  }}
                  placeholder={SECTION_PLACEHOLDERS[currentSection]?.[locale] || SECTION_PLACEHOLDERS.default[locale]}
                  key={`${currentSection}-${locale}`}
                  autoComplete="off"
                  className="relative w-full px-5 py-3.5 pr-14 sm:px-6 sm:py-4 sm:pr-16 rounded-full backdrop-blur-2xl bg-white/80 border-2 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] text-gray-900 placeholder-gray-500 outline-none transition-all duration-500 focus:bg-white/90 focus:border-[#E88B7A]/60 focus:shadow-[0_20px_60px_rgba(232,139,122,0.3)] group-hover:bg-white/90 group-hover:border-white/70 placeholder:transition-opacity placeholder:duration-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  aria-label="Envoyer"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] text-white flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
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
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
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
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1E2A47]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm flex items-center gap-2">
                          <span>ZedCheckout Assistant</span>
                          <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full">
                            AI
                          </span>
                        </div>
                        <div className="text-white/70 text-xs">En ligne</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Reset button (dev mode only) */}
                      {process.env.NODE_ENV === 'development' && messages.length > 0 && (
                        <button
                          onClick={resetConversation}
                          className="text-white/50 hover:text-white transition-colors duration-200 p-1"
                          aria-label="Réinitialiser la conversation"
                          title="Réinitialiser (dev only)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          trackEvent('chat_closed', {
                            messageCount: messages.length,
                            hasLeadData: Object.keys(leadData).length > 0,
                          });
                        }}
                        className="text-white/70 hover:text-white transition-all duration-200 hover:rotate-90"
                        aria-label="Fermer le chat"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white/40 to-white/60">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0 : 0 }}
                      className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[80%]`}>
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
                        
                        {/* Quick reply buttons */}
                        {message.sender === 'bot' && 
                         message.suggestedReplies && 
                         message.suggestedReplies.length > 0 && 
                         index === messages.length - 1 && 
                         !isTyping && 
                         !isComplete && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-2 mt-3"
                          >
                            {message.suggestedReplies.map((reply, idx) => (
                              <motion.button
                                key={idx}
                                onClick={() => handleQuickReply(reply)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-white/90 hover:bg-white border border-gray-200 hover:border-[#E88B7A] rounded-full text-sm text-gray-700 hover:text-[#E88B7A] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                              >
                                {reply}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
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
                  
                  {/* Error state */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center"
                    >
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-600">
                        ⚠️ {error}
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
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          // Cancel greeting if user starts typing
                          if (!hasGreeted && e.target.value.length > 0) {
                            userHasTyped.current = true;
                            if (greetingTimeoutRef.current) {
                              clearTimeout(greetingTimeoutRef.current);
                              greetingTimeoutRef.current = null;
                            }
                          }
                        }}
                        disabled={isTyping}
                        placeholder="Tapez votre réponse..."
                        className="w-full px-5 py-3 pr-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-[#E88B7A] focus:ring-2 focus:ring-[#E88B7A]/20 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        aria-label="Envoyer"
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
