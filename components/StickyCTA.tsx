'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, X, MessageSquare } from 'lucide-react';

/**
 * STICKY CTA COMPONENT
 * 
 * Behavior:
 * - Appears gracefully after scrolling past 100vh
 * - Positioned top-right corner on desktop, bottom on mobile
 * - Subtle pulse animation (1.5s interval)
 * - Can be dismissed but reappears on significant scroll
 * 
 * Psychology:
 * - "Always accessible safety" feeling
 * - Non-intrusive but ever-present
 * - Urgency without fake timers
 */

interface StickyCTAProps {
  /** Viewport height threshold to trigger appearance (default: 1) */
  triggerThreshold?: number;
  /** CTA button text */
  buttonText?: string;
  /** Callback when CTA is clicked */
  onCTAClick?: () => void;
  /** Whether to show on mobile */
  showOnMobile?: boolean;
}

export default function StickyCTA({
  triggerThreshold = 1,
  buttonText,
  onCTAClick,
  showOnMobile = true
}: StickyCTAProps) {
  const t = useTranslations('stickyCTA');
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  
  const { scrollY } = useScroll();
  
  // Track scroll position and direction
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const threshold = viewportHeight * triggerThreshold;
    
    // Determine scroll direction
    if (latest > lastScrollY) {
      setScrollDirection('down');
    } else {
      setScrollDirection('up');
    }
    setLastScrollY(latest);
    
    // Show CTA when scrolled past threshold
    if (latest > threshold && !isDismissed) {
      setIsVisible(true);
    } else if (latest <= threshold * 0.5) {
      // Reset visibility and dismissed state when scrolling back to top
      setIsVisible(false);
      setIsDismissed(false);
    }
    
    // Reappear logic: if dismissed but user scrolls significantly more
    if (isDismissed && latest > lastScrollY + 500) {
      setIsDismissed(false);
      if (latest > threshold) {
        setIsVisible(true);
      }
    }
  });
  
  // Track GA4 events
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }, []);
  
  // Handle CTA click
  const handleClick = useCallback(() => {
    trackEvent('sticky_cta_clicked', {
      scroll_position: lastScrollY,
      scroll_direction: scrollDirection
    });
    
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default: dispatch event to open chat widget
      const event = new CustomEvent('openChatWidget', { detail: { source: 'sticky_cta' } });
      window.dispatchEvent(event);
    }
  }, [trackEvent, lastScrollY, scrollDirection, onCTAClick]);
  
  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
    trackEvent('sticky_cta_dismissed', {
      scroll_position: lastScrollY
    });
  }, [trackEvent, lastScrollY]);
  
  // Don't render on mobile if disabled
  if (!showOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Desktop Version - Top Right */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.4
            }}
            className="hidden md:flex fixed top-6 right-6 z-50 items-center gap-2"
          >
            {/* Main CTA Button */}
            <motion.button
              onClick={handleClick}
              className="relative group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#E88B7A] to-[#D4766A] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Pulse animation ring */}
              <motion.span
                className="absolute inset-0 rounded-full bg-[#E88B7A]"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
              
              <MessageSquare className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{buttonText || t('buttonText')}</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            {/* Dismiss button */}
            <motion.button
              onClick={handleDismiss}
              className="p-2 text-[#1E2A47]/40 hover:text-[#1E2A47]/70 hover:bg-white/80 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
          
          {/* Mobile Version - Bottom Bar */}
          {showOnMobile && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                duration: 0.4
              }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent"
            >
              <div className="flex items-center gap-3 max-w-md mx-auto">
                <motion.button
                  onClick={handleClick}
                  className="flex-1 relative group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#E88B7A] to-[#D4766A] text-white font-semibold rounded-2xl shadow-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Pulse animation ring */}
                  <motion.span
                    className="absolute inset-0 rounded-2xl bg-[#E88B7A]"
                    animate={{
                      scale: [1, 1.03, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                  
                  <MessageSquare className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{buttonText || t('buttonTextMobile')}</span>
                </motion.button>
                
                <motion.button
                  onClick={handleDismiss}
                  className="p-3 text-[#1E2A47]/40 hover:text-[#1E2A47]/70 bg-white/80 rounded-xl shadow-md transition-colors"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
