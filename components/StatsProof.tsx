'use client';

import { useTranslations } from 'next-intl';

export default function StatsProof() {
  const t = useTranslations('stats');

  const stats = [
    {
      number: '100%',
      label: t('monopoly'),
      desc: t('monopolyDesc'),
    },
    {
      number: '+20%',
      label: t('savings'),
      desc: t('savingsDesc'),
    },
    {
      number: '+20%',
      label: t('conversions'),
      desc: t('conversionsDesc'),
    },
  ];

  return (
    <section className="stats-proof">
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-desc">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stats-proof {
          padding: 80px 20px;
          background: #F5EDE4;
        }

        .stats-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 56px;
          font-weight: 800;
          color: #E88B7A;
          margin-bottom: 12px;
          line-height: 1;
        }

        .stat-label {
          font-size: 20px;
          font-weight: 700;
          color: #1E2A47;
          margin-bottom: 8px;
        }

        .stat-desc {
          font-size: 14px;
          color: #5A5A5A;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .stats-proof {
            padding: 60px 20px;
          }

          .stats-grid {
            gap: 32px;
          }

          .stat-number {
            font-size: 48px;
          }

          .stat-label {
            font-size: 18px;
          }

          .stat-desc {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}

