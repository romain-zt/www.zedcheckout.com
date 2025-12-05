'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function HeroCapture() {
  const t = useTranslations('hero');

  return (
    <section className="hero-capture">
      <div className="hero-container-z">
        {/* TOP LEFT: Badge + Headline + Subtitle */}
        <div className="hero-top-left">
          <span className="hero-tag">
            {t('tag')}
          </span>
          
          <h1 className="hero-title-z">
            {t('captureTitle')}
          </h1>
          
          <p className="hero-subtitle-z">
            {t('captureSubtitle')}
          </p>
        </div>

        {/* TOP RIGHT: Visual */}
        <div className="hero-top-right">
          <Image
            src="/assets/images/report.png"
            alt="Checkout Optimization Dashboard"
            width={600}
            height={500}
            className="hero-image"
            priority
          />
        </div>

        {/* CENTER: Unique Selling Point */}
        {/* <div className="hero-center-note">
          <p className="hero-usp">
            {t('captureNote')}
          </p>
        </div> */}

        {/* BOTTOM LEFT: Benefits */}
        <div className="hero-bottom-left">
          <div className="hero-benefits-z">
            <div className="benefit-item">✓ {t('captureBenefit1')}</div>
            <div className="benefit-item">✓ {t('captureBenefit2')}</div>
            <div className="benefit-item">✓ {t('captureBenefit3')}</div>
          </div>
        </div>

        {/* BOTTOM RIGHT: CTA */}
        <div className="hero-bottom-right">
          <div className="hero-cta-wrapper">
            <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="hero-cta-z">
              <span>{t('captureCTA')}</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Styles from globals.css will handle the layout
// The Z-pattern styling is managed in the global stylesheet

