'use client';

import { useTranslations } from 'next-intl';

export default function Process() {
  const t = useTranslations('process');

  const steps = [
    { title: t('step1Title'), desc: t('step1Desc'), tag: t('step1Tag') },
    { title: t('step2Title'), desc: t('step2Desc'), tag: t('step2Tag') },
    { title: t('step3Title'), desc: t('step3Desc'), tag: t('step3Tag') },
    { title: t('step4Title'), desc: t('step4Desc'), tag: t('step4Tag') },
  ];

  return (
    <section className="process-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t('title')}
          </h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className="process-container">
          <div className="process-timeline">
            {steps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="process-number">
                  {index + 1}
                </div>
                
                <div className="process-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <span className="process-highlight">{step.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="process-cta">
            <h3>{t('ctaTitle')}</h3>
            <p>{t('ctaSubtitle')}</p>
            <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
