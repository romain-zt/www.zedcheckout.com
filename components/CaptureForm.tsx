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
    <section className="w-full flex justify-center py-12 px-4 sm:py-16 sm:px-6 md:py-20 bg-gradient-to-br from-[#F5EDE4] to-white">
      <div className="max-w-md sm:max-w-lg w-full bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E2A47] mb-3 sm:mb-4 text-center">
          {t('title')}
        </h3>
        <p className="text-sm sm:text-base text-[#5A5A5A] mb-6 sm:mb-8 text-center">
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t('firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full min-h-[44px] py-3 px-4 sm:px-5 text-base border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 font-sans focus:border-[#E88B7A] focus:ring-2 focus:ring-[#E88B7A]/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full min-h-[44px] py-3 px-4 sm:px-5 text-base border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 font-sans focus:border-[#E88B7A] focus:ring-2 focus:ring-[#E88B7A]/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] sm:min-h-[52px] py-3 sm:py-4 bg-[#E88B7A] text-white text-base sm:text-lg font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#D97A69] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">
              {error}
            </p>
          )}

          <p className="text-gray-400 text-xs sm:text-sm mt-2 text-center">
            {t('privacy')}
          </p>
        </form>
      </div>
    </section>
  );
}

