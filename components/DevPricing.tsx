'use client';

import { useTranslations } from 'next-intl';

export default function DevPricing() {
  const t = useTranslations('devPricing');

  return (
    <section id="pricing" className="dev-pricing-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t('title')}
          </h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className="dev-pricing-card">
          <div className="pricing-badge">
            {t('discount')}
          </div>

          <div className="pricing-header">
            <div className="price-comparison">
              <span className="regular-price">{t('regularPrice')}</span>
              <span className="presale-price">{t('preSalePrice')}</span>
            </div>
          </div>

          <div className="pricing-features">
            <ul>
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
              <li>{t('feature4')}</li>
            </ul>
          </div>

          <div className="pricing-cta">
            <a href="quiz" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('cta')}
            </a>
            <p className="pricing-note">{t('note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
