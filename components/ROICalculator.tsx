'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

const OPTION_2_PRICE = 2990; // Phase 0 price
const OPTION_1_FEE_RATE = 0.02; // 2% - Aligned with messaging

export default function ROICalculator() {
  const t = useTranslations('roi');
  const [gmv, setGmv] = useState(150000);
  const [conversionIncrease, setConversionIncrease] = useState(15);
  const [profitMargin, setProfitMargin] = useState(20);

  // Option 1 (SaaS) - 2.5% per transaction
  const option1Year1 = gmv * OPTION_1_FEE_RATE;
  const option1Year2 = gmv * OPTION_1_FEE_RATE;
  const option1Year3 = gmv * OPTION_1_FEE_RATE;
  const option1Total3Years = option1Year1 + option1Year2 + option1Year3;

  // Option 2 (Ownership) - One-time 2990€
  const option2Year1 = OPTION_2_PRICE;
  const option2Year2 = 0;
  const option2Year3 = 0;
  const option2Total3Years = OPTION_2_PRICE;

  // Savings Option 2 vs Option 1
  const savingsYear1 = option1Year1 - option2Year1;
  const savingsYear2 = option1Year2 - option2Year2;
  const savingsYear3 = option1Year3 - option2Year3;
  const savingsTotal3Years = option1Total3Years - option2Total3Years;

  // Break-even calculation (months)
  const monthlyOption1Cost = option1Year1 / 12;
  const breakEvenMonths = OPTION_2_PRICE / monthlyOption1Cost;

  // Conversion impact (same for both options)
  const additionalRevenue = gmv * (conversionIncrease / 100);
  const additionalProfit = additionalRevenue * (profitMargin / 100);

  // Determine slider level class for color coding
  const getSliderLevelClass = () => {
    if (conversionIncrease === 0) return 'level-conservative';
    if (conversionIncrease < 25) return 'level-moderate';
    if (conversionIncrease < 40) return 'level-optimistic';
    return 'level-very-optimistic';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="roi-section" id="roi">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        <div className="roi-calculator">
          {/* GMV Input */}
          <div className="roi-inputs-grid">
            <div className="roi-input">
              <label>{t('gmvLabel')}</label>
              <div className="roi-input-wrapper">
                <input
                  type="number"
                  id="gmvInput"
                  value={gmv}
                  onChange={(e) => setGmv(Number(e.target.value))}
                  step={10000}
                  min={0}
                />
                <span className="currency">€</span>
              </div>
              <div className="roi-input-hint">{t('gmvHint')}</div>
            </div>

            <div className="roi-input">
              <label>{t('marginLabel')}</label>
              <div className="roi-input-wrapper">
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  step={1}
                  min={0}
                  max={100}
                />
                <span className="currency">%</span>
              </div>
              <div className="roi-input-hint">{t('marginHint')}</div>
            </div>
          </div>

          {/* Growth Acceleration Path */}
          <div className="roi-shopify-plus-comparison">
            <h3>{t('shopifyPlusComparison.title')}</h3>
            
            <div className="comparison-grid">
              <div className="comparison-card shopify-plus">
                <div className="card-header">{t('shopifyPlusComparison.shopifyPlusHeader')}</div>
                <div className="card-price">Target for scaling merchants</div>
                <ul className="card-features">
                  <li>{t('shopifyPlusComparison.shopifyPlusFeature1')}</li>
                  <li>{t('shopifyPlusComparison.shopifyPlusFeature2')}</li>
                  <li>{t('shopifyPlusComparison.shopifyPlusFeature3')}</li>
                </ul>
              </div>

              <div className="comparison-card zedtech highlighted">
                <div className="card-header">{t('shopifyPlusComparison.zedtechHeader')}</div>
                <div className="card-price">{formatCurrency(OPTION_2_PRICE)} {t('shopifyPlusComparison.once')}</div>
                <ul className="card-features">
                  <li>{t('shopifyPlusComparison.zedtechFeature1')}</li>
                  <li>{t('shopifyPlusComparison.zedtechFeature2')}</li>
                  <li>{t('shopifyPlusComparison.zedtechFeature3')}</li>
                </ul>
              </div>
            </div>

            <div className="savings-banner">
              <div className="savings-icon">🚀</div>
              <div className="savings-text">
                <strong>{t('shopifyPlusComparison.savingsYear1')}</strong> {formatCurrency(additionalRevenue)}
                <br />
                <strong>{t('shopifyPlusComparison.savings3Years')}</strong> {formatCurrency(additionalRevenue * 3)}
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>Additional revenue to fund your Plus upgrade</span>
              </div>
            </div>
          </div>

          {/* Quick Comparison */}
          <div className="roi-quick-comparison ">
            <div className="roi-card option1">
              <div className="roi-label">Option 1 - Coût annuel</div>
              <div className="roi-value">{formatCurrency(option1Year1)}</div>
              <div className="roi-detail">2% du GMV chaque année</div>
            </div>
            
            <div className="roi-vs">VS</div>
            
            <div className="roi-card option2">
              <div className="roi-label">Option 2 - Coût total</div>
              <div className="roi-value">{formatCurrency(OPTION_2_PRICE)}</div>
              <div className="roi-detail">Paiement unique, puis 0€ à vie</div>
            </div>
          </div>

          {/* Break-even */}
          <div className="roi-breakeven-card">
            <h3>⚡ Option 2 devient rentable en <strong>{Math.round(breakEvenMonths)} mois</strong></h3>
            <p>Après ce délai, chaque mois est 100% économie pure par rapport à l'Option 1.</p>
            <details style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>💡 Comment on calcule ?</summary>
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <p style={{ margin: '8px 0' }}><strong>Option 1:</strong> {formatCurrency(gmv)} × 2% = {formatCurrency(option1Year1)}/an</p>
                <p style={{ margin: '8px 0' }}><strong>Option 2:</strong> Paiement unique de {formatCurrency(OPTION_2_PRICE)}</p>
                <p style={{ margin: '8px 0' }}><strong>Breakeven:</strong> {formatCurrency(OPTION_2_PRICE)} ÷ {formatCurrency(monthlyOption1Cost)}/mois = {Math.round(breakEvenMonths)} mois</p>
                <p style={{ margin: '8px 0', fontSize: '13px', fontStyle: 'italic' }}>Les économies affichées = différence entre les coûts totaux sur 3 ans.</p>
              </div>
            </details>
          </div>

          {/* 3-Year Comparison Table */}
          <div className="roi-summary">
            <h3>💰 Comparaison sur 3 ans</h3>
            
            {/* Desktop Table */}
            <table className="roi-summary-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Année 1</th>
                  <th>Année 2</th>
                  <th>Année 3</th>
                  <th>Total 3 ans</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Option 1</strong></td>
                  <td>{formatCurrency(option1Year1)}</td>
                  <td>{formatCurrency(option1Year2)}</td>
                  <td>{formatCurrency(option1Year3)}</td>
                  <td><strong>{formatCurrency(option1Total3Years)}</strong></td>
                </tr>
                <tr>
                  <td><strong>Option 2</strong></td>
                  <td>{formatCurrency(option2Year1)}</td>
                  <td>{formatCurrency(option2Year2)}</td>
                  <td>{formatCurrency(option2Year3)}</td>
                  <td><strong>{formatCurrency(option2Total3Years)}</strong></td>
                </tr>
                <tr className="total-row success-row">
                  <td><strong>💰 Économie Option 2</strong></td>
                  <td className={savingsYear1 > 0 ? 'success' : 'negative'}>
                    {savingsYear1 > 0 ? '+' : ''}{formatCurrency(savingsYear1)}
                  </td>
                  <td className="success">+{formatCurrency(savingsYear2)}</td>
                  <td className="success">+{formatCurrency(savingsYear3)}</td>
                  <td className="success"><strong>+{formatCurrency(savingsTotal3Years)}</strong></td>
                </tr>
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="roi-summary-mobile">
              <div className="roi-year-card">
                <div className="roi-year-title">Année 1</div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 1</span>
                  <span className="roi-year-value">{formatCurrency(option1Year1)}</span>
                </div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 2</span>
                  <span className="roi-year-value">{formatCurrency(option2Year1)}</span>
                </div>
                <div className="roi-year-row highlight">
                  <span className="roi-year-label"><strong>Économie</strong></span>
                  <span className={`roi-year-value ${savingsYear1 > 0 ? 'success' : 'negative'}`}>
                    <strong>{savingsYear1 > 0 ? '+' : ''}{formatCurrency(savingsYear1)}</strong>
                  </span>
                </div>
              </div>

              <div className="roi-year-card">
                <div className="roi-year-title">Année 2</div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 1</span>
                  <span className="roi-year-value">{formatCurrency(option1Year2)}</span>
                </div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 2</span>
                  <span className="roi-year-value">{formatCurrency(option2Year2)}</span>
                </div>
                <div className="roi-year-row highlight">
                  <span className="roi-year-label"><strong>Économie</strong></span>
                  <span className="roi-year-value success">
                    <strong>+{formatCurrency(savingsYear2)}</strong>
                  </span>
                </div>
              </div>

              <div className="roi-year-card">
                <div className="roi-year-title">Année 3</div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 1</span>
                  <span className="roi-year-value">{formatCurrency(option1Year3)}</span>
                </div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 2</span>
                  <span className="roi-year-value">{formatCurrency(option2Year3)}</span>
                </div>
                <div className="roi-year-row highlight">
                  <span className="roi-year-label"><strong>Économie</strong></span>
                  <span className="roi-year-value success">
                    <strong>+{formatCurrency(savingsYear3)}</strong>
                  </span>
                </div>
              </div>

              <div className="roi-year-card total">
                <div className="roi-year-title">Total 3 ans</div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 1</span>
                  <span className="roi-year-value">{formatCurrency(option1Total3Years)}</span>
                </div>
                <div className="roi-year-row">
                  <span className="roi-year-label">Option 2</span>
                  <span className="roi-year-value">{formatCurrency(option2Total3Years)}</span>
                </div>
                <div className="roi-year-row highlight">
                  <span className="roi-year-label"><strong>💰 ÉCONOMIE TOTALE</strong></span>
                  <span className="roi-year-value success">
                    <strong>+{formatCurrency(savingsTotal3Years)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="roi-divider">
            <span>+</span>
          </div>

          {/* Conversion Impact */}
          <div className="roi-conversion-section">
            <h3 className="roi-conversion-title">{t('conversionTitle')}</h3>
            <p className="roi-conversion-subtitle">{t('conversionSubtitle')}</p>

            <div className="roi-conversion-slider">
              <label>{t('conversionLabel')}</label>
              <div className="slider-container">
                <div className="slider-wrapper">
                  <input
                    type="range"
                    id="conversionInput"
                    min={0}
                    max={50}
                    value={conversionIncrease}
                    onChange={(e) => setConversionIncrease(Number(e.target.value))}
                    step={5}
                  />
                </div>
                <div className={`slider-value ${getSliderLevelClass()}`}>
                  <div className="slider-value-label">
                    {conversionIncrease === 0 && t('sliderLabel1')}
                    {conversionIncrease > 0 && conversionIncrease < 25 && t('sliderLabel2')}
                    {conversionIncrease >= 25 && conversionIncrease < 40 && t('sliderLabel3')}
                    {conversionIncrease >= 40 && t('sliderLabel4')}
                  </div>
                  <div className="slider-value-number">
                    <span id="conversionDisplay">{conversionIncrease}</span>%
                  </div>
                </div>
              </div>
            </div>

            <div className="roi-conversion-results">
              <div className="roi-card">
                <div className="roi-label">{t('additionalRevenue')}</div>
                <div className="roi-value success">{formatCurrency(additionalRevenue)}</div>
              </div>
              <div className="roi-card highlight">
                <div className="roi-label">{t('additionalProfit')} {profitMargin}%)</div>
                <div className="roi-value success">{formatCurrency(additionalProfit)}</div>
              </div>
            </div>

            <div className="roi-total-impact">
              <h4>🚀 Impact Total sur 3 ans</h4>
              <div className="roi-total-numbers">
                <div>
                  <div className="roi-total-label">Économies vs Option 1</div>
                  <div className="roi-total-value">{formatCurrency(savingsTotal3Years)}</div>
                </div>
                <div className="plus">+</div>
                <div>
                  <div className="roi-total-label">Profit conversions (3 ans)</div>
                  <div className="roi-total-value">{formatCurrency(additionalProfit * 3)}</div>
                </div>
                <div className="equals">=</div>
                <div className="highlighted">
                  <div className="roi-total-label">GAIN TOTAL</div>
                  <div className="roi-total-value success">
                    {formatCurrency(savingsTotal3Years + (additionalProfit * 3))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="roi-note">
            <p><strong>💡 {t('boosterFeesDisclosure')}</strong></p>
            <p>{t('note')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
