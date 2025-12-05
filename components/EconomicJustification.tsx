'use client';

import { useTranslations } from 'next-intl';

export default function EconomicJustification() {
  const t = useTranslations('economic');

  return (
    <section className="economic-section">
      <div className="container">
        {/* Hook + Question */}
        <div className="economic-header">
          <h2 className="economic-hook">
            {t('hook')}{' '}
            <span className="economic-hook-highlight" dangerouslySetInnerHTML={{ __html: t('hookHighlight') }} />
          </h2>
          <p className="economic-question">{t('question')}</p>
        </div>

        {/* Tableau Comparatif */}
        <div className="economic-table-wrapper">
          <table className="economic-table">
            <thead>
              <tr>
                <th className="economic-table-header-empty"></th>
                <th className="economic-table-header economic-table-header-option1">
                  {t('tableCol1')}
                </th>
                <th className="economic-table-header economic-table-header-option2">
                  {t('tableCol2')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="economic-table-label">{t('tableYear1')}</td>
                <td className="economic-table-value economic-option1">
                  {t('recurringYear1')}
                </td>
                <td className="economic-table-value economic-option2">
                  {t('boosterYear1')}
                </td>
              </tr>
              <tr>
                <td className="economic-table-label">{t('tableYear2')}</td>
                <td className="economic-table-value economic-option1">
                  {t('recurringYear2')}
                </td>
                <td className="economic-table-value economic-option2 economic-option2-free">
                  {t('boosterYear2')}
                </td>
              </tr>
              <tr>
                <td className="economic-table-label">{t('tableYear3')}</td>
                <td className="economic-table-value economic-option1">
                  {t('recurringYear3')}
                </td>
                <td className="economic-table-value economic-option2 economic-option2-free">
                  {t('boosterYear3')}
                </td>
              </tr>
              <tr className="economic-table-separator">
                <td colSpan={3}></td>
              </tr>
              <tr className="economic-table-total">
                <td className="economic-table-label">{t('tableTotal')}</td>
                <td className="economic-table-value economic-option1 economic-total-value">
                  {t('recurringTotal')}
                </td>
                <td className="economic-table-value economic-option2 economic-total-value">
                  {t('boosterTotal')}
                </td>
              </tr>
              <tr>
                <td className="economic-table-label">{t('tableSavings')}</td>
                <td className="economic-table-value economic-option1">
                  {t('recurringSavings')}
                </td>
                <td className="economic-table-value economic-option2 economic-savings-highlight">
                  {t('boosterSavings')}
                </td>
              </tr>
              <tr className="economic-table-separator">
                <td colSpan={3}></td>
              </tr>
              <tr>
                <td className="economic-table-label">{t('tableOwnership')}</td>
                <td className="economic-table-value economic-option1">
                  <span className="economic-icon-negative">❌</span> {t('recurringOwnership')}
                </td>
                <td className="economic-table-value economic-option2">
                  <span className="economic-icon-positive">✅</span> {t('boosterOwnership')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calcul */}
        <p className="economic-calculation">{t('calculation')}</p>

        {/* Break-even */}
        <div className="economic-breakeven">
          <h3 className="economic-breakeven-title">
            {t('breakEvenTitle')}{' '}
            <span className="economic-breakeven-desc">{t('breakEvenDesc')}</span>
          </h3>
          
          <div className="economic-outcomes">
            <p className="economic-outcome-line">
              {t('afterYear1')}
              <strong className="economic-highlight-amount">{t('afterYear1Amount')}</strong>
              {t('afterYear1Period')}
            </p>
            
            <p className="economic-outcome-line">
              {t('over3Years')}
              <strong className="economic-highlight-amount">{t('over3YearsAmount')}</strong>
              {t('over3YearsBonus')}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="economic-cta">
          <a href="#roi" className="btn btn-secondary">
            {t('cta')} →
          </a>
        </div>
      </div>
    </section>
  );
}

