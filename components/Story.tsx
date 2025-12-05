'use client';

import { useTranslations } from 'next-intl';

export default function Story() {
  const t = useTranslations('story');

  return (
    <section id="story" className="story-section">
      <div className="container">
        <div className="story-content">
          <div className="section-header">
            <h2 className="section-title">
              {t('title')}
            </h2>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </div>

          {/* Case Study Card */}
          <div className="case-study-card">
            <p className="case-client-label">{t('clientLabel')}</p>
            
            <div className="metrics-grid">
              <div className="metric-box before">
                <span className="metric-label">{t('metricBefore').split(':')[0]}</span>
                <span className="metric-value">6.49%</span>
              </div>
              <div className="metric-arrow">→</div>
              <div className="metric-box after">
                <span className="metric-label">{t('metricAfter').split(':')[0]}</span>
                <span className="metric-value">8.01%</span>
              </div>
            </div>

            <div className="metric-summary">
              <p className="metric-gain">{t('metricGain')}</p>
              <p className="metric-revenue">{t('revenue')}</p>
            </div>

            <div className="changes-section">
              <h3 className="changes-title">{t('changesTitle')}</h3>
              <ul className="changes-list">
                <li>✓ {t('change1')}</li>
                <li>✓ {t('change2')}</li>
                <li>✓ {t('change3')}</li>
                <li>✓ {t('change4')}</li>
              </ul>
            </div>
          </div>

          {/* Behind-the-Scenes CTA */}
          <div className="behind-scenes-cta">
            <h3 className="behind-scenes-title">{t('behindScenesTitle')}</h3>
            <p className="behind-scenes-text">{t('behindScenesText')}</p>
            <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="behind-scenes-button">
              {t('behindScenesCta')} →
            </a>
          </div>

          {/* Disclaimer Box - Commented out for now (will revisit later) */}
          {/* 
          <div className="disclaimer-box">
            <h3 className="disclaimer-title">{t('disclaimerTitle')}</h3>
            <ul className="disclaimer-list">
              <li>{t('disclaimer1')}</li>
              <li>{t('disclaimer2')}</li>
              <li>{t('disclaimer3')}</li>
            </ul>
          </div>
          */}

          {/* Early Adopter Section - Commented out for now (will revisit later) */}
          {/* 
          <div className="early-adopter-section">
            <h3 className="early-adopter-title">{t('earlyAdopterTitle')}</h3>
            <div className="early-adopter-grid">
              <div className="advantage-box">
                <span className="icon">✅</span>
                <span className="text">{t('advantage')}</span>
              </div>
              <div className="disadvantage-box">
                <span className="icon">⚠️</span>
                <span className="text">{t('disadvantage')}</span>
              </div>
            </div>
            <button onClick={handleCTAClick} className="story-cta">
              {t('cta')}
            </button>
          </div>
          */}
        </div>
      </div>
    </section>
  );
}
