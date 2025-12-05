'use client';

import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section className="how-it-works">
      <div className="container">
        <div className="header">
          <h2 className="title">{t('title')}</h2>
          <p className="subtitle">{t('subtitle')}</p>
          <div className="all-plans-badge">
            <span className="badge-text">{t('allPlans')}</span>
            <span className="no-plus">{t('noPlusNeeded')}</span>
          </div>
        </div>

        <div className="steps-grid">
          {/* Step 1 */}
          <div className="step">
            <div className="step-image">
              <div className="placeholder-image">
                <div className="placeholder-content">
                  <div className="shopify-icon">🛍️</div>
                  <div className="status-active">✅ {t('step1Status')}</div>
                </div>
                <div className="placeholder-label">{t('step1Label')}</div>
              </div>
            </div>
            <div className="step-content">
              <h3 className="step-title">{t('step1Title')}</h3>
              <p className="step-desc">{t('step1Desc')}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step">
            <div className="step-image">
              <div className="placeholder-image dual">
                <div className="dual-checkout">
                  <div className="checkout-box">
                    <span>{t('step2Current')}</span>
                    <span className="mini-status">✅</span>
                  </div>
                  <div className="plus-sign">+</div>
                  <div className="checkout-box zed">
                    <span>{t('step2Zed')}</span>
                    <span className="mini-status">✅</span>
                  </div>
                </div>
                <div className="placeholder-label">{t('step2Label')}</div>
              </div>
            </div>
            <div className="step-content">
              <h3 className="step-title">{t('step2Title')}</h3>
              <p className="step-desc">{t('step2Desc')}</p>
            </div>
          </div>

          {/* Step 3 - Full Width Bento */}
          <div className="step step-full">
            <div className="step-image-full">
              <div className="placeholder-image result">
                <div className="result-content">
                  <div className="conversion-metric">
                    <div className="before">6.49%</div>
                    <div className="arrow-right">→</div>
                    <div className="after">8.01%</div>
                    <div className="gain">+20%</div>
                  </div>
                  <div className="result-badge">{t('step3Badge')}</div>
                  <div className="result-details">
                    <h3 className="result-title">{t('step3Title')}</h3>
                    <p className="result-desc">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="guarantee">
          <h3 className="guarantee-title">{t('guaranteeTitle')}</h3>
          <div className="guarantee-grid">
            <div className="guarantee-item">
              <span className="guarantee-icon">🔄</span>
              <span className="guarantee-text">{t('guarantee1')}</span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">🛡️</span>
              <span className="guarantee-text">{t('guarantee2')}</span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">⚡</span>
              <span className="guarantee-text">{t('guarantee3')}</span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">✅</span>
              <span className="guarantee-text">{t('guarantee4')}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          padding: 100px 20px;
          background: #FFFFFF;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 80px;
        }

        .title {
          font-size: 42px;
          font-weight: 800;
          color: #1E2A47;
          margin: 0 0 20px 0;
        }

        .subtitle {
          font-size: 20px;
          color: #5A5A5A;
          margin: 0 0 32px 0;
          line-height: 1.6;
        }

        .all-plans-badge {
          display: inline-flex;
          flex-direction: column;
          gap: 8px;
          background: #E8F5E9;
          padding: 16px 32px;
          border-radius: 12px;
          border: 2px solid #4CAF50;
        }

        .badge-text {
          font-size: 18px;
          font-weight: 700;
          color: #2E7D32;
        }

        .no-plus {
          font-size: 14px;
          color: #5A5A5A;
          font-weight: 600;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 48px;
          margin-bottom: 80px;
        }

        .step {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: stretch;
        }

        .step-full {
          grid-column: 1 / -1;
        }

        .step-image {
          width: 100%;
        }

        .step-image-full {
          width: 100%;
        }

        .placeholder-image {
          background: linear-gradient(135deg, #F5EDE4 0%, #FFFFFF 100%);
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          padding: 40px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          position: relative;
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .shopify-icon {
          font-size: 64px;
        }

        .status-active {
          font-size: 18px;
          font-weight: 700;
          color: #4CAF50;
          background: rgba(76, 175, 80, 0.1);
          padding: 8px 24px;
          border-radius: 24px;
        }

        .dual-checkout {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .checkout-box {
          background: #FFFFFF;
          border: 3px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 18px;
          min-width: 120px;
        }

        .checkout-box.zed {
          border-color: #E88B7A;
          background: rgba(232, 139, 122, 0.05);
        }

        .plus-sign {
          font-size: 32px;
          font-weight: 700;
          color: #5A5A5A;
        }

        .mini-status {
          font-size: 20px;
        }

        .result-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          width: 100%;
        }

        .conversion-metric {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 32px;
          font-weight: 700;
        }

        .before {
          color: #95A5A6;
        }

        .arrow-right {
          color: #E88B7A;
        }

        .after {
          color: #4CAF50;
        }

        .gain {
          font-size: 48px;
          font-weight: 800;
          color: #4CAF50;
        }

        .result-badge {
          font-size: 14px;
          font-weight: 600;
          color: #5A5A5A;
          text-align: center;
          padding: 8px 16px;
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #E5E7EB;
        }

        .result-details {
          text-align: center;
          max-width: 800px;
        }

        .result-title {
          font-size: 28px;
          font-weight: 700;
          color: #1E2A47;
          margin: 0 0 12px 0;
        }

        .result-desc {
          font-size: 17px;
          color: #5A5A5A;
          line-height: 1.7;
          margin: 0;
        }

        .placeholder-label {
          font-size: 14px;
          font-weight: 600;
          color: #5A5A5A;
          text-align: center;
          padding: 8px 16px;
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #E5E7EB;
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-size: 24px;
          font-weight: 700;
          color: #1E2A47;
          margin: 0 0 12px 0;
        }

        .step-desc {
          font-size: 16px;
          color: #5A5A5A;
          line-height: 1.7;
          margin: 0;
        }

        .guarantee {
          background: linear-gradient(135deg, #1E2A47 0%, #2D3E5F 100%);
          padding: 48px;
          border-radius: 20px;
          text-align: center;
        }

        .guarantee-title {
          font-size: 28px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 32px 0;
        }

        .guarantee-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .guarantee-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .guarantee-icon {
          font-size: 32px;
        }

        .guarantee-text {
          font-size: 14px;
          color: #D1D5DB;
          text-align: center;
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .guarantee-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .how-it-works {
            padding: 60px 20px;
          }

          .header {
            margin-bottom: 48px;
          }

          .title {
            font-size: 32px;
          }

          .subtitle {
            font-size: 17px;
          }

          .all-plans-badge {
            padding: 12px 24px;
          }

          .badge-text {
            font-size: 16px;
          }

          .steps-grid {
            gap: 40px;
            margin-bottom: 60px;
          }

          .placeholder-image {
            padding: 24px;
            height: 240px;
          }

          .step-title {
            font-size: 20px;
          }

          .step-desc {
            font-size: 15px;
          }

          .guarantee {
            padding: 32px 20px;
          }

          .guarantee-title {
            font-size: 24px;
          }

          .guarantee-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .conversion-metric {
            font-size: 24px;
            gap: 12px;
          }

          .gain {
            font-size: 36px;
          }

          .result-title {
            font-size: 22px;
          }

          .result-desc {
            font-size: 15px;
          }

          .checkout-box {
            min-width: 100px;
            padding: 16px;
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}

