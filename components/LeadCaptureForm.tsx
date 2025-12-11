'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { submitLeadCapture } from '@/app/actions/lead-capture';
import Modal from './Modal';

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadCaptureForm({ isOpen, onClose }: LeadCaptureFormProps) {
  const t = useTranslations('leadCapture');
  const platforms = t.raw('platforms') as Record<string, string>;
  const sectors = t.raw('sectors') as Record<string, string>;
  const revenueOptions = t.raw('revenueOptions') as Record<string, string>;

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    website: '',
    platform: '',
    sector: '',
    revenue: '',
    challenge: '',
    consent: false
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        email: '',
        website: '',
        platform: '',
        sector: '',
        revenue: '',
        challenge: '',
        consent: false
      });
      setFeedback(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      setFeedback({ type: 'error', message: 'Vous devez accepter d\'être contacté' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await submitLeadCapture(formData);

      if (result.isSuccess) {
        setFeedback({ type: 'success', message: t('success') });
        
        // Track with GA4
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'lead_capture_submitted', {
            event_category: 'conversion',
            platform: formData.platform,
            sector: formData.sector
          });
        }

        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setFeedback({ type: 'error', message: t('error') });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: t('error') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="-mt-11 sm:mt-0">
        {/* Header */}
        <div className="mb-4 sm:mb-8 sm:pr-8">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#1E2A47] leading-tight">
                  {t('h2')}
                </h2>
              </div>

              {/* Feedback message */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                
                {/* First Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('firstName')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('email')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('website')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    inputMode="url"
                    autoComplete="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                  <p className="mt-0.5 text-[11px] text-[#1E2A47]/50">
                    {t('websiteHelper')}
                  </p>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('platform')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) => handleChange('platform', e.target.value)}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="">{t('platformPlaceholder')}</option>
                    {Object.entries(platforms).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('sector')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    required
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="">{t('sectorPlaceholder')}</option>
                    {Object.entries(sectors).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Revenue (optional) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('revenue')}
                  </label>
                  <select
                    value={formData.revenue}
                    onChange={(e) => handleChange('revenue', e.target.value)}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors bg-white appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="">{t('revenuePlaceholder')}</option>
                    {Object.entries(revenueOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Challenge */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('challenge')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.challenge}
                    onChange={(e) => handleChange('challenge', e.target.value)}
                    placeholder={t('challengePlaceholder')}
                    rows={3}
                    className="w-full min-h-[44px] px-3 py-3 text-base rounded-lg border border-[#1E2A47]/20 focus:border-[#E88B7A] focus:ring-1 focus:ring-[#E88B7A]/20 focus:outline-none transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent}
                    onChange={(e) => handleChange('consent', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#E88B7A] border border-[#1E2A47]/20 rounded focus:ring-1 focus:ring-[#E88B7A]/20 cursor-pointer"
                    disabled={isLoading}
                  />
                  <label htmlFor="consent" className="text-[11px] sm:text-xs text-[#1E2A47]/70 leading-snug cursor-pointer">
                    {t('consent')}
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-3 sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-[#1E2A47]/10">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.consent}
                    className="w-full min-h-[44px] py-3 sm:py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white font-bold text-base sm:text-lg rounded-lg shadow-lg active:scale-[0.98] sm:hover:shadow-xl sm:hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t('submitting')}
                    </span>
                  ) : (
                    t('submit')
                  )}
                </button>
                </div>
              </form>
      </div>
    </Modal>
  );
}
