'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Mission() {
  const t = useTranslations('home.mission');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Track section view with GA4 event "mission_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'mission_viewed', {
          event_category: 'engagement',
          event_label: 'mission_section',
        });
      }
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-white py-24 md:py-32 px-6 overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* H2 Title */}
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-16 md:mb-20 tracking-tight leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bg-gradient-to-br from-[#0F172A] via-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent">
            {t('h2')}
          </span>
        </motion.h2>

        {/* Manifesto - Prose format with generous padding */}
        <motion.div
          className="bg-white p-10 md:p-16 lg:p-20 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="prose prose-lg md:prose-xl lg:prose-2xl max-w-none">
            {t('manifesto').split('\n\n').map((paragraph, index) => (
              <motion.p
                key={index}
                className="text-[#0F172A] leading-relaxed mb-8 last:mb-0 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {paragraph.split('\n').map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Signature */}
        <motion.div
          className="text-center md:text-right border-t-2 border-[#E88B7A]/30 pt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
            {t('signature.name')}
          </p>
          <p className="text-lg md:text-xl text-[#1E2A47] mb-1">
            {t('signature.title')}
          </p>
          <p className="text-base md:text-lg text-[#1E2A47]/70 mb-6">
            {t('signature.subtitle')}
          </p>
          {/* <p className="text-lg md:text-xl italic text-[#E88B7A] font-light">
            "{t('signature.quote')}"
          </p> */}
        </motion.div>
      </div>
    </section>
  );
}
