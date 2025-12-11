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

export default function Products() {
  const t = useTranslations('home.products');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  const isInView = useInView(sectionRef, { amount: 0.3, once: true });
  const h2InView = useInView(h2Ref, { amount: 0.3, once: true });
  const cardsInView = useInView(cardsRef, { amount: 0.2, once: true });

  // Track section view with GA4 event "products_viewed"
  useEffect(() => {
    if (isInView && !hasTrackedView.current) {
      hasTrackedView.current = true;
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'products_viewed', {
          event_category: 'engagement',
          event_label: 'products_section',
        });
      }
    }
  }, [isInView]);

  // Track CTA click with GA4 event "cta_click"
  const handleCTAClick = (productName: string, destination: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: productName,
        destination: destination,
      });
    }
  };

  const products = [
    {
      id: 'checkout',
      emoji: '🛒',
      status: t('product1_status'),
      name: t('product1_name'),
      tagline: t('product1_tagline'),
      description: t('product1_description'),
      cta: t('product1_cta'),
      href: 'https://www.zedcheckout.com',
      isAvailable: true,
      type: 'product',
    },
    {
      id: 'future',
      emoji: '🔬',
      status: t('futureDirections.status'),
      name: t('futureDirections.title'),
      isAvailable: false,
      type: 'research',
    },
    {
      id: 'mystery',
      status: t('product3_status'),
      name: t('product3_name'),
      isAvailable: false,
      type: 'mystery',
    },
  ];

  return (
    <section 
      ref={sectionRef} 
      id="produits"
      className="relative bg-gradient-to-b from-white via-[#F5EDE4]/30 to-white py-32 md:py-40 px-6 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#E88B7A]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFC9B9]/10 to-transparent rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* H2 Title */}
        <motion.h2
          ref={h2Ref}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-6 tracking-tighter leading-none"
          initial={{ opacity: 0, y: 30 }}
          animate={h2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bg-gradient-to-br from-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent">
            {t('h2')}
          </span>
        </motion.h2>

        {/* Intro Text - Research Lab Context */}
        <motion.p
          className="text-lg md:text-xl text-[#1E2A47]/70 text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={h2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('intro')}
        </motion.p>

        {/* Products Grid */}
        <motion.div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              {product.isAvailable ? (
                // Full card for ZedCheckout
                <>
                  <div className="relative bg-gradient-to-br from-white via-[#F5EDE4]/50 to-[#FFC9B9]/30 rounded-3xl p-8 border-2 border-[#E88B7A]/20 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:border-[#E88B7A]/50 h-full flex flex-col">
                    
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E88B7A]/0 via-[#FFC9B9]/0 to-[#F5EDE4]/0 group-hover:from-[#E88B7A]/10 group-hover:via-[#FFC9B9]/10 group-hover:to-[#F5EDE4]/20 transition-all duration-700" />
                    
                    {/* Animated corner accent */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#E88B7A]/30 to-transparent rounded-full blur-2xl group-hover:scale-150 group-hover:rotate-90 transition-all duration-1000" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Emoji & Status Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <span className="text-5xl">{product.emoji}</span>
                        <div className="px-4 py-1.5 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full">
                          <span className="text-white font-bold text-xs uppercase tracking-wide">{product.status}</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="text-3xl font-black text-[#1E2A47] mb-4 tracking-tight">
                        {product.name}
                      </h3>

                      {/* Product Tagline */}
                      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] bg-clip-text mb-4 leading-snug">
                        {product.tagline?.split('\n').map((line, idx) => (
                          <span key={idx} className="block mb-1 last:mb-0">
                            {line}
                          </span>
                        ))}
                      </p>

                      {/* Divider */}
                      <div className="w-16 h-0.5 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full mb-4" />

                      {/* Product Description */}
                      <p className="text-base text-[#1E2A47]/80 mb-4 leading-relaxed flex-grow">
                        {product.description}
                      </p>

                      {/* Result */}
                      {/* {product.result && (
                        <p className="text-sm font-bold text-[#1E2A47] mb-6">
                          {product.result}
                        </p>
                      )} */}

                      {/* CTA Button */}
                      <Link
                        href={product.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleCTAClick(product.name, 'zedcheckout.com')}
                        className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E2A47] via-[#2D3E5F] to-[#1E2A47] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-sm rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden mt-auto"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                        
                        <span className="relative z-10">{product.cta}</span>
                        <svg 
                          className="relative z-10 w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* 3D Shadow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A47]/5 to-[#E88B7A]/5 rounded-3xl blur-xl transform translate-y-4 -z-10 group-hover:translate-y-6 transition-transform duration-700" />
                </>
              ) : product.type === 'research' ? (
                // Future Directions Card - Research Focus
                <div className="relative group h-[400px]">
                  <div className="relative h-full bg-gradient-to-br from-white via-[#F5EDE4]/50 to-[#E88B7A]/10 rounded-3xl p-8 border-2 border-[#E88B7A]/20 shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:border-[#E88B7A]/40">
                    
                    {/* Status badge at top */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-5xl">{product.emoji}</span>
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
                        <span className="text-[#1E2A47] font-bold text-xs tracking-wide uppercase">
                          {product.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-black text-[#1E2A47] mb-4 tracking-tight">
                      {product.name}
                    </h3>
                    
                    {/* Divider */}
                    <div className="w-16 h-0.5 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full mb-4" />
                    
                    {/* Research Directions List */}
                    <ul className="space-y-3 flex-grow">
                      <li className="flex items-start gap-3">
                        <span className="text-[#E88B7A] text-lg mt-1">•</span>
                        <div>
                          <p className="text-base font-bold text-[#1E2A47]">{t('futureDirections.item1Title')}</p>
                          <p className="text-sm text-[#1E2A47]/70">{t('futureDirections.item1Desc')}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#E88B7A] text-lg mt-1">•</span>
                        <div>
                          <p className="text-base font-bold text-[#1E2A47]">{t('futureDirections.item2Title')}</p>
                          <p className="text-sm text-[#1E2A47]/70">{t('futureDirections.item2Desc')}</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#E88B7A] text-lg mt-1">•</span>
                        <div>
                          <p className="text-base font-bold text-[#1E2A47]">{t('futureDirections.item3Title')}</p>
                          <p className="text-sm text-[#1E2A47]/70">{t('futureDirections.item3Desc')}</p>
                        </div>
                      </li>
                    </ul>
                    
                    {/* Note */}
                    <p className="text-sm text-[#1E2A47]/60 italic mt-4">
                      {t('futureDirections.note')}
                    </p>
                    
                    {/* Decorative corner */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  </div>
                  
                  {/* 3D shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A47]/5 to-[#E88B7A]/5 rounded-3xl blur-xl transform translate-y-4 -z-10 group-hover:translate-y-6 transition-transform duration-700" />
                </div>
              ) : (
                // Minimal mystery card for product 3
                <div className="relative group h-[400px]">
                  {/* Glassmorphic container */}
                  <div className="relative h-full bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:bg-white/30 hover:border-white/50">
                    
                    {/* Subtle animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E88B7A]/5 via-transparent to-[#FFC9B9]/5 group-hover:from-[#E88B7A]/10 group-hover:to-[#FFC9B9]/10 transition-all duration-700" />
                    
                    {/* Status badge (date) at top */}
                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/40 backdrop-blur-sm border border-white/50 rounded-full">
                      <span className="text-[#1E2A47] font-bold text-xs tracking-wide">
                        {product.status}
                      </span>
                    </div>
                    
                    {/* Mystery content - centered */}
                    <div className="relative z-10 text-center">
                      {/* Large mystery symbol */}
                      <div className="text-8xl md:text-9xl font-black text-[#1E2A47]/5 mb-4 group-hover:text-[#1E2A47]/10 transition-colors duration-500">
                        ?
                      </div>
                      
                      {/* Subtle text */}
                      <p className="text-sm text-[#1E2A47]/40 font-medium">
                        {product.name}
                      </p>
                    </div>
                    
                    {/* Decorative blur orbs */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#E88B7A]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#FFC9B9]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  </div>
                  
                  {/* 3D shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A47]/5 to-[#E88B7A]/5 rounded-3xl blur-xl transform translate-y-4 -z-10 group-hover:translate-y-6 transition-transform duration-700" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline Clarification */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={cardsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="inline-block bg-white/60 backdrop-blur-sm border border-[#1E2A47]/20 rounded-2xl px-8 py-6">
            <p className="text-sm md:text-base text-[#1E2A47]/80 font-medium mb-2">
              <span className="font-bold text-[#1E2A47]">ZED TECH</span> : {t('timelineLab')}
            </p>
            <p className="text-sm md:text-base text-[#1E2A47]/80 font-medium">
              <span className="font-bold text-[#1E2A47]">ZedCheckout</span> : {t('timelineProduct')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

