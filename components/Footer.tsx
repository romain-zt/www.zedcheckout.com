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
          <a
            href="https://linkedin.com/in/romain-piveteau"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://piveteau.digital"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
          </a>
          <a href="mailto:romain@zedtech.fr">
            romain@zedtech.fr
          </a>
        </div>

        <div className="footer-legal">
          <p>
            ZED TECH - EURL {t('legal.capital')} - SIRET: 99324412800019
          </p>
          <p>
            {t('legal.address')}
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
