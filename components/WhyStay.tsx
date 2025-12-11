'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WhyStay() {
  const t = useTranslations('zedcheckout.why_stay');
  const marketplaces = t.raw('marketplaces') as Array<{ name: string; benefit: string; cost: string }>;
  const conclusion = t.raw('conclusion') as { title: string; subtitle: string; cta: string };

  return (
    <section id="why-stay" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#F5EDE4]">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2A47] text-center mb-6 lg:mb-8 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.h2>

        {/* Intro */}
        <motion.p
          className="text-lg sm:text-xl lg:text-2xl text-[#1E2A47]/80 text-center mb-12 lg:mb-16 font-medium"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('intro')}
        </motion.p>

        {/* Marketplaces Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 lg:mb-16">
          {marketplaces.map((marketplace, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl border-2 border-[#FFC9B9] p-6 space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#1E2A47] text-center">
                {marketplace.name}
              </h3>
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-[#10B981] font-medium">
                  {marketplace.benefit}
                </p>
                <p className="text-sm sm:text-base text-[#EF4444] font-medium">
                  {marketplace.cost}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Conclusion */}
        <motion.div
          className="bg-[#1E2A47] text-[#F5EDE4] rounded-2xl p-8 sm:p-10 lg:p-12 text-center space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {conclusion.title}
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-medium opacity-90">
            {conclusion.subtitle}
          </p>
          <button
            onClick={() => {
              const comparisonSection = document.getElementById('comparison-table');
              if (comparisonSection) {
                comparisonSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FFC9B9] text-[#1E2A47] rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 mt-4"
          >
            {conclusion.cta}
            <svg
              className="w-5 h-5"
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
        </motion.div>
      </div>
    </section>
  );
}
