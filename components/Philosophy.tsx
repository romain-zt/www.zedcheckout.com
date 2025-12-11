'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Philosophy() {
  const t = useTranslations('home.philosophy');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Track section view with GA4 event "philosophy_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'philosophy_viewed', {
          event_category: 'engagement',
          event_label: 'philosophy_section',
        });
      }
    }
  }, [isInView]);

  // Track card hovers with GA4 event "philosophy_card_hover" + label
  const handleCardHover = (label: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'philosophy_card_hover', {
        event_category: 'engagement',
        event_label: label,
      });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative bg-gradient-to-br from-[#0F172A] via-[#1E2A47] to-[#2D3E5F] py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-[#E88B7A]/20 to-transparent rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-gradient-to-tl from-[#FFC9B9]/20 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#F5EDE4]/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* H2 Title */}
        <motion.h2
          className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-12 tracking-tighter leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bg-gradient-to-br from-white via-white to-[#FFC9B9] bg-clip-text text-transparent">
            {t('h2')}
          </span>
        </motion.h2>

        {/* Intro with glassmorphism */}
        <motion.div
          className="max-w-4xl mx-auto mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-2xl md:text-3xl font-bold text-white text-center leading-tight">
            {t('intro').split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < t('intro').split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </motion.div>

        {/* Experience */}
        <motion.p
          className="text-xl md:text-2xl font-light text-white/80 text-center max-w-3xl mx-auto mb-20 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('experience').split('\n').map((line, index) => (
            <span key={index}>
              {line}
              {index < t('experience').split('\n').length - 1 && <br />}
            </span>
          ))}
        </motion.p>

        {/* Elevator Story Section */}
        <div className="mb-20">
          <motion.h3
            className="text-2xl md:text-3xl font-bold text-[#FFC9B9] mb-12 text-center tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('story_title')}
          </motion.h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <motion.div
              className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 hover:bg-white/15 hover:border-[#E88B7A]/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => handleCardHover('elevator')}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🚫</div>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  {t('story_problem').split('\n').map((line, index) => (
                    <span key={index} className="block mb-3 last:mb-0">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>

            {/* Solution Card */}
            <motion.div
              className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 hover:bg-white/15 hover:border-[#FFC9B9]/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => handleCardHover('elevator')}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFC9B9]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">🪞</div>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                  {t('story_solution').split('\n').map((line, index) => (
                    <span key={index} className="block mb-3 last:mb-0">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Separator */}
        <motion.div
          className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FFC9B9] to-transparent mx-auto mb-20 rounded-full"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        />

        {/* Pull Quote - Visual Break */}
        <motion.div
          className="max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <blockquote className="relative backdrop-blur-xl bg-white/10 border-2 border-[#FFC9B9]/30 rounded-3xl p-10 md:p-14 overflow-hidden group">
            {/* Decorative quote marks */}
            <div className="absolute -top-4 -left-4 text-9xl text-[#FFC9B9]/20 font-serif leading-none select-none">"</div>
            <div className="absolute -bottom-8 -right-4 text-9xl text-[#FFC9B9]/20 font-serif leading-none select-none">"</div>
            
            {/* Quote content */}
            <div className="relative z-10">
              <p className="text-2xl md:text-4xl font-light text-white italic text-center leading-relaxed mb-6">
                Vos clients ne sont pas des taux de conversion.
              </p>
              <p className="text-2xl md:text-4xl font-light text-white italic text-center leading-relaxed">
                Ce sont des humains avec des questions, des doutes, des contextes.
              </p>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC9B9]/10 via-transparent to-[#E88B7A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </blockquote>
        </motion.div>

        {/* Separator */}
        <motion.div
          className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FFC9B9] to-transparent mx-auto mb-20 rounded-full"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 1.35 }}
        />

        {/* E-commerce Section */}
        <div className="mb-20">
          <motion.h3
            className="text-2xl md:text-3xl font-bold text-[#FFC9B9] mb-12 text-center tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {t('ecommerce_title')}
          </motion.h3>

          <motion.div
            className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 md:p-12 max-w-5xl mx-auto hover:bg-white/15 hover:border-[#E88B7A]/50 transition-all duration-500 hover:shadow-2xl group overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => handleCardHover('ecommerce')}
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E88B7A]/5 via-transparent to-[#FFC9B9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col space-y-10">
              <div className="flex items-start gap-6 group/item">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center transform group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                  <span className="text-3xl">❌</span>
                </div>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed pt-2">
                  {t('ecommerce_problem').split('\n').map((line, index) => (
                    <span key={index} className="block mb-2 last:mb-0">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-start gap-6 group/item">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center transform group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                  <span className="text-3xl">❓</span>
                </div>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed pt-2">
                  {t('ecommerce_question').split('\n').map((line, index) => (
                    <span key={index} className="block mb-2 last:mb-0">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-start gap-6 group/item">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center transform group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="pt-2 space-y-6">
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    {t('ecommerce_solution').split('\n').map((line, index) => (
                      <span key={index} className="block mb-2 last:mb-0">
                        {line}
                      </span>
                    ))}
                  </p>
                  
                  {/* Beautiful quote component */}
                  {/* <div className="relative my-6">
                    <div className="absolute -left-2 -top-2 text-6xl text-[#FFC9B9]/30 font-serif leading-none select-none">"</div>
                    <div className="relative backdrop-blur-md bg-gradient-to-br from-[#FFC9B9]/10 to-[#E88B7A]/10 border-l-4 border-[#FFC9B9] rounded-r-2xl px-6 py-4 shadow-lg">
                      <p className="text-lg md:text-xl text-white/95 italic font-light tracking-wide">
                        {t('ecommerce_quote')}
                      </p>
                    </div>
                    <div className="absolute -right-2 -bottom-2 text-6xl text-[#FFC9B9]/30 font-serif leading-none select-none">"</div>
                  </div> */}

                  {/* <p className="text-lg md:text-xl text-white/90 leading-relaxed font-semibold">
                    {t('ecommerce_result')}
                  </p> */}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <motion.div
          className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FFC9B9] to-transparent mx-auto mb-16 rounded-full"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
        />

        {/* Footer */}
        {/* <motion.p
          className="text-base text-white/50 text-center italic font-light"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('footer')}
        </motion.p> */}
      </div>
    </section>
  );
}

