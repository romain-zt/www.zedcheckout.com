'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition, useEffect } from 'react';
import { submitWaitlistForm } from '@/app/actions/waitlist';
import { trackLeadConversion } from '@/lib/google-ads';

interface WaitlistProps {
  variant?: 'sme' | 'developer';
  pageSource: 'main' | 'developers';
}

export default function Waitlist({ variant = 'sme', pageSource }: WaitlistProps) {
  const t = useTranslations('contact');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCalendarModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCalendarModal]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCalendarModal) {
        setShowCalendarModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCalendarModal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      preferredOption: formData.get('preferredOption') as string,
      pageSource,
    };

    startTransition(async () => {
      const result = await submitWaitlistForm(data);
      
      if (result.isSuccess) {
        setMessage({ type: 'success', text: result.message });
        (e.target as HTMLFormElement).reset();
        
        // Track Google Ads conversion
        trackLeadConversion();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    });
  };

  return (
    <>
      <section id="contact" className="waitlist-section">
        <div className="container">
          <div className="waitlist-content">
            <h2 className="waitlist-title">
              {t('title')}
            </h2>
            <p className="waitlist-subtitle">
              {t('subtitle')}
            </p>

            <div className="waitlist-grid">
              {/* Left Column: Form */}
              <div className="waitlist-form-wrapper">
                <form onSubmit={handleSubmit} className="waitlist-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        {t('firstNameLabel')} *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder={t('firstNamePlaceholder')}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">
                        {t('lastNameLabel')} *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder={t('lastNamePlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      {t('emailLabel')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t('emailPlaceholder')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      {t('phoneLabel')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder={t('phonePlaceholder')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferredOption">
                      {t('preferredOptionLabel')} *
                    </label>
                    <select
                      id="preferredOption"
                      name="preferredOption"
                      required
                    >
                      <option value="">{t('selectOption')}</option>
                      <option value="Option 1 (0€ → 2%)">{t('preferredOption1')}</option>
                      <option value="Option 2 (2,990€ → 0%)">{t('preferredOption2')}</option>
                      <option value="Not sure">{t('preferredOption3')}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-submit"
                  >
                    {isPending ? t('submitting') : t('submit')}
                  </button>

                  {message && (
                    <div
                      style={{
                        marginTop: '24px',
                        padding: '16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                        color: message.type === 'success' ? '#065F46' : '#991B1B',
                        border: `2px solid ${message.type === 'success' ? '#6EE7B7' : '#FCA5A5'}`
                      }}
                    >
                      {message.text}
                    </div>
                  )}

                  <p className="form-note">
                    {t('note')}
                  </p>
                </form>
              </div>

              {/* Divider */}
              <div className="waitlist-divider">
                <span className="divider-text">{t('orDivider')}</span>
              </div>

              {/* Right Column: Direct Booking */}
              <div className="waitlist-direct-booking">
                <div className="direct-booking-card">
                  <div className="direct-booking-icon">📅</div>
                  <h3 className="direct-booking-title">{t('bookDirectTitle')}</h3>
                  <p className="direct-booking-subtitle">{t('bookDirectSubtitle')}</p>
                  
                  <ul className="direct-booking-benefits">
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6666 5L7.49998 14.1667L3.33331 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('bookDirectBenefit1')}
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6666 5L7.49998 14.1667L3.33331 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('bookDirectBenefit2')}
                    </li>
                    <li>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6666 5L7.49998 14.1667L3.33331 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('bookDirectBenefit3')}
                    </li>
                  </ul>

                  <button
                    type="button"
                    className="btn-book-direct"
                    onClick={() => setShowCalendarModal(true)}
                  >
                    {t('bookDirectButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Calendar Button */}
      <button
        type="button"
        className="floating-calendar-btn"
        onClick={() => setShowCalendarModal(true)}
        aria-label={t('bookAppointment')}
      >
        <span className="floating-btn-icon">📅</span>
        <span className="floating-btn-text">{t('bookAppointment')}</span>
      </button>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="calendar-modal-close"
              onClick={() => setShowCalendarModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="calendar-modal-header">
              <h3>{t('bookAppointmentTitle')}</h3>
              <p>{t('bookAppointmentSubtitle')}</p>
            </div>
            <div className="calendar-modal-content">
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3DBlkRFKtPUqd4kOBIAsUooK7KH_OnUGXSiWBssm6h35zjUEjkOkDrV2ddiqfBw5pyIz2Yf9sC?gv=true"
                style={{ border: 0, minHeight: '70vh', width: '100%' }}
                width="100%"
                height="100%"
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
