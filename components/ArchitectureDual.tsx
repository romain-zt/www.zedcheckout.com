'use client';

import { useTranslations } from 'next-intl';

export default function ArchitectureDual() {
  const t = useTranslations('architectureDual');

  return (
    <section className="architecture-dual-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        <div className="architecture-grid">
          {/* Colonne 1 - Schéma Architecture */}
          <div className="column diagram-column">
            <h3 className="column-title">{t('diagramTitle')}</h3>
            <div className="architecture-diagram">
              <div className="checkout-box active">
                <div className="box-title">{t('diagram_shopify')}</div>
                <div className="box-subtitle">{t('diagram_shopify_sub')}</div>
                <div className="box-status">✓ {t('diagram_shopify_status')}</div>
              </div>

              <div className="arrow">↓</div>
              <div className="arrow-label">{t('diagram_arrow_label')}</div>
              <div className="arrow">↓</div>

              <div className="checkout-box custom">
                <div className="box-title">{t('diagram_custom')}</div>
                <div className="box-subtitle">{t('diagram_custom_sub')}</div>
                <div className="box-status">{t('diagram_custom_status')}</div>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Points Rassurance */}
          <div className="column benefits-column">
            <h3 className="column-title">{t('benefitsTitle')}</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span className="benefit-text">{t('benefit1')}</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span className="benefit-text">{t('benefit2')}</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span className="benefit-text">{t('benefit3')}</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                <span className="benefit-text">{t('benefit4')}</span>
              </div>
            </div>
          </div>

          {/* Colonne 3 - Témoignage */}
          <div className="column testimonial-column">
            <h3 className="column-title">{t('testimonialTitle')}</h3>
            <div className="testimonial-box">
              <p className="testimonial-text">"{t('testimonial')}"</p>
              <div className="testimonial-author">
                <span className="author-name">{t('testimonialAuthor')}</span>
                <span className="author-title">{t('testimonialAuthorTitle')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-container">
          <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="cta-button">
            {t('cta')}
          </a>
        </div>
      </div>

      <style jsx>{`
        .architecture-dual-section {
          background: white;
          padding: 80px 20px;
        }

        @media (max-width: 768px) {
          .architecture-dual-section {
            padding: 60px 20px;
          }
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 700;
          color: var(--navy, #1E2A47);
          margin-bottom: 16px;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 28px;
          }
        }

        .section-subtitle {
          font-size: 18px;
          color: var(--text-secondary, #5A5A5A);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .section-subtitle {
            font-size: 16px;
          }
        }

        .architecture-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-bottom: 50px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .architecture-grid {
            grid-template-columns: 1fr;
            gap: 50px;
          }
        }

        .column {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .column-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--navy, #1E2A47);
          margin-bottom: 24px;
          text-align: center;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* SCHÉMA ARCHITECTURE */
        .architecture-diagram {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          flex: 1;
          justify-content: flex-start;
        }

        .checkout-box {
          background: var(--light-gray, #F5EDE4);
          border: 2px solid var(--navy, #1E2A47);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          width: 100%;
          max-width: 280px;
          transition: all 0.3s ease;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .checkout-box.active {
          border-color: #10B981;
          background: linear-gradient(135deg, #F0FDF4, #D1FAE5);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .checkout-box.custom {
          border-color: var(--accent, #E88B7A);
          background: linear-gradient(135deg, var(--beige, #FAF7F4), #FFE4D6);
          box-shadow: 0 4px 12px rgba(232, 139, 122, 0.2);
        }

        .box-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy, #1E2A47);
          margin-bottom: 8px;
        }

        .box-subtitle {
          font-size: 14px;
          color: var(--text-secondary, #5A5A5A);
          margin-bottom: 12px;
        }

        .box-status {
          font-size: 14px;
          font-weight: 600;
          color: #10B981;
        }

        .arrow {
          font-size: 32px;
          color: var(--accent, #E88B7A);
          line-height: 0.5;
        }

        .arrow-label {
          font-size: 14px;
          color: var(--text-secondary, #5A5A5A);
          text-align: center;
          padding: 0 20px;
        }

        /* POINTS RASSURANCE */
        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--light-gray, #F5EDE4);
          border-radius: 10px;
          transition: all 0.3s ease;
          min-height: 60px;
        }

        .benefit-item:hover {
          background: #FAF7F4;
          transform: translateX(5px);
        }

        .benefit-icon {
          font-size: 24px;
          color: #10B981;
          font-weight: 700;
          flex-shrink: 0;
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .benefit-text {
          font-size: 16px;
          color: var(--navy, #1E2A47);
          line-height: 1.6;
          flex: 1;
        }

        /* TÉMOIGNAGE */
        .testimonial-box {
          background: linear-gradient(135deg, #FEF2F2, #FFE4E6);
          border: 2px solid var(--accent, #E88B7A);
          border-radius: 12px;
          padding: 28px;
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 200px;
        }

        .testimonial-box::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 60px;
          color: var(--accent, #E88B7A);
          opacity: 0.3;
          font-family: Georgia, serif;
        }

        .testimonial-text {
          font-size: 16px;
          color: var(--navy, #1E2A47);
          line-height: 1.7;
          margin-bottom: 20px;
          font-style: italic;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .author-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--navy, #1E2A47);
        }

        .author-title {
          font-size: 14px;
          color: var(--text-secondary, #5A5A5A);
        }

        /* CTA */
        .cta-container {
          display: flex;
          justify-content: center;
        }

        .cta-button {
          display: inline-block;
          padding: 16px 40px;
          background: var(--accent, #E88B7A);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(232, 139, 122, 0.3);
          text-decoration: none;
        }

        .cta-button:hover {
          background: #d67766;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(232, 139, 122, 0.4);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .cta-button {
            width: 100%;
            max-width: 400px;
          }
        }
      `}</style>
    </section>
  );
}

