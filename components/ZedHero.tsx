'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import WhatsAppTransformationDemo from './WhatsAppTransformationDemo';
import LeadCaptureForm from './LeadCaptureForm';

export default function ZedHero() {
  const t = useTranslations('zedcheckout.hero');
  const trustBar = t.raw('trustBar') as { item1: string; item2: string; item3: string };
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section id="zed-hero" className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-br from-[#F5EDE4] via-[#FEFAF6] to-[#F5EDE4]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1E2A47 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-3 sm:space-y-4"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#1E2A47]">
                {t('title')}
              </h1>
              <h2 className="inline-block bg-[#FFC9B9] text-[#1E2A47] text-lg sm:text-xl md:text-2xl font-semibold leading-[1.2] tracking-tight px-4 py-2 rounded-lg">
                {t('subtitle')}
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#1E2A47]/80"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => {
                  // Trigger typing simulation in ChatWidgetAI
                  const event = new CustomEvent('simulateTyping', {
                    detail: { text: 'Demandez ce que vous voulez...' }
                  });
                  window.dispatchEvent(event);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 min-h-[44px] bg-[#1E2A47] text-[#F5EDE4] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-95 sm:hover:scale-105 transition-all duration-300"
              >
                {t('cta_primary')}
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  const whyStaySection = document.getElementById('why-stay');
                  if (whyStaySection) {
                    whyStaySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 min-h-[44px] bg-[#F5EDE4] text-[#1E2A47] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-[#1E2A47] hover:bg-[#1E2A47] hover:text-[#F5EDE4] active:scale-95 sm:hover:scale-105 transition-all duration-300"
              >
                {t('cta_secondary')}
              </button>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[trustBar.item1, trustBar.item2, trustBar.item3].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E88B7A] flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-[#1E2A47]/70">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: WhatsApp Demo (Desktop only) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <WhatsAppTransformationDemo />
          </motion.div>
        </div>

        {/* Mobile WhatsApp Demo - smaller and optimized */}
        <motion.div
          className="lg:hidden mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="max-w-[280px] sm:max-w-sm mx-auto">
            <WhatsAppTransformationDemo />
          </div>
        </motion.div>
      </div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
