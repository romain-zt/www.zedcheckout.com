'use client';

import { useTranslations } from 'next-intl';

export default function DevTimeline() {
  const t = useTranslations('devTimeline');

  const milestones = [
    {
      date: t('milestone1Date'),
      title: t('milestone1Title'),
      features: [
        t('milestone1Feature1'),
        t('milestone1Feature2'),
        t('milestone1Feature3'),
      ],
    },
    {
      date: t('milestone2Date'),
      title: t('milestone2Title'),
      features: [
        t('milestone2Feature1'),
        t('milestone2Feature2'),
        t('milestone2Feature3'),
      ],
    },
  ];

  return (
    <section id="timeline" className="dev-timeline-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t('title')}
          </h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className="timeline-container">
          {milestones.map((milestone, index) => (
            <div key={index} className="timeline-milestone">
              <div className="timeline-date">
                {milestone.date}
              </div>
              <div className="timeline-content">
                <h3 className="timeline-title">{milestone.title}</h3>
                <ul className="timeline-features">
                  {milestone.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
