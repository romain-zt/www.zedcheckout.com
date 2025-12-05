'use client';

import { useTranslations } from 'next-intl';

export default function ProblemSection() {
  const t = useTranslations('problem');

  const problems = [
    {
      emoji: '💸',
      title: t('pain1Title'),
      description: t('pain1Desc'),
    },
    {
      emoji: '📉',
      title: t('pain2Title'),
      description: t('pain2Desc'),
    },
    // {
    //   emoji: '🔒',
    //   title: t('pain3Title'),
    //   description: t('pain3Desc'),
    // },
  ];

  return (
    <section className="problem-section">
      <div className="problem-container">
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <div key={index} className="problem-card">
              <div className="problem-emoji">{problem.emoji}</div>
              <h3 className="problem-title">{problem.title}</h3>
              <p className="problem-description">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .problem-section {
          padding: 80px 20px;
          background: #FFFFFF;
        }

        .problem-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .problem-card {
          background: #F9FAFB;
          padding: 40px 32px;
          border-radius: 16px;
          text-align: center;
          transition: all 0.3s;
          border: 2px solid #E5E7EB;
        }

        .problem-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(30, 42, 71, 0.08);
          border-color: #E88B7A;
        }

        .problem-emoji {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .problem-title {
          font-size: 22px;
          font-weight: 700;
          color: #1E2A47;
          margin: 0 0 16px 0;
        }

        .problem-description {
          font-size: 16px;
          color: #5A5A5A;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .problem-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .problem-card {
            padding: 32px 24px;
          }
        }

        @media (max-width: 768px) {
          .problem-section {
            padding: 60px 20px;
          }

          .problem-emoji {
            font-size: 40px;
          }

          .problem-title {
            font-size: 20px;
          }

          .problem-description {
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}

