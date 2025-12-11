'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function ForWho() {
  const t = useTranslations('zedcheckout.for_who');
  const qualified = t.raw('qualified') as Array<{ icon: string; text: string }>;
  const disqualified = t.raw('disqualified') as { icon: string; title: string; text: string };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#1E2A47]">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5EDE4] text-center mb-12 lg:mb-16 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.h2>

        {/* Qualified List */}
        <motion.div
          className="space-y-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {qualified.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl text-[#FFC9B9] flex-shrink-0">{item.icon}</span>
              <p className="text-base sm:text-lg lg:text-xl text-[#F5EDE4] font-medium pt-1">
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Disqualified Section */}
        <motion.div
          className="bg-[#1E2A47] border-l-4 border-[#FFC9B9] rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl sm:text-3xl text-[#EF4444] flex-shrink-0">{disqualified.icon}</span>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5EDE4] mb-3">
                {disqualified.title}
              </h3>
              <p className="text-base sm:text-lg text-[#F5EDE4]/80">
                {disqualified.text}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
