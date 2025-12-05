'use client';

import { useTranslations } from 'next-intl';

export default function Notice() {
  const t = useTranslations('notice');

  return (
    <section className="notice-section">
      <div className="container">
        <div className="notice-box">
          <h2 className="notice-title">
            {t('title')}
          </h2>
          
          <div className="notice-list">
            <div className="notice-item">{t('item1')}</div>
            <div className="notice-item">{t('item2')}</div>
            
            <div className="notice-or">
              {t('or')}
            </div>
            
            <div className="notice-item">{t('item3')}</div>
            <div className="notice-item">{t('item4')}</div>
          </div>

          <p style={{ fontSize: '18px', marginTop: '32px', opacity: 0.9 }}>
            {t('conclusion')}
          </p>

          <div className="notice-cta">
            <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.8 }}>
              {t('doubt')}
            </p>
            <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
