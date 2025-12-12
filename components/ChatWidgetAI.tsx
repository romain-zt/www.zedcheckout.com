'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const DELAY_OPTIONS = [
  300,600,800, 900,1200
]

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  suggestedReplies?: string[];
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface LeadData {
  website?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  company?: string;
  platform?: string;
  monthlyRevenue?: string;
  cartValue?: string;
  challenge?: string;
  emotionalState?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

type ResearchType = 
  | 'website_check'
  | 'platform_compatibility'
  | 'market_info'
  | 'technical_details'
  | 'competitor_analysis'
  | 'pricing_research';

interface PendingResearch {
  id: string;
  type: ResearchType;
  query: string;
  context: string;
  startedAt: number;
  status: 'pending' | 'completed' | 'error';
  result?: any;
}

// Section-specific placeholder messages (FR + EN) - DEPRECATED, kept for backward compat
const SECTION_PLACEHOLDERS: Record<string, { fr: string; en: string }> = {
  'zed-hero': {
    fr: "https://votre-site.com 🌐",
    en: "https://your-website.com 🌐"
  },
  'zed-problem': {
    fr: "Quelle est l'URL de votre site ?",
    en: "What's your website URL?"
  },
  'zed-solution': {
    fr: "Partagez l'URL de votre boutique...",
    en: "Share your store URL..."
  },
  'zed-filter': {
    fr: "Votre site web ? (ex: https://...)",
    en: "Your website? (e.g., https://...)"
  },
  'zed-process': {
    fr: "URL de votre site pour commencer...",
    en: "Your website URL to get started..."
  },
  'zed-faq': {
    fr: "https://mon-site.com",
    en: "https://my-site.com"
  },
  'zed-cta': {
    fr: "Entrez l'URL de votre site 🚀",
    en: "Enter your website URL 🚀"
  },
  'default': {
    fr: "https://votre-site.com",
    en: "https://your-site.com"
  },
};

// Toast messages by section (used for WhatsApp-style notifications)
const TOAST_MESSAGES: Record<string, { fr: string; en: string }> = {
  'zed-hero': {
    fr: "👋 Ton site e-commerce est sur quelle URL ?",
    en: "👋 What's your e-commerce site URL?"
  },
  'zed-problem': {
    fr: "💡 Combien de paniers tu perds par mois ?",
    en: "💡 How many carts are you losing per month?"
  },
  'zed-solution': {
    fr: "🚀 ZedCheckout peut transformer ton checkout. Ton site ?",
    en: "🚀 ZedCheckout can transform your checkout. Your site?"
  },
  'zed-filter': {
    fr: "🎯 ZedCheckout est-il fait pour toi ? Vérifions ensemble.",
    en: "🎯 Is ZedCheckout right for you? Let's find out."
  },
  'zed-process': {
    fr: "⚡ L'intégration prend 24h. Ton URL pour commencer ?",
    en: "⚡ Integration takes 24h. Your URL to get started?"
  },
  'zed-faq': {
    fr: "🤔 Une question ? Je suis là pour t'aider.",
    en: "🤔 Any questions? I'm here to help."
  },
  'zed-cta': {
    fr: "⚡ Dernière question : ton URL pour vérifier la compatibilité ?",
    en: "⚡ Last question: your URL to check compatibility?"
  },
  'default': {
    fr: "👋 Salut ! C'est quoi l'URL de ton site ?",
    en: "👋 Hey! What's your website URL?"
  }
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
};

// URL detection and extraction helper
const detectAndExtractURL = (text: string): { isURL: boolean; url?: string; domain?: string } => {
  // Match URLs with or without protocol
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?)/gi;
  const match = text.match(urlRegex);
  
  if (match && match.length > 0) {
    let url = match[0];
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      const urlObj = new URL(url);
      return {
        isURL: true,
        url: url,
        domain: urlObj.hostname.replace('www.', '')
      };
    } catch (e) {
      return { isURL: false };
    }
  }
  
  return { isURL: false };
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
  const [pendingResearch, setPendingResearch] = useState<PendingResearch | null>(null);
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  
  // Toast notification states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasUnreadToast, setHasUnreadToast] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toastShownTime, setToastShownTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userHasTyped = useRef<boolean>(false);
  const simulationTimeouts = useRef<NodeJS.Timeout[]>([]);
  const isSimulating = useRef<boolean>(false);
  const slowResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slowTypingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldContinueSlowTyping = useRef<boolean>(false);

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

  // Human-like typing simulation for slow responses (continuous loop)
  const startSlowTypingSimulation = useCallback(() => {
    shouldContinueSlowTyping.current = true;
    
    const runTypingCycle = () => {
      if (!shouldContinueSlowTyping.current) return;
      
      // Phase 1: Pause (thinking)
      setIsTyping(false);
      const pauseDuration = 800 + Math.random() * 700; // 800-1500ms pause
      
      slowTypingIntervalRef.current = setTimeout(() => {
        if (!shouldContinueSlowTyping.current) return;
        
        // Phase 2: Typing
        setIsTyping(true);
        const typingDuration = 1500 + Math.random() * 1500; // 1500-3000ms typing
        
        slowTypingIntervalRef.current = setTimeout(() => {
          if (!shouldContinueSlowTyping.current) return;
          
          // Continue the cycle
          runTypingCycle();
        }, typingDuration);
      }, pauseDuration);
    };
    
    runTypingCycle();
  }, []);

  const stopSlowTypingSimulation = useCallback(() => {
    shouldContinueSlowTyping.current = false;
    if (slowTypingIntervalRef.current) {
      clearTimeout(slowTypingIntervalRef.current);
      slowTypingIntervalRef.current = null;
    }
  }, []);

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

  // Auto-fill first message when opening from toast
  useEffect(() => {
    if (isOpen && toastMessage && messages.length === 0) {
      // Add toast message as first bot message with contextual suggestions
      const suggestions = currentSection === 'zed-cta' 
        ? ["https://mon-site.com", "Je veux en savoir plus", "Combien ça coûte ?"]
        : ["https://mon-site.com", "Pourquoi ?", "C'est quoi ZedCheckout ?"];
        
      setMessages([{
        id: Date.now().toString(),
        text: toastMessage,
        sender: 'bot',
        timestamp: new Date(),
        suggestedReplies: suggestions
      }]);
      
      setConversationHistory([{
        role: 'assistant',
        content: toastMessage,
      }]);
      
      trackEvent('chat_opened_from_toast', {
        section: currentSection,
        toastMessage
      });
    } else if (isOpen && messages.length === 0 && !toastMessage) {
      // Fallback if opened without toast (direct icon click)
      trackEvent('chat_opened_direct');
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        stopSlowTypingSimulation();
        trackEvent('chat_closed_keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stopSlowTypingSimulation]);

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
      
      // Detect mobile
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Keyboard detection for mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        const isKeyboard = window.visualViewport 
          ? window.visualViewport.height < window.innerHeight * 0.75 
          : false;
        setKeyboardVisible(isKeyboard);
      };
      
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  // Typing simulation function
  const simulateTyping = useCallback((text: string) => {
    // Clear any existing simulation
    simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    simulationTimeouts.current = [];
    
    isSimulating.current = true;
    
    // Focus the input (without opening chat)
    inputRef.current?.focus();
    
    // Type character by character
    let currentIndex = 0;
    const typeNextChar = () => {
      if (!isSimulating.current) return;
      
      if (currentIndex < text.length) {
        setInputValue(text.substring(0, currentIndex + 1));
        currentIndex++;
        const timeout = setTimeout(typeNextChar, 80 + Math.random() * 40); // 80-120ms per char
        simulationTimeouts.current.push(timeout);
      } else {
        // Finished typing, wait a moment then erase
        const eraseTimeout = setTimeout(() => {
          if (!isSimulating.current) return;
          
          // Erase character by character
          const eraseNextChar = () => {
            if (!isSimulating.current) return;
            
            setInputValue(prev => {
              if (prev.length > 0) {
                const timeout = setTimeout(eraseNextChar, 40 + Math.random() * 20); // 40-60ms per char (faster erase)
                simulationTimeouts.current.push(timeout);
                return prev.substring(0, prev.length - 1);
              }
              isSimulating.current = false;
              return '';
            });
          };
          
          eraseNextChar();
        }, 1500); // Wait 1.5s before erasing
        simulationTimeouts.current.push(eraseTimeout);
      }
    };
    
    typeNextChar();
  }, []);

  // Listen for typing simulation trigger
  useEffect(() => {
    const handleSimulateTyping = (event: CustomEvent) => {
      const textToType = event.detail?.text || "Demandez ce que vous voulez...";
      simulateTyping(textToType);
    };
    
    window.addEventListener('simulateTyping' as any, handleSimulateTyping as EventListener);
    
    return () => {
      window.removeEventListener('simulateTyping' as any, handleSimulateTyping as EventListener);
      // Clean up all simulation timeouts
      simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
      // Clean up slow response timeout
      if (slowResponseTimeoutRef.current) {
        clearTimeout(slowResponseTimeoutRef.current);
      }
      // Clean up slow typing simulation
      stopSlowTypingSimulation();
    };
  }, [simulateTyping, stopSlowTypingSimulation]);

  // Toast notification trigger (replaces old greeting logic)
  const showToastNotification = useCallback(async () => {
    if (hasGreeted || isOpen || showToast) return;
    
    const sectionContext = SECTION_DESCRIPTIONS[currentSection]?.[locale] || SECTION_DESCRIPTIONS.default[locale];
    
    // Déterminer le type de message en fonction de l'historique
    const isReturningUser = messages.length > 0;
    
    const notificationMessage = isReturningUser
      ? (locale === 'fr' 
          ? "Ravi de vous revoir, est ce que je peux vous aider ?"
          : "Nice to see you again, can I help you?")
      : (locale === 'fr'
          ? "Bonjour, c'est votre première visite ?"
          : "Hello, is this your first visit?");
    
    try {
      setToastMessage(notificationMessage);
      setShowToast(true);
      setHasUnreadToast(true);
      setHasGreeted(true);
      setToastShownTime(Date.now());
      
      trackEvent('toast_shown', { 
        trigger: 'auto',
        section: currentSection,
        message: notificationMessage,
        isReturningUser
      });
      
      // Auto-hide toast after 8 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 8000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [hasGreeted, isOpen, showToast, currentSection, locale, messages.length]);

  // Natural toast trigger: wait 10s, cancel if user types OR chat opens
  useEffect(() => {
    if (!hasGreeted && !isOpen) {
      userHasTyped.current = false;
      
      // Trigger 1: 10 seconds delay
      greetingTimeoutRef.current = setTimeout(() => {
        if (!userHasTyped.current) {
          showToastNotification();
        }
      }, 10000);
      
      // Trigger 2: Scroll to checkout section
      const handleScroll = () => {
        const checkoutSection = document.getElementById('zed-cta');
        if (checkoutSection) {
          const rect = checkoutSection.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            showToastNotification();
          }
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        if (greetingTimeoutRef.current) {
          clearTimeout(greetingTimeoutRef.current);
          greetingTimeoutRef.current = null;
        }
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [hasGreeted, isOpen, showToastNotification]);

  const addBotMessage = (text: string, suggestedReplies?: string[]) => {
    setError(null);
    
    // Clear any existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    simulationTimeouts.current = [];

    // Calculate total typing time based on message length
    const wordCount = text.split(/\s+/).length;
    const baseDelay = Math.min(wordCount * 400, 2500); // 200ms per word, max 2.5s
    const variance = Math.random() * 500; // up to 300ms random
    const totalTypingTime = baseDelay + variance;

    // Create hesitation pattern: typing pauses to simulate human-like thinking
    const hesitations = Math.floor(Math.random() * 3) + 1; // 1-3 hesitations
    
    interface TypingPhase {
      isTyping: boolean;
      duration: number;
    }
    
    const sequence: TypingPhase[] = [];
    let remainingTime = totalTypingTime;

    // Build alternating pause/typing sequence
    for (let i = 0; i < hesitations; i++) {
      const pauseDuration = 150 + Math.random() * 120; // 150-270ms pause
      const typingDuration = (totalTypingTime / (hesitations + 1)) + Math.random() * 140;

      if (remainingTime < pauseDuration + typingDuration) break;

      sequence.push({ isTyping: false, duration: pauseDuration });
      sequence.push({ isTyping: true, duration: typingDuration });

      remainingTime -= (pauseDuration + typingDuration);
    }
    
    // Final pause before last typing burst
    sequence.push({ isTyping: false, duration: 120 + Math.random() * 90 });
    // Final typing phase with remaining time
    const finalTypingDuration = Math.max(200, remainingTime);
    sequence.push({ isTyping: true, duration: finalTypingDuration });

    // Execute the typing sequence
    let cumulativeDelay = 0;

    sequence.forEach((phase, index) => {
      const timeout = setTimeout(() => {
        setIsTyping(phase.isTyping);

        // On the last phase, show the message after the typing duration
        if (index === sequence.length - 1) {
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
          }, phase.duration);
        }
      }, cumulativeDelay);
      
      simulationTimeouts.current.push(timeout);
      cumulativeDelay += phase.duration;
    });
  };

  const addUserMessage = (text: string) => {
    const messageId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: messageId,
        text,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
      },
    ]);
    
    return messageId;
  };

  // 🔥 RESEARCH HANDLER - The magic happens here
  const handleResearch = async (
    researchId: string,
    researchType: ResearchType,
    query: string,
    originalUserMessage: string
  ) => {
    try {
      trackEvent('research_started', { type: researchType });
      
      // Call research API
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: researchType,
          query,
          context: `Conversation about ZedCheckout. User message: "${originalUserMessage}"`,
          userWebsite: leadData.website,
          leadData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Research failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update research status
        setPendingResearch(prev => 
          prev?.id === researchId 
            ? { ...prev, status: 'completed', result: data }
            : prev
        );
        
        trackEvent('research_completed', { type: researchType });
        
        // Now call Claude again with the research results
        await injectResearchResults(data, originalUserMessage);
      } else {
        throw new Error(data.error || 'Research failed');
      }
      
    } catch (error) {
      console.error('Research error:', error);
      
      setPendingResearch(prev => 
        prev?.id === researchId 
          ? { ...prev, status: 'error' }
          : prev
      );
      
      trackEvent('research_error', { type: researchType });
    }
  };

  // Inject research results back into conversation
  const injectResearchResults = async (researchData: any, originalUserMessage: string) => {
    try {
      // Add a natural follow-up message from bot
      const followUpContext = `[SYSTEM: You just completed a research. Here are the results:
${JSON.stringify(researchData.data, null, 2)}

Summary: ${researchData.summary}

Now provide a natural follow-up message to the user based on these research findings. Be conversational, like "Ah j'ai fini de checker ton site !" or "Ok j'ai vérifié avec l'équipe..."]`;
      
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: followUpContext,
          conversationHistory: [
            ...conversationHistory,
            { role: 'user', content: originalUserMessage },
          ],
          leadData,
          sectionContext: currentSection,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.response) {
          // Add the research-enhanced response
          addBotMessage(data.response.message, data.response.suggestedReplies);
          
          setConversationHistory(prev => [
            ...prev,
            { role: 'assistant', content: data.response.message },
          ]);
          
          // Clear pending research
          setPendingResearch(null);
          
          trackEvent('research_injected', {
            hasNewData: !!(data.response.extractedData && Object.keys(data.response.extractedData).length > 0),
          });
        }
      }
      
    } catch (error) {
      console.error('Error injecting research:', error);
      // Clear pending research even on error
      setPendingResearch(null);
    }
  };

  const callAI = async (userMessage: string, isRetry: boolean = false, messageId?: string) => {
    try {
      setError(null);
      
      // Start human-like typing simulation after 5s if no response
      slowResponseTimeoutRef.current = setTimeout(() => {
        startSlowTypingSimulation();
        trackEvent('slow_response_typing_shown', { 
          messageLength: userMessage.length,
          conversationLength: conversationHistory.length 
        });
      }, 5000);
      
      // Detect if message contains URL
      const urlDetection = detectAndExtractURL(userMessage);
      
      trackEvent('message_sent', { 
        messageLength: userMessage.length,
        isRetry,
        conversationLength: conversationHistory.length,
        currentSection,
        containsURL: urlDetection.isURL,
        domain: urlDetection.domain
      });
      
      // Add section context to the first message
      const sectionContext = SECTION_DESCRIPTIONS[currentSection]?.[locale] || SECTION_DESCRIPTIONS.default[locale];
      
      // Step 1→2: sending → sent (when API call starts)
      if (messageId) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, status: 'sent' as const } : m
        ));
        
        // Step 2→3: sent → delivered (after 300ms)
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, status: 'delivered' as const } : m
          ));
          
          // Step 3→4: delivered → read (after another 300ms)
          setTimeout(() => {
            setMessages(prev => prev.map(m => 
              m.id === messageId ? { ...m, status: 'read' as const } : m
            ));

            setTimeout(() => {
              setIsTyping(false);
            }, DELAY_OPTIONS[Math.floor(Math.random() * DELAY_OPTIONS.length)]);
          }, DELAY_OPTIONS[Math.floor(Math.random() * DELAY_OPTIONS.length)]);
        }, DELAY_OPTIONS[Math.floor(Math.random() * DELAY_OPTIONS.length)]);
      }
      
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
      
      // Clear slow response timeout and stop slow typing simulation on success
      if (slowResponseTimeoutRef.current) {
        clearTimeout(slowResponseTimeoutRef.current);
        slowResponseTimeoutRef.current = null;
      }
      stopSlowTypingSimulation();
      
      if (data.success && data.response) {
        const aiResponse = data.response;
        
        // Reset retry count on success
        setRetryCount(0);
        
        // Now show typing indicator, then AI message
        // addBotMessage already handles typing with setIsTyping(true)
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
              emotionalState: aiResponse.emotionalState,
              hasWebsite: !!newData.website,
            });
            
            return merged;
          });
        }
        
        // Track emotional state for analytics
        if (aiResponse.emotionalState) {
          trackEvent('emotional_state_detected', {
            state: aiResponse.emotionalState,
            messageNumber: conversationHistory.length / 2,
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
        
        // 🔥 MAGIC: Check if AI needs research
        if (aiResponse.needsResearch && aiResponse.researchType && aiResponse.researchQuery) {
          const researchId = `research_${Date.now()}`;
          
          // Set pending research state
          setPendingResearch({
            id: researchId,
            type: aiResponse.researchType,
            query: aiResponse.researchQuery,
            context: `User: ${userMessage}\nAI: ${aiResponse.message}\n\nConversation context: ${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}`,
            startedAt: Date.now(),
            status: 'pending',
          });
          
          trackEvent('research_triggered', {
            type: aiResponse.researchType,
            confidence: aiResponse.confidence,
          });
          
          // Start research in background
          handleResearch(researchId, aiResponse.researchType, aiResponse.researchQuery, userMessage);
        }
      } else {
        throw new Error('Réponse invalide du serveur');
      }
      
    } catch (error: any) {
      console.error('Error calling AI:', error);
      
      // Clear slow response timeout and stop slow typing simulation on error
      if (slowResponseTimeoutRef.current) {
        clearTimeout(slowResponseTimeoutRef.current);
        slowResponseTimeoutRef.current = null;
      }
      stopSlowTypingSimulation();
      
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
          callAI(userMessage, true, messageId);
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
    
    // Prepare summary message with neuroscience techniques
    const summaryParts = [];
    if (leadData.website) summaryParts.push(`🌐 ${leadData.website}`);
    if (leadData.firstName) summaryParts.push(`👤 ${leadData.firstName}`);
    if (leadData.email) summaryParts.push(`📧 ${leadData.email}`);
    if (leadData.phone) summaryParts.push(`📱 ${leadData.phone}`);
    if (leadData.company) summaryParts.push(`🏢 ${leadData.company}`);
    if (leadData.platform) summaryParts.push(`🛒 ${leadData.platform}`);
    if (leadData.monthlyRevenue) summaryParts.push(`💰 ${leadData.monthlyRevenue}/mois`);
    if (leadData.cartValue) summaryParts.push(`🛍️ Panier moyen: ${leadData.cartValue}`);
    
    // Direct and concise summary
    const summaryMessage = summaryParts.length > 0
      ? `Parfait ${leadData.firstName || ''} ! 🎉\n\n${summaryParts.join('\n')}\n\nNotre équipe analyse et te recontacte${leadData.email ? ` à ${leadData.email}` : ''}.`
      : `Parfait ! 🎉\n\nNotre équipe te recontacte très vite.`;
    
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
    
    // Clear all timeouts
    if (slowResponseTimeoutRef.current) {
      clearTimeout(slowResponseTimeoutRef.current);
      slowResponseTimeoutRef.current = null;
    }
    stopSlowTypingSimulation();
    
    setMessages([]);
    setLeadData({});
    setConversationHistory([]);
    setHasGreeted(false);
    setIsComplete(false);
    setError(null);
    setRetryCount(0);
    setInputValue('');
    setIsTyping(false);
    trackEvent('conversation_reset');
  }, [stopSlowTypingSimulation]);

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
        callAI(lastUserMessage.text, false, lastUserMessage.id);
        trackEvent('manual_retry');
      }
      return;
    }
    
    const messageId = addUserMessage(reply);
    trackEvent('quick_reply_clicked', { reply });
    callAI(reply, false, messageId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isTyping || isComplete) return;

    const userInput = inputValue.trim();
    
    const messageId = addUserMessage(userInput);
    setInputValue('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }

    // Call AI to process the message
    await callAI(userInput, false, messageId);
  };

  const handleToastClick = () => {
    setIsOpen(true);
    setShowToast(false);
    setHasUnreadToast(false);
    
    trackEvent('toast_clicked', { 
      timeVisible: Date.now() - toastShownTime,
      section: currentSection
    });
  };

  const handleToastDismiss = (method: 'button' | 'swipe' | 'timeout') => {
    setShowToast(false);
    
    trackEvent('toast_dismissed', { 
      method,
      timeVisible: Date.now() - toastShownTime,
      section: currentSection
    });
  };

  const handleIconClick = () => {
    setIsOpen(true);
    setHasUnreadToast(false);
    
    trackEvent('icon_clicked', {
      hasUnread: hasUnreadToast,
      section: currentSection
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get WhatsApp message based on conversation context
  const getWhatsAppMessage = () => {
    const baseMsg = "Bonjour ZedCheckout 👋\n\n";
    
    if (leadData.website) {
      return baseMsg + `Je souhaite continuer notre conversation.\n\n` +
        `Mon site : ${leadData.website}\n` +
        `${leadData.firstName ? `Prénom : ${leadData.firstName}\n` : ''}` +
        `${leadData.email ? `Email : ${leadData.email}\n` : ''}` +
        `${leadData.challenge ? `Défi : ${leadData.challenge}\n` : ''}`;
    }
    
    if (leadData.email) {
      return baseMsg + `Je continue notre conversation (${leadData.email})`;
    }
    
    return baseMsg + "Je souhaite être mis en relation avec votre équipe.";
  };

  // Get contextual CTA text based on conversation progress
  const getCTAText = () => {
    const hasWebsite = !!leadData.website;
    const hasEmail = !!leadData.email;
    const hasChallenge = !!leadData.challenge;
    
    if (isComplete && hasEmail && hasWebsite) {
      return "Continuer l'échange sur WhatsApp ✅";
    }
    
    if (hasWebsite && hasChallenge) {
      return "Envoyer ma demande et recevoir mon audit 📊";
    }
    
    if (hasWebsite) {
      return "Finaliser ma configuration ⚙️";
    }
    
    return "Analyser mon cas sur WhatsApp 🔍";
  };

  return (
    <>
      {/* Floating Write Icon - Closed State */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={handleIconClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 25 
            }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
            aria-label={hasUnreadToast ? "Ouvrir le chat (1 message non lu)" : "Ouvrir le chat"}
            aria-expanded={isOpen}
          >
            {/* Glow effect */}
            <div className="absolute -inset-3 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full opacity-50 group-hover:opacity-70 blur-xl transition-opacity animate-pulse" />
            
            {/* Icon button */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center shadow-2xl">
              {/* Pencil/Write icon */}
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              
              {/* Unread badge */}
              {hasUnreadToast && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">1</span>
                </motion.div>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast Notification (Native WhatsApp Style - Top Right) */}
      <AnimatePresence>
        {showToast && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x > 100) {
                handleToastDismiss('swipe');
              }
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-4 right-4 z-50 max-w-[340px] sm:max-w-md"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            <div 
              className="relative cursor-pointer bg-white rounded-lg shadow-2xl overflow-hidden" 
              onClick={handleToastClick}
            >
              {/* Native notification header bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#25D366]" />
                  <span className="text-xs font-medium text-gray-600">ZedCheckout</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToastDismiss('button');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Notification content */}
              <div className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">ZedCheckout Assistant</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{toastMessage}</div>
                  <div className="text-xs text-gray-400 mt-2">Maintenant · Toucher pour répondre</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window (WhatsApp Style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:inset-auto md:bottom-4 md:right-4 md:w-[420px] md:h-[600px] md:rounded-lg md:shadow-2xl overflow-hidden"
          >
            {/* WhatsApp-style container */}
            <div className="relative h-full flex flex-col bg-[#ECE5DD]">
              {/* Header - WhatsApp Green */}
              <div className="relative px-4 py-3 bg-[#075E54] shadow-md flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    stopSlowTypingSimulation();
                    trackEvent('chat_closed', {
                      messageCount: messages.length,
                      hasLeadData: Object.keys(leadData).length > 0,
                    });
                  }}
                  className="text-white md:hidden"
                  aria-label="Retour"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    if (isMobile) {
                      // Mobile: Open WhatsApp directly
                      const phone = "33780978892";
                      const message = getWhatsAppMessage();
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                      trackEvent('header_click_mobile_whatsapp');
                    } else {
                      // Desktop: Show QR modal
                      setShowQRModal(true);
                      trackEvent('header_click_desktop_qr');
                    }
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#075E54]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#075E54]" />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-white font-medium text-base">ZedCheckout</div>
                    <div className="text-white/80 text-xs">en ligne · {isMobile ? 'Toucher pour continuer' : 'Cliquer pour QR'}</div>
                  </div>
                </button>
                
                <div className="flex items-center gap-4">
                  {process.env.NODE_ENV === 'development' && messages.length > 0 && (
                    <button
                      onClick={resetConversation}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label="Reset"
                      title="Reset (dev)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      stopSlowTypingSimulation();
                      trackEvent('chat_closed', {
                        messageCount: messages.length,
                        hasLeadData: Object.keys(leadData).length > 0,
                      });
                    }}
                    className="text-white/80 hover:text-white transition-colors hidden md:block"
                    aria-label="Fermer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages - WhatsApp Background Pattern */}
              <div 
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundColor: '#ECE5DD'
                }}
              >
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%]`}>
                      <div
                        className={`rounded-lg px-3 py-2 shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-[#DCF8C6] text-gray-900 rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</div>
                        <div className={`text-[11px] mt-1 flex items-center justify-end gap-1 ${
                          message.sender === 'user' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.sender === 'user' && message.status && (
                            <span className="flex items-center">
                              {message.status === 'sending' && (
                                <span className="text-gray-400">⏳</span>
                              )}
                              {message.status === 'sent' && (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {message.status === 'delivered' && (
                                <svg className="w-5 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 13l4 4L25 7" />
                                </svg>
                              )}
                              {message.status === 'read' && (
                                <svg className="w-5 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 13l4 4L25 7" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick reply buttons */}
                      {message.sender === 'bot' && 
                       message.suggestedReplies && 
                       message.suggestedReplies.length > 0 && 
                       index === messages.length - 1 && 
                       !isTyping && 
                       !isComplete && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-wrap gap-2 mt-2"
                        >
                          {message.suggestedReplies.map((reply, idx) => (
                            <motion.button
                              key={idx}
                              onClick={() => handleQuickReply(reply)}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[13px] text-gray-700 transition-colors shadow-sm"
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
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* 🔥 Research indicator - The magic visual feedback */}
                {pendingResearch && pendingResearch.status === 'pending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>
                        {pendingResearch.type === 'website_check' && '🔍 Je vérifie ton site...'}
                        {pendingResearch.type === 'platform_compatibility' && '⚙️ Je check la compatibilité...'}
                        {pendingResearch.type === 'market_info' && '📊 Je regarde les stats...'}
                        {pendingResearch.type === 'technical_details' && '🔧 Je demande aux devs...'}
                        {pendingResearch.type === 'competitor_analysis' && '🎯 J\'analyse le marché...'}
                        {pendingResearch.type === 'pricing_research' && '💰 Je check les prix...'}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                {/* Error state */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                      ⚠️ {error}
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              {!isComplete && (
                <form onSubmit={handleSubmit} className="p-2 bg-[#F0F0F0]">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => {
                          if (isSimulating.current) {
                            isSimulating.current = false;
                            simulationTimeouts.current.forEach(timeout => clearTimeout(timeout));
                            simulationTimeouts.current = [];
                          }
                          
                          setInputValue(e.target.value);
                          
                          // Auto-resize
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                          
                          if (!hasGreeted && e.target.value.length > 0) {
                            userHasTyped.current = true;
                            if (greetingTimeoutRef.current) {
                              clearTimeout(greetingTimeoutRef.current);
                              greetingTimeoutRef.current = null;
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }
                        }}
                        disabled={isTyping}
                        placeholder="Message"
                        rows={1}
                        className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-white border-none outline-none text-[15px] text-gray-900 placeholder-gray-500 disabled:opacity-50 resize-none max-h-[120px] overflow-y-auto"
                        style={{ height: '44px' }}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      aria-label="Envoyer"
                      className="flex-shrink-0 w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20BA5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#25D366] flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-2">Parfait ! 🎉</div>
                    <div className="text-sm text-gray-600 mb-4">Continue la conversation sur WhatsApp</div>
                    
                    {/* Mobile: WhatsApp Button */}
                    <div className="md:hidden">
                      <a
                        href={`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('completion_whatsapp_mobile', { hasWebsite: !!leadData.website })}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full font-medium transition-colors shadow-md"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {getCTAText()}
                      </a>
                    </div>
                    
                    {/* Desktop: QR Code */}
                    <div className="hidden md:block">
                      <div className="text-xs text-gray-500 mb-3">Scanne avec ton téléphone</div>
                      <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <QRCodeSVG
                          value={`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`}
                          size={192}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <a
                          href={`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackEvent('completion_whatsapp_desktop', { hasWebsite: !!leadData.website })}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#25D366] hover:text-[#20BA5A] font-medium transition-colors"
                        >
                          {getCTAText()} →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal for Desktop Header Click */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Continuer sur WhatsApp</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <QRCodeSVG
                    value={`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`}
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  Scanne ce code avec ton téléphone pour continuer la conversation sur WhatsApp
                </p>
                
                <div className="flex flex-col gap-2 w-full">
                  <a
                    href={`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent('qr_modal_whatsapp_web');
                      setShowQRModal(false);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ouvrir WhatsApp Web
                  </a>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://wa.me/33780978892?text=${encodeURIComponent(getWhatsAppMessage())}`);
                      trackEvent('qr_modal_copy_link');
                      // Could add a toast here
                    }}
                    className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    Copier le lien
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
