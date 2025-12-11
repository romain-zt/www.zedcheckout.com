'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Constat() {
  const t = useTranslations('home.constat');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Track section view with GA4 event
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'constat_viewed', {
          event_category: 'engagement',
          event_label: 'constat_section',
        });
      }
    }
  }, [isInView]);

  // Track card hovers
  const handleCardHover = (label: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'constat_card_hover', {
        event_category: 'engagement',
        event_label: label,
      });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-gradient-to-b from-[#1E2A47] to-[#0F172A] py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#F5EDE4/5_1px,transparent_1px),linear-gradient(to_bottom,#F5EDE4/5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Headline */}
        <motion.h2
          className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-20 tracking-tighter leading-none text-[#F5EDE4]"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('headline')}
        </motion.h2>

        {/* 3 Observation Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card 1: Catalogues */}
          <motion.div
            className="relative bg-[#0F172A]/50 backdrop-blur-sm border-2 border-[#F5EDE4]/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:ring-2 hover:ring-[#E88B7A]/30 hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => handleCardHover('catalogues')}
          >
            {/* Number badge */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center text-white font-black text-xl shadow-lg">
              1
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-[#F5EDE4] mb-6 leading-tight">
              {t('card1_title')}
            </h3>

            <div className="space-y-4 text-[#F5EDE4]/80">
              <p className="text-sm md:text-base font-semibold">
                <span className="font-black">Avant :</span> {t('card1_before')}
              </p>
              
              <p className="text-sm md:text-base font-semibold">
                <span className="font-black">Aujourd'hui :</span> {t('card1_today')}
              </p>
              
              <div className="pt-4 border-t border-[#F5EDE4]/20">
                <p className="text-base md:text-lg font-black text-[#FFC9B9]">
                  Résultat : {t('card1_result')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Checkouts */}
          <motion.div
            className="relative bg-[#0F172A]/50 backdrop-blur-sm border-2 border-[#F5EDE4]/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:ring-2 hover:ring-[#E88B7A]/30 hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => handleCardHover('checkouts')}
          >
            {/* Number badge */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center text-white font-black text-xl shadow-lg">
              2
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-[#F5EDE4] mb-6 leading-tight">
              {t('card2_title')}
            </h3>

            <div className="space-y-4 text-[#F5EDE4]/80">
              <p className="text-sm md:text-base font-semibold">
                <span className="font-black">Avant :</span> {t('card2_before')}
              </p>
              
              <p className="text-sm md:text-base font-semibold">
                <span className="font-black">Aujourd'hui :</span> {t('card2_today')}
              </p>
              
              <div className="pt-4 border-t border-[#F5EDE4]/20">
                <p className="text-base md:text-lg font-black text-[#FFC9B9]">
                  Résultat : {t('card2_result')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: IAs */}
          <motion.div
            className="relative bg-[#0F172A]/50 backdrop-blur-sm border-2 border-[#F5EDE4]/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:ring-2 hover:ring-[#E88B7A]/30 hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => handleCardHover('ias')}
          >
            {/* Number badge */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center text-white font-black text-xl shadow-lg">
              3
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-[#F5EDE4] mb-6 leading-tight">
              {t('card3_title')}
            </h3>

            <div className="space-y-4 text-[#F5EDE4]/80">
              <p className="text-sm md:text-base font-semibold">
                {t('card3_content1')}
              </p>
              
              <p className="text-sm md:text-base font-semibold">
                {t('card3_content2')}
              </p>
              
              <div className="pt-4 border-t border-[#F5EDE4]/20">
                <p className="text-base md:text-lg font-black text-[#FFC9B9]">
                  Résultat : {t('card3_result')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quote */}
        {/* <motion.blockquote
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-2xl md:text-4xl italic text-[#E88B7A] font-light leading-relaxed mb-6">
            "{t('quote')}"
          </p>
          <cite className="text-lg md:text-xl text-[#0F172A] not-italic font-semibold">
            {t('quote_author')}
          </cite>
        </motion.blockquote> */}
      </div>
    </section>
  );
}
