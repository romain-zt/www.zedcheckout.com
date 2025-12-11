'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageCircleQuestion, Sparkles, AlertTriangle } from 'lucide-react';

export default function ZedProblem() {
  const t = useTranslations('zedcheckout.problem');
  const card1 = t.raw('card1') as { title: string; question1: string; question2: string; question3: string; result: string };
  const card2 = t.raw('card2') as { title: string; description: string; result: string };
  const card3 = t.raw('card3') as { title: string; description: string };

  return (
    <section className="relative py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Headline */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-black text-[#1E2A47] mb-4">
            {t('h2')}
          </h2>
          <p className="text-3xl lg:text-5xl font-black text-[#1E2A47]/60">
            {t('h2Secondary')}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: Questions */}
          <motion.div
            className="bg-[#F5EDE4] p-8 rounded-3xl border-2 border-[#1E2A47]/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageCircleQuestion className="w-8 h-8 text-[#E88B7A]" />
              <h3 className="text-2xl font-bold text-[#1E2A47]">
                {card1.title}
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-[#1E2A47]/70 italic">"{card1.question1}"</p>
              <p className="text-[#1E2A47]/70 italic">"{card1.question2}"</p>
              <p className="text-[#1E2A47]/70 italic">"{card1.question3}"</p>
            </div>

            <p className="text-[#1E2A47] font-semibold">
              {card1.result}
            </p>
          </motion.div>

          {/* Card 2: Premium */}
          <motion.div
            className="bg-[#F5EDE4] p-8 rounded-3xl border-2 border-[#1E2A47]/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-[#E88B7A]" />
              <h3 className="text-2xl font-bold text-[#1E2A47]">
                {card2.title}
              </h3>
            </div>
            
            <p className="text-[#1E2A47]/80 mb-6">
              {card2.description}
            </p>

            <p className="text-[#E88B7A] font-bold text-lg">
              {card2.result}
            </p>
          </motion.div>

          {/* Card 3: Limitations */}
          <motion.div
            className="bg-[#F5EDE4] p-8 rounded-3xl border-2 border-[#E88B7A]/30"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-[#E88B7A]" />
              <h3 className="text-2xl font-bold text-[#1E2A47]">
                {card3.title}
              </h3>
            </div>
            
            <p className="text-[#1E2A47]/80">
              {card3.description}
            </p>
          </motion.div>
        </div>

        {/* Pull Quote */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <blockquote className="text-2xl lg:text-3xl font-bold text-[#1E2A47] italic">
            "{t('quote')}"
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
