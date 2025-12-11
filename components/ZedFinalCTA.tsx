'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import LeadCaptureForm from './LeadCaptureForm';

export default function ZedFinalCTA() {
  const t = useTranslations('zedcheckout.finalCta');
  const subtext = t.raw('subtext') as { item1: string; item2: string; item3: string };
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="relative py-32 px-6 bg-gradient-to-br from-[#1E2A47] via-[#2A3F5F] to-[#1E2A47] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Headline */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-4">
            {t('h2')}
          </h2>
          <p className="text-xl lg:text-2xl text-white/70 font-medium">
            {t('subhead')}
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-3 px-10 py-6 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(232,139,122,0.4)] hover:scale-105 transition-all duration-300"
          >
            {t('cta')}
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>

        {/* Subtext */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[subtext.item1, subtext.item2, subtext.item3].map((item, i) => (
            <div key={i} className="flex items-center justify-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#E88B7A]" />
              <span className="text-white/80 text-lg">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
