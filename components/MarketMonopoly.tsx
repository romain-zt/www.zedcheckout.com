'use client';

import { useTranslations } from 'next-intl';

export default function MarketMonopoly() {
  const t = useTranslations('marketMonopoly');

  return (
    <section className="market-monopoly-section" id="market-monopoly">
      <div className="monopoly-container">
        {/* Title */}
        <h2 className="monopoly-title">{t('title')}</h2>
        
        {/* Subtitle */}
        <p className="monopoly-subtitle">{t('subtitle')}</p>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Stat 1 */}
          <div className="stat-card">
            <div className="stat-icon">{t('stat1_icon')}</div>
            <div className="stat-number">{t('stat1_number')}</div>
            <div className="stat-label">{t('stat1_label')}</div>
            <div className="stat-detail">{t('stat1_detail')}</div>
          </div>
          
          {/* Stat 2 */}
          <div className="stat-card">
            <div className="stat-icon">{t('stat2_icon')}</div>
            <div className="stat-number">{t('stat2_number')}</div>
            <div className="stat-label">{t('stat2_label')}</div>
            <div className="stat-detail">{t('stat2_detail')}</div>
          </div>
          
          {/* Stat 3 */}
          <div className="stat-card">
            <div className="stat-icon">{t('stat3_icon')}</div>
            <div className="stat-number">{t('stat3_number')}</div>
            <div className="stat-label">{t('stat3_label')}</div>
            <div className="stat-detail">{t('stat3_detail')}</div>
          </div>
        </div>
        
        {/* Testimonial Card */}
        {/* <div className="testimonial-card">
          <p className="testimonial-text">
            {t('testimonial_text')}
          </p>
          <p className="testimonial-author">
            {t('testimonial_author')}
          </p>
        </div> */}
        
        {/* CTA Button */}
        <a 
          href="https://form.typeform.com/to/QWh5K32o"
          target="_blank"
          rel="noopener noreferrer"
          className="monopoly-cta"
          aria-label={t('cta')}
        >
          {t('cta')}
        </a>
      </div>
    </section>
  );
}

