'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function ForWho() {
  const t = useTranslations('zedcheckout.for_who');
  const qualified = t.raw('qualified') as Array<{ icon: string; text: string }>;
  const best_for = t.raw('best_for') as { title: string; segments: string[] };

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

        {/* Best For Section */}
        <motion.div
          className="border-t-2 border-[#FFC9B9] pt-8 sm:pt-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F5EDE4] mb-6 text-center">
            {best_for.title}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {best_for.segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#1E2A47] border border-[#FFC9B9]/30 rounded-xl p-4"
              >
                <span className="text-xl text-[#FFC9B9]">•</span>
                <p className="text-base sm:text-lg text-[#F5EDE4] font-medium">
                  {segment}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
