'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Research() {
  const t = useTranslations('home.research');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasTrackedView = useRef(false);

  const isInView = useInView(sectionRef, { amount: 0.3, once: true });
  const titleInView = useInView(titleRef, { amount: 0.3, once: true });

  // Track section view with GA4 event "research_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'research_viewed', {
          event_category: 'engagement',
          event_label: 'research_section',
        });
      }
    }
  }, [isInView]);

  const timelinePhases = [
    { key: 'phase1', side: 'left' as const },
    { key: 'phase2', side: 'right' as const },
    { key: 'phase3', side: 'left' as const },
    { key: 'phase4', side: 'right' as const },
    { key: 'phase5', side: 'left' as const },
  ];

  return (
    <section 
      ref={sectionRef} 
      id="recherches"
      className="relative bg-white py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FFC9B9]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#E88B7A]/10 to-transparent rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tighter leading-none">
            <span className="bg-gradient-to-br from-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-2xl md:text-3xl text-[#1E2A47]/60 font-light italic">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E88B7A] via-[#FFC9B9] to-[#E88B7A] transform -translate-x-1/2 hidden md:block" />

          {/* Timeline Phases */}
          <div className="space-y-16 mb-24">
            {timelinePhases.map((phase, index) => {
              const phaseRef = useRef<HTMLDivElement>(null);
              const phaseInView = useInView(phaseRef, { amount: 0.3, once: true });
              const isLeft = phase.side === 'left';

              return (
                <motion.div
                  key={phase.key}
                  ref={phaseRef}
                  className={`relative grid md:grid-cols-2 gap-8 items-start`}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={phaseInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Content Card */}
                  <div className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'}`}>
                    <div className="relative bg-gradient-to-br from-white via-[#F5EDE4]/50 to-[#FFC9B9]/20 rounded-3xl p-8 border-2 border-[#1E2A47]/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      {/* Period Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full mb-4 shadow-md">
                        <span className="text-white font-bold text-base">
                          {t(`zedCheckoutStory.timeline.${phase.key}.period`)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl md:text-3xl font-black text-[#1E2A47] mb-4">
                        {t(`zedCheckoutStory.timeline.${phase.key}.title`)}
                      </h3>

                      {/* Description */}
                      <p className="text-base md:text-lg text-[#1E2A47]/80 mb-4 leading-relaxed">
                        {t(`zedCheckoutStory.timeline.${phase.key}.description`)}
                      </p>

                      {/* Context */}
                      {t(`zedCheckoutStory.timeline.${phase.key}.context`) && (
                        <p className="text-sm md:text-base text-[#1E2A47]/60 italic mb-4 border-l-2 border-[#E88B7A]/40 pl-4">
                          {t(`zedCheckoutStory.timeline.${phase.key}.context`)}
                        </p>
                      )}

                      {/* Result */}
                      {t(`zedCheckoutStory.timeline.${phase.key}.result`) && (
                        <p className="text-base md:text-lg text-[#E88B7A] font-bold mb-3">
                          {t(`zedCheckoutStory.timeline.${phase.key}.result`)}
                        </p>
                      )}

                      {/* Product */}
                      {t(`zedCheckoutStory.timeline.${phase.key}.product`) && (
                        <div className="pt-4 border-t border-[#E88B7A]/20">
                          <p className="text-base md:text-lg text-[#1E2A47] font-bold">
                            {t(`zedCheckoutStory.timeline.${phase.key}.product`)}
                          </p>
                        </div>
                      )}

                      {/* Decorative corner */}
                      <div className={`absolute ${isLeft ? 'top-6 right-6' : 'top-6 left-6'} w-16 h-16 bg-gradient-to-br from-[#E88B7A]/10 to-transparent rounded-full blur-xl`} />
                    </div>
                  </div>

                  {/* Empty space for the other side on desktop */}
                  <div className={`hidden md:block ${isLeft ? 'md:col-start-2' : 'md:col-start-1'}`} />

                  {/* Timeline dot (centered) */}
                  <div className="absolute left-1/2 top-8 transform -translate-x-1/2 hidden md:block z-10">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] rounded-full border-4 border-white shadow-lg" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Lesson Section */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative bg-gradient-to-br from-[#1E2A47] via-[#2D3E5F] to-[#1E2A47] rounded-[2.5rem] p-10 md:p-14 overflow-hidden shadow-2xl border border-[#E88B7A]/20">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-[#E88B7A]/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tl from-[#FFC9B9]/20 to-transparent rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="space-y-3 mb-8">
                  <p className="text-white text-xl md:text-2xl font-medium">
                    {t('zedCheckoutStory.lesson.line1')}
                  </p>
                  <p className="text-white text-xl md:text-2xl font-medium">
                    {t('zedCheckoutStory.lesson.line2')}
                  </p>
                </div>
                <p className="text-white/90 text-2xl md:text-3xl font-bold italic pb-10 border-b border-white/10 mb-10">
                  {t('zedCheckoutStory.lesson.line3')}
                </p>

                {/* Qualification Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 mb-8">
                  <p className="text-[#FFC9B9] font-bold text-lg md:text-xl mb-4">
                    {t('zedCheckoutStory.lesson.qualification.title')}
                  </p>
                  <ul className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-[#E88B7A] text-xl mt-1">✓</span>
                        <span className="text-white/90 text-base md:text-lg">
                          {t(`zedCheckoutStory.lesson.qualification.criteria.${index}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pitch */}
                <p className="text-white text-xl md:text-2xl font-bold text-center mb-10">
                  {t('zedCheckoutStory.lesson.pitch')}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col items-center gap-3">
                  <Link
                    href="https://www.zedcheckout.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white font-bold text-lg rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 relative overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                    
                    <span className="relative z-10">{t('zedCheckoutStory.lesson.cta')}</span>
                    <svg 
                      className="relative z-10 w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <p className="text-white/60 text-sm font-medium">
                    {t('zedCheckoutStory.lesson.ctaSubtext')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
