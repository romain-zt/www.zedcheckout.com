'use client';

import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';
import { submitCaptureForm } from '@/app/actions/capture';
import { useRouter, usePathname } from 'next/navigation';
import { trackCaptureConversion } from '@/lib/google-ads';

export default function CaptureForm() {
  const t = useTranslations('capture');
  const router = useRouter();
  const pathname = usePathname();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Client-side validation
    if (!firstName.trim() || !email.trim()) {
      setError(t('error'));
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('error'));
      setIsSubmitting(false);
      return;
    }

    try {
      // Get locale from pathname (e.g., /fr-FR/landing -> fr-FR)
      const locale = pathname.split('/')[1] || 'fr-FR';
      
      // Get user agent and referrer
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

      const result = await submitCaptureForm({
        firstName: firstName.trim(),
        email: email.trim(),
        locale,
        timestamp: new Date().toISOString(),
        userAgent,
        referrer,
      });

      if (result.isSuccess) {
        // Track Google Ads conversion
        trackCaptureConversion();

        // Set cookie for 7 days
        document.cookie = `captured_lead=true; max-age=${7 * 24 * 60 * 60}; path=/`;

        // Redirect to sales page
        const salesPath = `/${locale}/sales`;
        router.push(salesPath);
      } else {
        setError(t('error'));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Capture form error:', err);
      setError(t('error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="capture-form-wrapper">
      <div className="capture-form-container">
        <h3 className="capture-form-title">{t('title')}</h3>
        <p className="capture-form-subtitle">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="capture-form">
          <div className="form-fields">
            <input
              type="text"
              placeholder={t('firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="form-input"
              disabled={isSubmitting}
            />
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="form-submit"
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </button>

          {error && <p className="form-error">{error}</p>}

          <p className="form-privacy">{t('privacy')}</p>
        </form>
      </div>

      <style jsx>{`
        .capture-form-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, #F5EDE4 0%, #FFFFFF 100%);
        }

        .capture-form-container {
          max-width: 500px;
          width: 100%;
          background: #FFFFFF;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(30, 42, 71, 0.1);
        }

        .capture-form-title {
          font-size: 28px;
          font-weight: 700;
          color: #1E2A47;
          margin: 0 0 12px 0;
          text-align: center;
        }

        .capture-form-subtitle {
          font-size: 16px;
          color: #5A5A5A;
          margin: 0 0 32px 0;
          text-align: center;
        }

        .capture-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-input {
          height: 50px;
          padding: 0 20px;
          font-size: 16px;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: #E88B7A;
          box-shadow: 0 0 0 3px rgba(232, 139, 122, 0.1);
        }

        .form-input:disabled {
          background: #F9FAFB;
          cursor: not-allowed;
        }

        .form-submit {
          height: 56px;
          background: #E88B7A;
          color: #FFFFFF;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .form-submit:hover:not(:disabled) {
          background: #D97A69;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(232, 139, 122, 0.3);
        }

        .form-submit:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #FFFFFF;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .form-error {
          color: #EF4444;
          font-size: 14px;
          margin: 0;
          text-align: center;
        }

        .form-privacy {
          color: #9CA3AF;
          font-size: 13px;
          margin: 8px 0 0 0;
          text-align: center;
        }

        @media (max-width: 768px) {
          .capture-form-container {
            padding: 24px;
          }

          .capture-form-title {
            font-size: 24px;
          }

          .capture-form-subtitle {
            font-size: 15px;
          }

          .form-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

