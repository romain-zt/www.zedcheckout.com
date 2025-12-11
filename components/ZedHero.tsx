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
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-24 lg:pt-32 pb-16 overflow-hidden bg-gradient-to-br from-[#F5EDE4] via-[#FEFAF6] to-[#F5EDE4]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1E2A47 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-8">
            
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight text-[#1E2A47]">
                {t('h1')}
              </h1>
              <h2 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] bg-clip-text text-transparent">
                  {t('h1Secondary')}
                </span>
              </h2>
            </motion.div>

            {/* Subhead */}
            <motion.p 
              className="text-xl lg:text-2xl font-medium leading-relaxed text-[#1E2A47]/80"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t('subhead')}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {t('cta')}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.div>

            {/* Trust Bar */}
            <motion.div
              className="flex flex-wrap items-center gap-6 pt-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[trustBar.item1, trustBar.item2, trustBar.item3].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#E88B7A]" />
                  <span className="text-sm lg:text-base font-medium text-[#1E2A47]/70">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: WhatsApp Demo */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <WhatsAppTransformationDemo />
          </motion.div>
        </div>

        {/* Mobile WhatsApp Demo */}
        <motion.div
          className="lg:hidden mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="max-w-sm mx-auto">
            <WhatsAppTransformationDemo />
          </div>
        </motion.div>
      </div>

      <LeadCaptureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
