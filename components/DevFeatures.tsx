'use client';

import { useTranslations } from 'next-intl';

export default function DevFeatures() {
  const t = useTranslations('devFeatures');

  const features = [
    {
      icon: '📦',
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: '📚',
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: '🎨',
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
    {
      icon: '🔌',
      title: t('feature4Title'),
      description: t('feature4Desc'),
    },
    {
      icon: '🧪',
      title: t('feature5Title'),
      description: t('feature5Desc'),
    },
    {
      icon: '💬',
      title: t('feature6Title'),
      description: t('feature6Desc'),
    },
  ];

  return (
    <section id="features" className="dev-features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t('title')}
          </h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className="dev-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="dev-feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
