'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function StakeholderSegmentation() {
  const t = useTranslations('home.stakeholders');
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Track section view with GA4 event
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'stakeholders_viewed', {
          event_category: 'engagement',
          event_label: 'stakeholders_section',
        });
      }
    }
  }, [isInView]);

  // Track stakeholder card clicks
  const handleCardClick = (stakeholderType: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'stakeholder_card_click', {
        event_category: 'engagement',
        event_label: stakeholderType,
      });
    }
  };

  const stakeholders = [
    {
      id: 'partner',
      icon: '🤝',
      title: t('partner.title'),
      description: t('partner.description'),
      cta: t('partner.cta'),
      href: '#contact',
      gradient: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
    },
    {
      id: 'researcher',
      icon: '🔬',
      title: t('researcher.title'),
      description: t('researcher.description'),
      cta: t('researcher.cta'),
      href: '#recherches',
      gradient: 'from-purple-500/10 to-purple-600/10',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
    },
    {
      id: 'media',
      icon: '📢',
      title: t('media.title'),
      description: t('media.description'),
      cta: t('media.cta'),
      href: '#contact',
      gradient: 'from-orange-500/10 to-orange-600/10',
      borderColor: 'border-orange-500/20 hover:border-orange-500/50',
    },
    {
      id: 'entrepreneur',
      icon: '💡',
      title: t('entrepreneur.title'),
      description: t('entrepreneur.description'),
      cta: t('entrepreneur.cta'),
      href: '#recherches',
      gradient: 'from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20 hover:border-green-500/50',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="stakeholders"
      className="relative bg-white py-24 md:py-32 px-6 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#FFC9B9]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#E88B7A]/10 to-transparent rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
            <span className="bg-gradient-to-br from-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-[#1E2A47]/70 font-medium max-w-3xl mx-auto">
            {t('intro')}
          </p>
        </motion.div>

        {/* Stakeholder Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 max-w-5xl mx-auto">
          {stakeholders.map((stakeholder, index) => (
            <motion.a
              key={stakeholder.id}
              href={stakeholder.href}
              onClick={() => handleCardClick(stakeholder.id)}
              className={`group relative bg-white backdrop-blur-sm border-2 ${stakeholder.borderColor} rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stakeholder.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {stakeholder.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-black text-[#1E2A47] mb-3 tracking-tight">
                  {stakeholder.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg text-[#1E2A47]/70 mb-6 leading-relaxed">
                  {stakeholder.description}
                </p>

                {/* CTA */}
                <div className="inline-flex items-center gap-2 text-[#E88B7A] font-semibold group-hover:text-[#FFC9B9] transition-colors">
                  <span>{stakeholder.cta}</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-[#E88B7A]/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            </motion.a>
          ))}
        </div>

        {/* Continue hint */}
        <motion.p
          className="text-center text-[#1E2A47]/50 text-sm md:text-base font-medium"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {t('continueHint')}
        </motion.p>
      </div>
    </section>
  );
}
