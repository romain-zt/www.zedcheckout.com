'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="hero">
      <div className="hero-container-z">
        {/* TOP LEFT: Badge + Headline */}
        <div className="hero-top-left">
          <span className="hero-tag">
            {t('tag')}
          </span>
          
          <h1 className="hero-title-z">
            {t('title')}
          </h1>
          
          <p className="hero-subtitle-z">
            {t('subtitle')}
          </p>

          <div className="hero-benefits-z">
            <div className="benefit-item">✓ {t('benefit1')}</div>
            <div className="benefit-item">✓ {t('benefit2')}</div>
            <div className="benefit-item">✓ {t('benefit3')}</div>
          </div>
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

        {/* BOTTOM LEFT: Options + Benefits + CTAs */}
        <div className="hero-bottom-left">
          <div className="hero-options-z">
            <div className="hero-option-z">
              {/* <span className="option-icon-z">💰</span> */}
              <span className="option-text-z">{t('option1')}</span>
            </div>
            <div className="hero-option-z">
              {/* <span className="option-icon-z">🔒</span> */}
              <span className="option-text-z">{t('option2')}</span>
            </div>
          </div>


          <div className="hero-cta-z">
            <Link href={`/${locale}/quiz`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('cta')}
            </Link>
            <a href="#roi" className="btn btn-secondary">
              {t('ctaSecondary')}
            </a>
          </div>
        </div>

        {/* BOTTOM RIGHT: Conversion Promise */}
        <div className="hero-bottom-right">
          <div className="conversion-promise">
            <div className="conversion-icon">{t('conversionIcon')}</div>
            <p className="conversion-text">
              {t('conversionPromise')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
