'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Pencil, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

/**
 * UNIFIED CTA - The WOW Effect Component
 * 
 * This component creates a seamless morphing effect between:
 * 1. Hero CTA Button (full width, prominent)
 * 2. Floating Edit Icon (compact, always visible)
 * 
 * The transition happens based on scroll position creating
 * a spectacular "shape-shifting" effect that keeps the CTA
 * always accessible while never feeling intrusive.
 * 
 * Psychology:
 * - Continuous presence = trust & accessibility
 * - Morphing effect = delight & surprise
 * - Edit icon = "start your story" metaphor
 */

interface UnifiedCTAProps {
  /** Text to show in the hero CTA */
  heroText?: string;
  /** Callback when clicked */
  onCTAClick?: () => void;
  /** Show glow effect */
  showGlow?: boolean;
}

export default function UnifiedCTA({
  heroText = "Voir comment ça marche",
  onCTAClick,
  showGlow = true
}: UnifiedCTAProps) {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [shouldWobble, setShouldWobble] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  
  // Smooth spring animations for position
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  
  // Track hero visibility based on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const heroBottom = rect.bottom;
        const threshold = window.innerHeight * 0.3;
        
        // Hero is visible when the bottom of the hero section is still in view
        setIsHeroVisible(heroBottom > threshold);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Periodic wobble animation when floating
  useEffect(() => {
    if (!isHeroVisible && !hasInteracted) {
      const triggerWobble = () => {
        setShouldWobble(true);
        setTimeout(() => setShouldWobble(false), 600);
        
        const nextDelay = 3000 + Math.random() * 2000;
        setTimeout(triggerWobble, nextDelay);
      };
      
      const initialDelay = 2000 + Math.random() * 1000;
      const timeoutId = setTimeout(triggerWobble, initialDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isHeroVisible, hasInteracted]);
  
  // Track events
  const trackEvent = useCallback((eventName: string, props?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, props);
    }
  }, []);
  
  // Handle click
  const handleClick = useCallback(() => {
    setHasInteracted(true);
    
    trackEvent('unified_cta_clicked', {
      mode: isHeroVisible ? 'hero' : 'floating',
      scroll_position: window.scrollY
    });
    
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default: open chat widget
      const event = new CustomEvent('openChatWidget', { detail: { source: 'unified_cta' } });
      window.dispatchEvent(event);
    }
  }, [isHeroVisible, onCTAClick, trackEvent]);
  
  return (
    <>
      {/* Hero Anchor - Invisible placeholder that marks position */}
      <div ref={heroRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      
      {/* The Morphing CTA */}
      <AnimatePresence mode="wait">
        {isHeroVisible ? (
          /* HERO MODE - Full CTA Button */
          <motion.button
            key="hero-cta"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.5,
              y: 50,
              x: 100,
              transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }}
            className="relative group inline-flex items-center justify-center gap-3 px-8 py-5 min-h-[60px] bg-gradient-to-r from-[#E88B7A] to-[#D4766A] text-white rounded-2xl font-bold text-lg shadow-xl overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#FFC9B9] via-[#E88B7A] to-[#D4766A]"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ backgroundSize: '200% 100%' }}
            />
            
            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '100%' } : { x: '-100%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            
            {/* Glow pulse */}
            {showGlow && (
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-2xl blur-lg"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
            
            {/* Icon */}
            <motion.div
              className="relative z-10"
              animate={isHovered ? { rotate: 15 } : { rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Pencil className="w-6 h-6" />
            </motion.div>
            
            {/* Text */}
            <span className="relative z-10">{heroText}</span>
            
            {/* Arrow */}
            <motion.div
              className="relative z-10"
              animate={isHovered ? { x: 4 } : { x: 0 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        ) : (
          /* FLOATING MODE - Compact Edit Icon */
          <motion.button
            key="floating-cta"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ 
              opacity: 0, 
              scale: 0.3,
              x: -100,
              y: -100
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: 0,
              y: 0,
              ...(shouldWobble && {
                rotate: [0, -5, 5, -5, 5, -3, 3, 0],
                x: [0, -3, 3, -3, 3, -2, 2, 0]
              })
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5,
              transition: { duration: 0.3 }
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: 0.5
            }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
            aria-label="Démarrer une conversation"
          >
            {/* Outer glow ring - pulsing */}
            <motion.div
              className="absolute -inset-3 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full opacity-50 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Main button container */}
            <motion.div 
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#D4766A] flex items-center justify-center shadow-2xl cursor-pointer"
              whileHover={{ 
                scale: 1.1,
                boxShadow: '0 20px 40px -10px rgba(232, 139, 122, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Inner gradient animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC9B9] via-[#E88B7A] to-[#D4766A]"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ opacity: 0.7 }}
              />
              
              {/* Pencil icon */}
              <motion.div
                animate={isHovered ? { 
                  rotate: [0, -15, 15, 0],
                  scale: 1.1
                } : {
                  rotate: 0,
                  scale: 1
                }}
                transition={{ duration: 0.4 }}
              >
                <Pencil className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
              </motion.div>
            </motion.div>
            
            {/* Tooltip on hover - Desktop */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                >
                  <div className="bg-[#1E2A47] text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFC9B9]" />
                      <span>Discutons de votre projet</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-l-8 border-l-[#1E2A47] border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Notification dot - optional */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
            >
              <motion.div
                className="w-2 h-2 bg-emerald-300 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
