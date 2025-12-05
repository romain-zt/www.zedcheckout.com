'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          {t('brand')}
        </div>
        
        <div className="footer-links">
          <a href="#product">{t('links.product')}</a>
          <a href="#pricing">{t('links.pricing')}</a>
          <a href="#docs">{t('links.docs')}</a>
          <a href="#support">{t('links.support')}</a>
          <a href="#legal">{t('links.legal')}</a>
          <a href="#privacy">{t('links.privacy')}</a>
          <a href="#terms">{t('links.terms')}</a>
        </div>

        <div className="footer-legal">
          <p>{t('legal.entity')}</p>
          <p>{t('legal.siret')}</p>
          <p>{t('legal.address')}</p>
          <p>
            <a href={`mailto:${t('legal.contact')}`}>
              {t('legal.contact')}
            </a>
          </p>
        </div>

        <div className="footer-copyright">
          {t('copyright')}
        </div>

        {t('disclaimer') && (
          <div className="footer-disclaimer" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', opacity: 0.7, textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t('disclaimer')}
          </div>
        )}
      </div>
    </footer>
  );
}
