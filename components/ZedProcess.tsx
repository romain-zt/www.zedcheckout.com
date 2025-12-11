'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Rocket, AlertCircle } from 'lucide-react';

export default function ZedProcess() {
  const t = useTranslations('zedcheckout.process');
  const step1 = t.raw('step1') as { title: string; arrow: string; items: string[] };
  const step2 = t.raw('step2') as { title: string; arrow: string; items: string[] };
  const step3 = t.raw('step3') as { title: string; arrow: string; items: string[] };
  const callout = t.raw('callout') as { emoji: string; text: string };

  const steps = [
    { ...step1, icon: Search, delay: 0.1 },
    { ...step2, icon: MessageSquare, delay: 0.2 },
    { ...step3, icon: Rocket, delay: 0.3 }
  ];

  return (
    <section id="zed-process" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#F5EDE4] to-[#FEFAF6]">
      <div className="max-w-5xl mx-auto">
        
        {/* Headline */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-[#1E2A47] text-center mb-12 sm:mb-16 lg:mb-20 leading-tight px-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('h2')}
        </motion.h2>

        {/* Steps */}
        <div className="space-y-8 sm:space-y-12 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: step.delay }}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1 sm:pt-2">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1E2A47] mb-3 sm:mb-4 uppercase tracking-wide">
                    Étape {index + 1} : {step.title}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3">
                        <span className="text-[#E88B7A] font-bold mt-0.5 sm:mt-1">{step.arrow}</span>
                        <span className="text-sm sm:text-base lg:text-lg text-[#1E2A47]/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Connector (except for last step) */}
              {index < steps.length - 1 && (
                <div className="ml-6 sm:ml-8 h-8 sm:h-12 border-l-2 sm:border-l-4 border-dashed border-[#E88B7A]/30" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Callout */}
        {/* <motion.div
          className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-[#E88B7A]/20 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl">{callout.emoji}</div>
            <p className="flex-1 text-sm sm:text-base lg:text-lg text-[#1E2A47]/80 leading-relaxed">
              {callout.text}
            </p>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
