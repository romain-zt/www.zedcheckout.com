'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function ComparisonTable() {
  const t = useTranslations('zedcheckout.comparison_table');
  const columns = t.raw('columns') as string[];
  const rows = t.raw('rows') as Array<{
    criteria: string;
    chatgpt: string;
    shop_app: string;
    zedcheckout: string;
  }>;

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
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

        {/* Desktop Table */}
        <motion.div
          className="hidden md:block overflow-x-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr>
                <th className="bg-[#1E2A47] text-[#F5EDE4] font-bold text-left p-4 rounded-tl-lg text-sm sm:text-base">
                  
                </th>
                <th className="bg-[#1E2A47] text-[#F5EDE4] font-bold text-center p-4 text-sm sm:text-base">
                  {columns[0]}
                </th>
                <th className="bg-[#1E2A47] text-[#F5EDE4] font-bold text-center p-4 text-sm sm:text-base">
                  {columns[1]}
                </th>
                <th className="bg-[#1E2A47] text-[#F5EDE4] font-bold text-center p-4 rounded-tr-lg text-sm sm:text-base border-l-4 border-[#FFC9B9]">
                  {columns[2]}
                </th>
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5EDE4]/30'}
                >
                  <td className="font-semibold text-[#1E2A47] p-4 text-sm sm:text-base">
                    {row.criteria}
                  </td>
                  <td className="text-center p-4 text-sm sm:text-base">
                    {row.chatgpt}
                  </td>
                  <td className="text-center p-4 text-sm sm:text-base">
                    {row.shop_app}
                  </td>
                  <td className="text-center p-4 text-sm sm:text-base font-semibold border-l-4 border-[#FFC9B9] bg-[#FFC9B9]/10">
                    {row.zedcheckout}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-8">
          {rows.map((row, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-[#1E2A47]/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h3 className="text-lg font-bold text-[#1E2A47] mb-4 pb-3 border-b-2 border-[#F5EDE4]">
                {row.criteria}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#1E2A47]/70">{columns[0]}</span>
                  <span className="text-base">{row.chatgpt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#1E2A47]/70">{columns[1]}</span>
                  <span className="text-base">{row.shop_app}</span>
                </div>
                <div className="flex justify-between items-center bg-[#FFC9B9]/20 rounded-lg p-3 border-l-4 border-[#FFC9B9]">
                  <span className="text-sm font-bold text-[#1E2A47]">{columns[2]}</span>
                  <span className="text-base font-bold">{row.zedcheckout}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
