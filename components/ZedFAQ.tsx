'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ZedFAQ() {
  const t = useTranslations('zedcheckout.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t('q1.question'), a: t('q1.answer') },
    { q: t('q2.question'), a: t('q2.answer') },
    { q: t('q3.question'), a: t('q3.answer') },
    { q: t('q4.question'), a: t('q4.answer') },
    { q: t('q5.question'), a: t('q5.answer') }
  ];

  return (
    <section className="relative py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Headline */}
        <motion.h2
          className="text-4xl lg:text-5xl font-black text-[#1E2A47] text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('h2')}
        </motion.h2>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-[#F5EDE4] rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#E88B7A]/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="text-lg font-bold text-[#1E2A47]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-[#E88B7A] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <p className="text-[#1E2A47]/70 leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
