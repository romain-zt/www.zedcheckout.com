'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  
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
        <div className="grid md:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-6 sm:space-y-8 md:space-y-12 md:h-full md:pb-16 md:flex md:flex-col md:justify-between">
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-3 sm:space-y-4"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-[#1E2A47]">
                {t('title')}
              </h1>
              <motion.h2 
                className="text-lg sm:text-xl md:text-2xl font-semibold leading-[1.2] tracking-tight text-[#1E2A47]"
                whileHover={{ scale: 1.02 }}
              >
                {t('subtitle')}
              </motion.h2>
            </motion.div>

            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg font-normal leading-relaxed text-[#1E2A47]/70"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('description')}
            </motion.p>

            {/* Demo Input - Glassmorphic */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative"
            >
              <div className="relative flex items-center gap-2 p-3 sm:p-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 bg-transparent text-[#1E2A47] placeholder:text-[#1E2A47]/40 text-base sm:text-lg outline-none min-h-[44px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && demoInput.trim()) {
                      handleCTAClick();
                    }
                  }}
                />
                <motion.button
                  onClick={handleCTAClick}
                  className="flex-shrink-0 p-3 bg-gradient-to-r from-[#E88B7A] to-[#D4766A] text-white rounded-xl hover:shadow-lg transition-shadow min-w-[44px] min-h-[44px] flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pencil className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-sm sm:text-base text-[#1E2A47]/60"
            >
              {t('socialProof')}
            </motion.p>

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

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
