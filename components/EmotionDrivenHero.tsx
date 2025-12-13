'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Shield, Clock, Sparkles } from 'lucide-react';

/**
 * EMOTION-DRIVEN HERO SECTION
 * 
 * Design Philosophy:
 * - Zen-like, breathing white space
 * - Visitor feels understood before reading a single word
 * - Relief + curiosity emotional triggers
 * - Low friction = immediate action
 * 
 * Psychology Triggers:
 * - Exclusivity: Limited early access
 * - Social proof: Subtle beta user count
 * - Relief: No coding required mention
 */

interface HeroConfig {
  headline: {
    text: string;
    emotion: 'relief' | 'curiosity' | 'urgency';
  };
  subheadline: {
    text: string;
    emotion: 'loss_aversion' | 'fomo' | 'aspiration';
  };
  inputField: {
    placeholder: string;
    buttonText: string;
  };
  psychologyTriggers: {
    exclusivity: string;
    socialProof: string;
    relief: string;
  };
}

export default function EmotionDrivenHero() {
  const t = useTranslations('emotionHero');
  const locale = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Scroll-based parallax effect
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Track GA4 events
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  };
  
  // Handle CTA click - opens chat widget with URL
  const handleCTAClick = () => {
    if (!inputValue.trim()) {
      inputRef.current?.focus();
      return;
    }
    
    trackEvent('hero_cta_clicked', {
      has_url: inputValue.includes('.'),
      input_length: inputValue.length
    });
    
    // Dispatch event to open chat widget with pre-filled URL
    const event = new CustomEvent('openChatWithURL', {
      detail: { url: inputValue.trim() }
    });
    window.dispatchEvent(event);
    
    setHasInteracted(true);
  };
  
  // Handle input focus/blur for emotion tracking
  const handleInputFocus = () => {
    setIsInputFocused(true);
    trackEvent('hero_input_focused');
  };
  
  const handleInputBlur = () => {
    setIsInputFocused(false);
  };
  
  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCTAClick();
    }
  };
  
  return (
    <section
      ref={heroRef}
      id="emotion-hero"
      className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background: Zen gradient with breathing animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#FEFAF6] via-[#F5EDE4] to-[#FFF8F5]"
        style={{ y: backgroundY, opacity }}
      >
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #1E2A47 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Breathing glow effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(232, 139, 122, 0.08) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        
        {/* Exclusivity Badge - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#E88B7A]/20 rounded-full text-sm font-medium text-[#1E2A47]/80 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E88B7A]" />
            {t('exclusivityBadge')}
          </span>
        </motion.div>
        
        {/* Headline - Relief + Curiosity Emotion */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#1E2A47] mb-6"
        >
          <span className="block">{t('headline.line1')}</span>
          <span className="block mt-2 bg-gradient-to-r from-[#E88B7A] to-[#D4766A] bg-clip-text text-transparent">
            {t('headline.line2')}
          </span>
        </motion.h1>
        
        {/* Subheadline - Loss Aversion Trigger */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-[#1E2A47]/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t('subheadline')}
        </motion.p>
        
        {/* Integrated Input Field with Embedded Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div 
            className={`
              relative flex items-center bg-white rounded-2xl shadow-lg transition-all duration-300
              ${isInputFocused ? 'ring-2 ring-[#E88B7A]/50 shadow-xl' : 'hover:shadow-xl'}
            `}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              className="flex-1 px-6 py-5 text-base sm:text-lg text-[#1E2A47] placeholder-[#1E2A47]/40 bg-transparent border-none outline-none rounded-l-2xl"
            />
            <button
              onClick={handleCTAClick}
              className="flex-shrink-0 m-2 px-6 py-3 bg-gradient-to-r from-[#E88B7A] to-[#D4766A] hover:from-[#D4766A] hover:to-[#C4665A] text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <span className="hidden sm:inline">{t('ctaButton')}</span>
              <span className="sm:hidden">Go</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Input Helper Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isInputFocused ? 1 : 0.6 }}
            className="mt-3 text-sm text-[#1E2A47]/60"
          >
            {t('inputHelper')}
          </motion.p>
        </motion.div>
        
        {/* Psychology Triggers - Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#1E2A47]/60"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#E88B7A]" />
            <span>{t('trustIndicators.noCode')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E88B7A]" />
            <span>{t('trustIndicators.setupTime')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E88B7A]" />
            <span>{t('trustIndicators.limitedSpots')}</span>
          </div>
        </motion.div>
        
        {/* Social Proof - Subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 pt-8 border-t border-[#1E2A47]/10"
        >
          <div className="flex items-center justify-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E88B7A]/30 to-[#FFC9B9]/50 border-2 border-white flex items-center justify-center text-xs font-medium text-[#1E2A47]"
                >
                  {['JD', 'ML', 'PK', 'SA'][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#1E2A47]/60">
              {t('socialProof')}
            </p>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-[#1E2A47]/40"
          >
            <span className="text-xs font-medium">{t('scrollHint')}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
