'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function CaptureFAQ() {
  const t = useTranslations('captureFAQ');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="capture-faq">
      <div className="faq-container">
        <h2 className="faq-title">{t('title')}</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${openIndex === index ? 'open' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="faq-question-text">{faq.q}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .capture-faq {
          padding: 80px 20px;
          background: #FFFFFF;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-title {
          font-size: 36px;
          font-weight: 800;
          color: #1E2A47;
          text-align: center;
          margin: 0 0 48px 0;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-item {
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: #E88B7A;
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s;
        }

        .faq-question.open {
          background: #F9FAFB;
        }

        .faq-question-text {
          font-size: 18px;
          font-weight: 600;
          color: #1E2A47;
          flex: 1;
          padding-right: 20px;
        }

        .faq-icon {
          font-size: 28px;
          font-weight: 300;
          color: #E88B7A;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }

        .faq-answer.open {
          max-height: 500px;
          transition: max-height 0.5s ease-in;
        }

        .faq-answer p {
          padding: 0 28px 24px 28px;
          margin: 0;
          font-size: 16px;
          color: #5A5A5A;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .capture-faq {
            padding: 60px 20px;
          }

          .faq-title {
            font-size: 28px;
            margin: 0 0 32px 0;
          }

          .faq-question {
            padding: 20px;
          }

          .faq-question-text {
            font-size: 16px;
          }

          .faq-icon {
            font-size: 24px;
            width: 28px;
            height: 28px;
          }

          .faq-answer p {
            padding: 0 20px 20px 20px;
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}

