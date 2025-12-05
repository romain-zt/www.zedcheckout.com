'use client';

import { useTranslations } from 'next-intl';

export default function Offers() {
  const t = useTranslations('offers');

  const offers = [
    {
      badge: t('option1.badge'),
      title: t('option1.title'),
      desc: t('option1.desc'),
      features: [
        t('option1.feature1'),
        t('option1.feature2'),
        t('option1.feature3'),
        t('option1.feature4'),
        t('option1.feature5'),
        t('option1.feature6'),
      ],
      price: t('option1.price'),
      priceDetail: t('option1.priceDetail'),
      priceLabel: t('option1.priceLabel'),
      cta: t('option1.cta'),
      ctaLink: 'https://form.typeform.com/to/QWh5K32o',
      featured: false,
      variant: 'saas',
    },
    {
      badge: t('option2.badge'),
      badge2: '',
      title: t('option2.title'),
      desc: t('option2.desc'),
      features: [
        t('option2.feature1'),
        t('option2.feature2'),
        t('option2.feature3'),
        t('option2.feature4'),
        t('option2.feature5'),
        t('option2.feature6'),
      ],
      price: t('option2.pricePhase0'),
      priceOriginal: t('option2.priceOriginal'),
      priceDetail: t('option2.priceDetail'),
      priceLabel: t('option2.priceLabel'),
      ctaNote: t('option2.ctaNote'),
      cta: t('option2.cta'),
      ctaLink: 'https://form.typeform.com/to/QWh5K32o',
      featured: false,
      variant: 'ownership',
    },
  ];

  return (
    <section className="offers-section" id="offers">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t('title')}
          </h2>
          <p className="section-subtitle">
            {t('subtitle')}
          </p>
        </div>

        <div className="offers-grid-two">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`offer-card-new ${offer.featured ? 'featured' : ''} option-${index + 1}`}
            >
              <div className="offer-badges">
                {offer.badge && (
                  <div className="offer-badge">
                    {offer.badge}
                  </div>
                )}
                {offer.badge2 && (
                  <div className="offer-badge badge2">
                    {offer.badge2}
                  </div>
                )}
              </div>
              
              <div className="offer-content">
                <h3>{offer.title}</h3>
                <p className="description">{offer.desc}</p>
                
                <div className="offer-pricing-inline">
                  <div className="price-main">{offer.price}</div>
                  {offer.priceOriginal && (
                    <div className="price-original">{offer.priceOriginal}</div>
                  )}
                  <div className="price-detail">{offer.priceDetail}</div>
                  {offer.priceLabel && (
                    <div className="price-label">{offer.priceLabel}</div>
                  )}
                </div>
                
                <ul className="offer-features">
                  {offer.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="offer-footer">
                <a 
                  href={offer.ctaLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {offer.cta}
                </a>
                {offer.ctaNote && (
                  <div className="cta-note">{offer.ctaNote}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
