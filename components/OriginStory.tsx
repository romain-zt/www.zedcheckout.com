'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function OriginStory() {
  const t = useTranslations('home.origin');
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const hasTrackedView = useRef(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const isInView = useInView(sectionRef, { amount: 0.3, once: true });
  const h2InView = useInView(h2Ref, { amount: 0.3, once: true });

  // Detect desktop vs mobile for progressive disclosure
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Track section view with GA4 event "origin_section_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'origin_section_viewed', {
          event_category: 'engagement',
          event_label: 'origin_story',
        });
      }
    }
  }, [isInView]);

  // Get paragraphs array from translations
  const paragraphs = [
    t('paragraph1'),
    t('paragraph2'),
    t('paragraph3'),
    t('paragraph4'),
    // t('paragraph5'),
    // t('paragraph6'),
  ];

  return (
    <section 
      ref={sectionRef} 
      id="recherches"
      className="relative bg-gradient-to-b from-white via-[#F5EDE4]/20 to-white py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#FFC9B9]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-gradient-to-tr from-[#E88B7A]/10 to-transparent rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h2
          ref={h2Ref}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1E2A47] text-center mb-24 tracking-tighter leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={h2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bg-gradient-to-br from-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent">
            {t('title')}
          </span>
        </motion.h2>

        <div className="relative">
          {/* Vertical timeline line - hidden on mobile */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#E88B7A]/30 to-transparent hidden md:block" />

          {paragraphs.map((paragraph, index) => {
            const isOdd = index % 2 === 0;
            const lines = paragraph.split('\n');
            const leadLine = lines[0]; // First line = emphasis
            const restLines = lines.slice(1); // Rest = lighter

            return (
              <motion.div
                key={index}
                className={`relative mb-16 ${
                  isOdd 
                    ? 'md:mr-auto md:ml-0 md:pr-12' 
                    : 'md:ml-auto md:mr-0 md:pl-12'
                } max-w-2xl`}
                initial={{ opacity: 0, x: isOdd ? -30 : 30, y: 20 }}
                animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: isOdd ? -30 : 30, y: 20 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 * (index + 1),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Card with Progressive Disclosure */}
                <details 
                  open={isDesktop || index === 0}
                  className="group/details relative backdrop-blur-sm bg-white/60 border border-[#1E2A47]/10 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl hover:border-[#E88B7A]/30 transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Decorative corner accent - alternating position */}
                  <div className={`absolute top-0 ${isOdd ? 'left-0' : 'right-0'} w-20 h-20 bg-gradient-to-br from-[#E88B7A]/20 to-transparent ${isOdd ? 'rounded-tl-3xl' : 'rounded-tr-3xl'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Number badge - alternating position */}
                  <div className={`absolute -top-4 ${isOdd ? '-left-4 md:-left-4' : '-left-4 md:-right-4'} w-12 h-12 bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>

                  {/* Summary (always visible) */}
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-2xl md:text-3xl text-[#1E2A47] font-semibold leading-tight flex-1">
                        {leadLine}
                      </p>
                      {/* Chevron indicator - only on mobile */}
                      <ChevronDown className="w-6 h-6 text-[#E88B7A] flex-shrink-0 md:hidden transform group-open/details:rotate-180 transition-transform duration-300" />
                    </div>
                  </summary>

                  {/* Details content - collapsible on mobile */}
                  {restLines.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {restLines.map((line, lineIndex) => (
                        line && (
                          <p key={lineIndex} className="text-lg md:text-xl text-[#1E2A47]/80 font-light leading-relaxed">
                            {line}
                          </p>
                        )
                      ))}
                    </div>
                  )}
                  
                  {/* Connection dot to timeline (only on desktop) */}
                  <div className={`hidden md:block absolute top-1/2 ${isOdd ? '-right-12' : '-left-12'} transform -translate-y-1/2`}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] shadow-md" />
                  </div>
                </details>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#E88B7A] to-transparent rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

