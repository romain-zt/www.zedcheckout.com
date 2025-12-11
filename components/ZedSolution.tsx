'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { X, Check, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';

export default function ZedSolution() {
  const t = useTranslations('zedcheckout.solution');
  const classic = t.raw('classic') as { title: string; item1: string; item2: string; item3: string; item4: string };
  const zedcheckout = t.raw('zedcheckout') as { title: string; item1: string; item2: string; item3: string; item4: string };
  const callout = t.raw('callout') as { emoji: string; title: string; description: string };
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-[#F5EDE4] to-[#FEFAF6]">
      <div className="max-w-6xl mx-auto">
        
        {/* Headline */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-black text-[#1E2A47] mb-2">
            {t('h2')}
          </h2>
          <p className="text-3xl lg:text-5xl font-black text-[#E88B7A]">
            {t('h2Secondary')}
          </p>
        </motion.div>

        {/* Comparison */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-center text-sm uppercase tracking-wider font-bold text-[#1E2A47]/50 mb-8">
            {t('comparisonTitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Classic Checkout */}
            <div className="bg-white/60 p-8 rounded-3xl border-2 border-[#1E2A47]/10">
              <h3 className="text-2xl font-bold text-[#1E2A47] mb-6">
                {classic.title}
              </h3>
              <ul className="space-y-4">
                {[classic.item1, classic.item2, classic.item3, classic.item4].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#1E2A47]/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ZedCheckout */}
            <div className="bg-gradient-to-br from-[#E88B7A]/10 to-[#FFC9B9]/10 p-8 rounded-3xl border-2 border-[#E88B7A]/30 shadow-xl">
              <h3 className="text-2xl font-bold text-[#E88B7A] mb-6">
                {zedcheckout.title}
              </h3>
              <ul className="space-y-4">
                {[zedcheckout.item1, zedcheckout.item2, zedcheckout.item3, zedcheckout.item4].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-[#1E2A47] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Explanation */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xl lg:text-2xl text-[#1E2A47]/80 leading-relaxed whitespace-pre-line">
            {t('explanation')}
          </p>
        </motion.div>

        {/* Teaser Visual */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="inline-block bg-white/40 backdrop-blur-sm px-6 py-3 rounded-full border border-[#1E2A47]/10">
            <p className="text-sm font-semibold text-[#1E2A47]/60">
              {t('teaser')}
            </p>
          </div>
        </motion.div>

        {/* Callout Mystery */}
        <motion.div
          className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#E88B7A]/20 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{callout.emoji}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1E2A47] mb-2">
                {callout.title}
              </h3>
              <p className="text-[#1E2A47]/70 mb-4">
                {callout.description}
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 text-[#E88B7A] font-semibold hover:gap-3 transition-all"
              >
                En savoir plus
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
