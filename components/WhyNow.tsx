'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function WhyNow() {
  const t = useTranslations('zedcheckout.why_now');
  const events = t.raw('events') as Array<{ icon: string; text: string }>;
  const positioning = t.raw('positioning') as { for_commodities: string; for_transformation: string };

  return (
    <section id="why-now" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#F5EDE4]">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2A47] text-center mb-12 lg:mb-16 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.h2>

        {/* Events List */}
        <motion.div
          className="space-y-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="text-2xl sm:text-3xl text-[#FFC9B9] flex-shrink-0">{event.icon}</span>
              <p className="text-base sm:text-lg lg:text-xl text-[#1E2A47] font-medium pt-1">
                {event.text}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Message */}
        <motion.div
          className="text-center mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E2A47]">
            {t('message')}
          </p>
        </motion.div>

        {/* Positioning */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-base sm:text-lg lg:text-xl text-[#1E2A47]/80 italic">
            {positioning.for_commodities}
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#1E2A47] font-bold italic">
            {positioning.for_transformation}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
