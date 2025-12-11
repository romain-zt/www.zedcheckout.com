'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function AIParadox() {
  const t = useTranslations('home.aiParadox');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Track section view with GA4 event
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'ai_paradox_viewed', {
          event_category: 'engagement',
          event_label: 'ai_paradox_section',
        });
      }
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-[#0F172A] py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#F5EDE420_1px,transparent_1px),linear-gradient(to_bottom,#F5EDE420_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Headline */}
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-20 tracking-tighter leading-tight text-[#F5EDE4]"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('headline')}
        </motion.h2>

        {/* Split Content: Two Columns */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
          {/* LEFT COLUMN: What everyone does (Cold) */}
          <motion.div
            className="relative bg-white/5 border-2 border-red-500/30 rounded-3xl p-8 md:p-10"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full mb-6">
              <span className="text-red-400 font-black text-sm tracking-wide uppercase">
                {t('cold_badge')}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-black text-[#F5EDE4] mb-8 leading-tight">
              {t('cold_title')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('cold_item1')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('cold_item2')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('cold_item3')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl mt-1">└──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  <span className="font-black text-[#F5EDE4]">{t('cold_result_label')}</span> {t('cold_result')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: What ZedTech does (Warm) */}
          <motion.div
            className="relative bg-white/5 border-2 border-emerald-400/40 rounded-3xl p-8 md:p-10"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-full mb-6">
              <span className="text-emerald-300 font-black text-sm tracking-wide uppercase">
                {t('warm_badge')}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-black text-[#F5EDE4] mb-8 leading-tight">
              {t('warm_title')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('warm_item1')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('warm_item2')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl mt-1">├──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  {t('warm_item3')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl mt-1">└──</span>
                <p className="text-[#F5EDE4]/80 text-base md:text-lg font-medium">
                  <span className="font-black text-[#F5EDE4]">{t('warm_result_label')}</span> {t('warm_result')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Statement (Beige, centered) */}
        <motion.div
          className="bg-[#F5EDE4] rounded-3xl p-8 md:p-12 text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xl md:text-3xl font-black text-[#0F172A] leading-relaxed max-w-4xl mx-auto">
            {t('statement')}
          </p>
        </motion.div>

        {/* Concrete Example: ZedCheckout */}
        <motion.div
          className="bg-[#E88B7A]/10 border-2 border-[#E88B7A]/30 rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-2 bg-[#E88B7A] rounded-full">
              <span className="text-[#0F172A] font-black text-sm tracking-wide uppercase">
                {t('example_badge')}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#E88B7A]">
              {t('example_title')}
            </h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-[#E88B7A] font-black">✗</span>
              <p className="text-[#F5EDE4]/90 text-base md:text-lg font-medium">
                <span className="font-black text-[#F5EDE4]">{t('example_not_label')}</span> {t('example_not')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#E88B7A] font-black">✓</span>
              <p className="text-[#F5EDE4]/90 text-base md:text-lg font-medium">
                <span className="font-black text-[#F5EDE4]">{t('example_but_label')}</span> {t('example_but')}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E88B7A]/30">
            <p className="text-xl md:text-2xl font-black text-[#E88B7A]">
              {t('example_result_label')} {t('example_result')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
