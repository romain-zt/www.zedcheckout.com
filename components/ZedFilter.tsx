'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';

export default function ZedFilter() {
  const t = useTranslations('zedcheckout.filter');
  const criteria = [
    t.raw('criteria1') as { emoji: string; text: string; detail?: string },
    t.raw('criteria2') as { emoji: string; text: string; detail?: string },
    t.raw('criteria3') as { emoji: string; text: string; detail?: string },
    t.raw('criteria4') as { emoji: string; text: string; detail?: string },
    t.raw('criteria5') as { emoji: string; text: string; detail?: string }
  ];
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section id="zed-filter" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Headline */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#1E2A47] text-center mb-12 sm:mb-16 leading-tight px-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('h2')}
        </motion.h2>

        {/* Checklist */}
        <motion.div
          className="space-y-4 sm:space-y-6 mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {criteria.map((criterion, i) => (
            <div key={i} className="flex items-start gap-3 sm:gap-4 p-5 sm:p-6 bg-[#F5EDE4] rounded-xl sm:rounded-2xl">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#E88B7A] flex-shrink-0 mt-0.5 sm:mt-1" />
              <div>
                <p className="text-base sm:text-lg font-semibold text-[#1E2A47] mb-1">
                  {criterion.text}
                </p>
                {criterion.detail && (
                  <p className="text-xs sm:text-sm text-[#1E2A47]/60">
                    {criterion.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Callout */}
        <motion.div
          className="bg-gradient-to-r from-[#E88B7A]/10 to-[#FFC9B9]/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-[#E88B7A]/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#1E2A47] mb-5 sm:mb-6 leading-snug px-2">
            {t('callout')}
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-300"
          >
            {t('cta')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
