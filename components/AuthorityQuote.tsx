'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AuthorityQuote() {
  const t = useTranslations('home.authorityQuote');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-[#F5EDE4] via-[#FFF9F5] to-[#F5EDE4] py-20 md:py-32 px-6 overflow-hidden"
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-gradient-to-br from-[#E88B7A]/10 to-transparent rounded-full blur-[80px]" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-tl from-[#FFC9B9]/10 to-transparent rounded-full blur-[80px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.blockquote
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Large decorative opening quote */}
          <div className="absolute -top-8 -left-4 md:-left-8 text-7xl md:text-8xl text-[#E88B7A]/20 font-serif leading-none select-none pointer-events-none">
            "
          </div>

          {/* Quote text */}
          <div className="relative z-10 text-center px-4 md:px-12">
            <p className="text-2xl md:text-3xl font-medium text-[#0F172A] leading-relaxed italic">
              {t('text')}
              <br className="hidden md:block" />
              {t('textContinued')}{' '}
              <span className="text-[#E88B7A] underline decoration-[#E88B7A]/30 underline-offset-4 decoration-2 font-semibold">
                {t('emphasis')}
              </span>{' '}
              {t('textEnd')}
            </p>
          </div>

          {/* Large decorative closing quote */}
          <div className="absolute -bottom-8 -right-4 md:-right-8 text-7xl md:text-8xl text-[#E88B7A]/20 font-serif leading-none select-none pointer-events-none">
            "
          </div>

          {/* Author attribution */}
          <motion.footer 
            className="mt-12 flex items-center justify-end gap-4 flex-col md:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Optional avatar placeholder */}
            {/* 
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E2A47] flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            */}
            
            <div className="text-left">
              <cite className="block text-[#0F172A] text-sm md:text-lg font-semibold not-italic">
                {t('author')}
              </cite>
              <span className="block text-xs text-[#0F172A]/70 tracking-wide uppercase font-normal mt-1">
                {t('role')}
              </span>
            </div>
          </motion.footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
