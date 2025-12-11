'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Image from 'next/image';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function About() {
  const t = useTranslations('home.about');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true });

  // Track section view with GA4 event "about_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'about_viewed', {
          event_category: 'engagement',
          event_label: 'about_section',
        });
      }
    }
  }, [isInView]);

  // Track LinkedIn link click with GA4 event "social_click"
  const handleLinkedInClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'social_click', {
        event_category: 'engagement',
        event_label: 'linkedin',
        followers: '12000',
      });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      id="apropos" 
      className="relative bg-gradient-to-br from-[#0F172A] via-[#1E2A47] to-[#2D3E5F] py-20 sm:py-24 md:py-32 lg:py-40 px-6 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#E88B7A]/20 to-transparent rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-40 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FFC9B9]/20 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Image - Left Column with enhanced presentation */}
          <motion.div
            className="flex justify-center md:justify-end order-2 md:order-1"
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-lg">
              {/* Animated glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-br from-[#E88B7A]/30 via-[#FFC9B9]/20 to-transparent rounded-[3rem] blur-3xl animate-pulse" />
              
              {/* Image container with glassmorphism frame */}
              <div className="relative aspect-square">
                {/* Decorative corner elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 sm:w-24 sm:h-24 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-[#FFC9B9] rounded-tl-2xl sm:rounded-tl-3xl" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-[#E88B7A] rounded-br-2xl sm:rounded-br-3xl" />
                
                {/* Main image with enhanced effects */}
                <div className="relative rounded-3xl overflow-hidden backdrop-blur-sm bg-white/10 border-2 border-white/20 shadow-2xl group">
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E88B7A]/0 via-transparent to-[#FFC9B9]/0 group-hover:from-[#E88B7A]/20 group-hover:to-[#FFC9B9]/20 transition-all duration-700 z-10" />
                  
                  <Image
                    src="/assets/images/founder.png"
                    alt={t('image_alt')}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    priority
                  />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content - Right Column with glassmorphism card */}
          <motion.div
            className="order-1 md:order-2"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 md:p-12 shadow-2xl">
              <div className="flex flex-col space-y-6">
                {/* H2 */}
                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('h2')}
                </motion.h2>

                {/* Role */}
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <p className="text-lg md:text-xl font-bold text-white">
                    {t('role')}
                  </p>
                </motion.div>

                {/* Divider */}
                <div className="w-16 h-1 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full" />

                {/* Bio Enhanced - Carpenter Background */}
                <motion.p
                  className="text-lg md:text-xl text-white/90 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('bioEnhanced')}
                </motion.p>

                {/* Freelance Context */}
                <motion.p
                  className="text-lg md:text-xl text-white/90 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('freelanceContext')}
                </motion.p>

                {/* Lab Context */}
                <motion.p
                  className="text-lg md:text-xl text-white/90 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('labContext')}
                </motion.p>

                {/* Profile Title */}
                <motion.h3
                  className="text-2xl font-bold text-[#FFC9B9] pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('profile_title')}
                </motion.h3>

                {/* Profile Traits */}
                <motion.p
                  className="text-base md:text-lg text-white/80 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('profile_traits').split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < t('profile_traits').split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </motion.p>

                {/* Approach */}
                <motion.p
                  className="text-base md:text-lg text-white/80 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t('approach').split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < t('approach').split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </motion.p>

                {/* Contact with enhanced CTA */}
                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-base md:text-lg text-white/90 font-light">
                    {t('contact').split('LinkedIn')[0]}
                    <a
                      href="https://linkedin.com/in/romainpiveteau"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#FFC9B9] hover:text-white font-semibold transition-all duration-300 group/link relative"
                      onClick={handleLinkedInClick}
                    >
                      <span className="relative">
                        LinkedIn
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover/link:w-full transition-all duration-300" />
                      </span>
                      <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                    {t('contact').split('LinkedIn')[1]}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

