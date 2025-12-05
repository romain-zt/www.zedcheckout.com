'use client';

import { useTranslations } from 'next-intl';

export default function DevHero() {
  const t = useTranslations('devHero');

  return (
    <section className="hero dev-hero">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-tag">
            {t('tag')}
          </span>
          
          <h1>
            {t('title')}
          </h1>
          
          <p className="subtitle">
            {t('subtitle')}
          </p>

          <div className="hero-cta">
            <a href="https://form.typeform.com/to/QWh5K32o" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t('cta')}
            </a>
            <a href="#features" className="btn btn-secondary">
              {t('ctaSecondary')}
            </a>
          </div>
        </div>

        <div className="hero-visual dev-hero-visual">
          <div className="code-snippet">
            <div className="code-header">
              <div className="code-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="code-title">checkout-boilerplate/</span>
            </div>
            <div className="code-content">
              <pre><code>{`// Setup in 30 minutes
import { CheckoutProvider } from '@/lib/checkout'
import { StripeConfig } from '@/config/stripe'

export default function CustomCheckout() {
  return (
    <CheckoutProvider
      shopifyBridge={true}
      stripeConfig={StripeConfig}
      abTesting={true}
    >
      <CheckoutFlow />
    </CheckoutProvider>
  )
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
