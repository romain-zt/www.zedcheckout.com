'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Pencil, ArrowRight, Sparkles } from 'lucide-react';
import WhatsAppTransformationDemo from './WhatsAppTransformationDemo';
import LeadCaptureForm from './LeadCaptureForm';

/**
 * ZEDHERO - Conversion-Focused Hero Section
 * 
 * KEY FEATURE: The primary CTA morphs into the floating edit icon
 * as the user scrolls, creating a seamless "always present" feeling.
 * 
 * The CTA button in hero position:
 * - Has matching styling with the floating chat icon
 * - Uses same coral/peach gradient
 * - Features the pencil icon for visual continuity
 * 
 * When user scrolls past hero:
 * - CTA "flies" to bottom-right corner
 * - Morphs into compact edit icon
 * - Maintains same brand colors for recognition
 */

export default function ZedHero() {
  const t = useTranslations('zedcheckout.hero');
  const trustBar = t.raw('trustBar') as { item1: string; item2: string; item3: string };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCTAHovered, setIsCTAHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Track scroll for parallax and CTA morphing
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  // Handle CTA click - opens chat widget
  const handleCTAClick = () => {
    const event = new CustomEvent('openChatWidget', { 
      detail: { source: 'hero_cta' } 
    });
    window.dispatchEvent(event);
    
    // Track event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hero_cta_clicked', {
        section: 'zed-hero'
      });
    }
  };

  return (
    <section 
      ref={heroRef}
      id="zed-hero" 
      className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-br from-[#F5EDE4] via-[#FEFAF6] to-[#F5EDE4]"
    >
      {/* Background pattern with parallax */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1E2A47 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </motion.div>

      {/* Animated gradient orbs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#E88B7A]/10 to-[#FFC9B9]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#1E2A47]/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-7xl mx-auto"
        style={{ opacity: contentOpacity }}
      >
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-3 sm:space-y-4"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#1E2A47]">
                {t('title')}
              </h1>
              <motion.h2 
                className="inline-block bg-[#FFC9B9] text-[#1E2A47] text-lg sm:text-xl md:text-2xl font-semibold leading-[1.2] tracking-tight px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                {t('subtitle')}
              </motion.h2>
            </motion.div>

            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#1E2A47]/80"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('description')}
            </motion.p>

            {/* CTAs - Primary button styled to match floating icon */}
            <motion.div
              ref={ctaRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 flex flex-col sm:flex-row gap-4"
            >
              {/* PRIMARY CTA - Matches the floating edit icon style */}
              <motion.button
                onClick={handleCTAClick}
                onMouseEnter={() => setIsCTAHovered(true)}
                onMouseLeave={() => setIsCTAHovered(false)}
                className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 min-h-[60px] bg-gradient-to-r from-[#E88B7A] to-[#D4766A] text-white rounded-2xl font-bold text-lg shadow-xl overflow-hidden group"
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
                  animate={isCTAHovered ? { x: '100%' } : { x: '-100%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                
                {/* Glow pulse */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-2xl blur-lg -z-10"
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.03, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                
                {/* Pencil Icon - Same as floating button */}
                <motion.div
                  className="relative z-10"
                  animate={isCTAHovered ? { rotate: 15 } : { rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Pencil className="w-6 h-6" />
                </motion.div>
                
                {/* Text */}
                <span className="relative z-10">{t('cta_primary')}</span>
                
                {/* Arrow */}
                <motion.div
                  className="relative z-10"
                  animate={isCTAHovered ? { x: 4 } : { x: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                
                {/* Sparkle decoration */}
                <motion.div
                  className="absolute top-2 right-3"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white/60" />
                </motion.div>
              </motion.button>
              
              {/* SECONDARY CTA */}
              <button
                onClick={() => {
                  const whyStaySection = document.getElementById('why-stay');
                  if (whyStaySection) {
                    whyStaySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 min-h-[44px] bg-[#F5EDE4] text-[#1E2A47] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-[#1E2A47] hover:bg-[#1E2A47] hover:text-[#F5EDE4] active:scale-95 sm:hover:scale-105 transition-all duration-300"
              >
                {t('cta_secondary')}
              </button>
            </motion.div>

            {/* Visual connection hint - Arrow pointing to bottom right */}
            <motion.div
              className="hidden sm:flex items-center gap-2 text-sm text-[#1E2A47]/50 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <span>Ce bouton vous suit</span>
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{
                  x: [0, 4, 0],
                  y: [0, 4, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[trustBar.item1, trustBar.item2, trustBar.item3].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E88B7A] flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-[#1E2A47]/70">
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: WhatsApp Demo (Desktop only) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <WhatsAppTransformationDemo />
          </motion.div>
        </div>

        {/* Mobile WhatsApp Demo - smaller and optimized */}
        <motion.div
          className="lg:hidden mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="max-w-[280px] sm:max-w-sm mx-auto">
            <WhatsAppTransformationDemo />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-[#1E2A47]/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs font-medium">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
