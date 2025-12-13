'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import WhatsAppTransformationDemo from './WhatsAppTransformationDemo';

/**
 * ZEDHERO - Lab Research Identity Hero Section
 * 
 * Brand DNA: ZED TECH is an independent e-commerce research lab
 * Tone: Researcher, not salesperson. Sober, factual, transparent.
 * 
 * Anti-patterns (removed):
 * - Social proof bullshit
 * - Aggressive marketing headlines
 * - Redundant CTAs
 * - Pushy sales promises
 * 
 * Core values:
 * - Rehumanize e-commerce (not just optimize)
 * - Total transparency (assumed limitations)
 * - Demonstration > Presentation
 * - Research > Commercial
 * 
 * CTA Strategy:
 * - The glassmorphic input (ChatWidgetAI) is the ONLY CTA
 * - No redundant buttons
 * - Philosophy: Show don't sell. Try don't pitch.
 */

export default function ZedHero() {
  const t = useTranslations('zedcheckout.hero');
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Track scroll for parallax
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

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
            
            {/* Lab Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="inline-block px-3 py-1 text-xs sm:text-sm uppercase tracking-wide text-[#1E2A47]/60 border border-[#1E2A47]/20 rounded-full">
                {t('labPositioning')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#1E2A47]"
            >
              {t('headline')}
            </motion.h1>

            {/* Try Message - Invitation to demo, not sell */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl leading-relaxed text-[#1E2A47]/70"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('subheadline')}
            </motion.p>

            {/* Note: The glassmorphic input (ChatWidgetAI) is managed separately and appears as floating widget */}
            {/* This is the ONLY CTA - no redundant buttons here */}
          </div>

          {/* RIGHT: WhatsApp Demo (Desktop only) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <WhatsAppTransformationDemo />
          </motion.div>
        </div>

        {/* Mobile WhatsApp Demo */}
        <motion.div
          className="lg:hidden mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="max-w-[280px] sm:max-w-sm mx-auto">
            <WhatsAppTransformationDemo />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
