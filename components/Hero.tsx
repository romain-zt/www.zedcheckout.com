'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import WhatsAppTransformationDemo from './WhatsAppTransformationDemo';
import SimpleContactForm from './SimpleContactForm';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Track scroll depth with GA4 event "hero_viewed"
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
              window.gtag('event', 'hero_viewed', {
                event_category: 'engagement',
                event_label: 'hero_section',
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[85vh] flex items-center justify-center px-6 pt-24 lg:pt-32 pb-16 overflow-hidden bg-[#F5EDE4]"
    >
      {/* Background: Faded cold catalog */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 grayscale">
              <Package className="w-8 h-8 text-gray-400" />
              <div className="text-xs text-gray-400 px-2 py-1 bg-gray-200 rounded">
                Ajouter au panier
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Layout: Left 60% Content + Right 40% WhatsApp Demo */}
        <div className="grid lg:grid-cols-[60%_40%] gap-12 items-start">
          
          {/* LEFT COLUMN: Content */}
          <div className="space-y-8 text-left">
            
            {/* Lab Positioning Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-white/60 backdrop-blur-sm border border-[#1E2A47]/20 rounded-full shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="text-xl sm:text-2xl">🔬</span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-[#1E2A47]">
                {t('labPositioning')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-[#1E2A47] via-[#3D5A7F] to-[#E88B7A] bg-clip-text text-transparent">
                {t('headline')}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-lg lg:text-2xl font-medium leading-relaxed text-[#1E2A47]/85"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('subheadline')}
            </motion.p>

            {/* Value Props (Bullets) */}
            <motion.ul 
              className="space-y-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {(t.raw('valueProps') as string[]).map((prop, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#E88B7A] flex-shrink-0 mt-0.5" />
                  <span className="text-lg lg:text-xl font-medium text-[#1E2A47]/90">
                    {prop}
                  </span>
                </li>
              ))}
            </motion.ul>

            {/* CTA Block */}
            <motion.div 
              className="pt-4 space-y-4 max-w-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Context */}
              <p className="text-sm lg:text-base text-[#1E2A47]/70 font-medium">
                {t('cta.context')}
              </p>
              
              {/* Primary CTA Button */}
              <button
                onClick={() => setIsFormOpen(true)}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[44px] bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t('cta.button')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* Secondary CTA - Stakeholder Link */}
              <a
                href="#stakeholders"
                className="block text-center text-sm sm:text-base lg:text-lg text-[#1E2A47]/80 font-semibold hover:text-[#E88B7A] transition-colors duration-300 group min-h-[44px] flex items-center justify-center"
              >
                <span className="inline-flex items-center gap-2">
                  {t('ctaSecondary')}
                  <svg className="w-4 h-4 transform group-hover:translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </a>

              {/* Subtext */}
              <p className="text-xs lg:text-sm text-[#1E2A47]/60 text-center">
                {t('cta.subtext')}
              </p>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: WhatsApp Demo (Desktop) */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
              <WhatsAppTransformationDemo />

          </motion.div>
        </div>

        {/* MOBILE: WhatsApp Demo at Bottom */}
        <motion.div
          className="lg:hidden mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="max-w-xs mx-auto rounded-3xl">
            <WhatsAppTransformationDemo />
          </div>
        </motion.div>
      </div>

      <SimpleContactForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
