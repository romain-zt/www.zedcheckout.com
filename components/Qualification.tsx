'use client';

import { useTranslations } from 'next-intl';

export default function Qualification() {
  const t = useTranslations('qualification');

  return (
    <section className="qualification-section">
      <div className="container">
        <div className="qualification-content">
          <h2 className="qualification-title">
            {t('title')}
          </h2>
          <p className="qualification-subtitle">
            {t('subtitle')}
          </p>

          <div className="qualification-grid">
            <div className="qualification-criteria">
              <div className="criterion-item">
                <span className="criterion-text">{t('criterion1')}</span>
              </div>
              <div className="criterion-item">
                <span className="criterion-text">{t('criterion2')}</span>
              </div>
              <div className="criterion-item">
                <span className="criterion-text">{t('criterion3')}</span>
              </div>
              <div className="criterion-item">
                <span className="criterion-text">{t('criterion4')}</span>
              </div>
            </div>

            <div className="qualification-validation">
              <div className="validation-box">
                <p className="validation-text">
                  {t('validText')}
                </p>
                <a 
                  href="/quiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qualification-cta"
                >
                  {t('cta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qualification-section {
          background: var(--light-gray, #F5EDE4);
          padding: 60px 20px;
        }

        @media (max-width: 768px) {
          .qualification-section {
            padding: 40px 20px;
          }
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .qualification-content {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 768px) {
          .qualification-content {
            padding: 30px 20px;
          }
        }

        .qualification-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--navy, #1E2A47);
          text-align: center;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .qualification-title {
            font-size: 24px;
          }
        }

        .qualification-subtitle {
          font-size: 16px;
          color: var(--text-secondary, #5A5A5A);
          text-align: center;
          margin-bottom: 40px;
        }

        .qualification-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .qualification-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .qualification-criteria {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .criterion-item {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: #FEF2F2;
          border-left: 4px solid #DC2626;
          border-radius: 8px;
        }

        .criterion-text {
          font-size: 15px;
          color: var(--navy, #1E2A47);
          line-height: 1.5;
        }

        .qualification-validation {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .validation-box {
          background: #F0FDF4;
          border: 2px solid #10B981;
          border-radius: 12px;
          padding: 24px;
        }

        .validation-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--navy, #1E2A47);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .qualification-cta {
          display: block;
          width: 100%;
          padding: 14px 24px;
          background: #E88B7A;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          text-decoration: none;
        }

        .qualification-cta:hover {
          background: #d67766;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(232, 139, 122, 0.3);
        }

        .qualification-cta:active {
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}

