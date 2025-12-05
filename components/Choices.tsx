'use client';

import { useTranslations } from 'next-intl';

export default function Choices() {
  const t = useTranslations('choices');

  return (
    <section className="choices-section-business" id="choices">
      <div className="container">
        {/* Header avec accroche business */}
        <div className="choices-business-header">
          <h2 className="choices-business-title">
            {t('title')}
          </h2>
          <p className="choices-business-subtitle">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid de comparaison avec 2 cartes */}
        <div className="choices-business-grid">
          
          {/* OPTION 1 - Paiement au succès */}
          <div className="choice-business-card">
            <div className="choice-business-header">
              <span className="choice-business-badge">{t('option1.badge')}</span>
              <h3 className="choice-business-card-title">{t('option1.title')}</h3>
            </div>

            <div className="choice-business-pricing">
              <div className="choice-price-big">{t('option1.price')}</div>
              <div className="choice-price-then">{t('option1.priceDetail')}</div>
            </div>

            <p className="choice-business-desc">{t('option1.description')}</p>

            <ul className="choice-business-features">
              <li><span className="check-icon">✓</span> {t('option1.feature1').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option1.feature2').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option1.feature3').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option1.feature4').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option1.feature5').replace('✓ ', '')}</li>
            </ul>

            <div className="choice-business-footer">
              <div className="choice-business-highlight">
                {t('option1.highlight')}
              </div>
              <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="btn-business btn-business-secondary">
                {t('option1.cta')}
              </a>
            </div>
          </div>

          {/* OPTION 2 - Propriété */}
          <div className="choice-business-card">
            <div className="choice-business-featured-badge">
              <span className="presale-badge">{t('option2.presaleBadge')}</span>
            </div>

            <div className="choice-business-header">
              <span className="choice-business-badge">{t('option2.badge')}</span>
              <h3 className="choice-business-card-title">{t('option2.title')}</h3>
            </div>

            <div className="choice-business-pricing">
              <div className="choice-price-big">
                {t('option2.price')}
                <span className="price-strikethrough">{t('option2.priceDetail')}</span>
              </div>
              <div className="choice-price-then">{t('option2.priceSuffix')}</div>
            </div>

            <p className="choice-business-desc">{t('option2.description')}</p>

            <ul className="choice-business-features">
              <li><span className="check-icon">✓</span> {t('option2.feature1').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option2.feature2').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option2.feature3').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option2.feature4').replace('✓ ', '')}</li>
              <li><span className="check-icon">✓</span> {t('option2.feature5').replace('✓ ', '')}</li>
            </ul>

            <div className="choice-business-footer">
              <div className="choice-business-highlight">
                {t('option2.highlight')}
              </div>
              <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="btn-business btn-business-primary">
                {t('option2.cta')}
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
