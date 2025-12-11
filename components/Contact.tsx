'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import SimpleContactForm from './SimpleContactForm';

export default function Contact() {
  const t = useTranslations('home.contact');
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="relative py-24 px-6 bg-[#F5EDE4]">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-16 text-[#0F172A] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('h2')}
        </motion.h2>

        {/* Process */}
        <motion.div
          className="space-y-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Step 1 */}
          <div className="leading-loose text-[#0F172A]/80">
            <p className="text-lg mb-2">
              <span className="font-semibold text-[#E88B7A]">→</span> {t('step1.action')}:{' '}
              <a 
                href="mailto:romain@zedcheckout.com" 
                className="font-semibold text-[#0F172A] underline decoration-[#E88B7A]/30 hover:decoration-[#E88B7A] transition-colors duration-300"
              >
                romain@zedcheckout.com
              </a>
            </p>
            <p className="text-base text-[#0F172A]/60 ml-6">
              {t('step1.detail')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="leading-loose text-[#0F172A]/80">
            <p className="text-lg mb-2">
              <span className="font-semibold text-[#E88B7A]">→</span> {t('step2.action')}
            </p>
            <p className="text-base text-[#0F172A]/60 ml-6">
              {t('step2.detail')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="leading-loose text-[#0F172A]/80">
            <p className="text-lg mb-2">
              <span className="font-semibold text-[#E88B7A]">→</span> {t('step3.action')}
            </p>
            <p className="text-base text-[#0F172A]/60 ml-6">
              {t('step3.detail')}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white rounded-full font-semibold text-lg hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
          >
            <Mail className="w-5 h-5" />
            {t('cta')}
          </button>

          {/* Micro-copy */}
          <p className="text-sm text-[#0F172A]/50 font-medium">
            {t('response_time')}
          </p>
        </motion.div>
      </div>

      <SimpleContactForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}
