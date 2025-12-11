'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { submitLeadCapture } from '@/app/actions/lead-capture';

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

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl pointer-events-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-[#1E2A47]/40 hover:text-[#1E2A47] transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1E2A47] mb-2">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('firstName')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('email')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('website')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors"
                    disabled={isLoading}
                  />
                  <p className="mt-1.5 text-xs text-[#1E2A47]/50">
                    {t('websiteHelper')}
                  </p>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('platform')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) => handleChange('platform', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors bg-white"
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
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('sector')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    required
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors bg-white"
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
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('revenue')}
                  </label>
                  <select
                    value={formData.revenue}
                    onChange={(e) => handleChange('revenue', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors bg-white"
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
                  <label className="block text-sm font-semibold text-[#1E2A47] mb-2">
                    {t('challenge')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.challenge}
                    onChange={(e) => handleChange('challenge', e.target.value)}
                    placeholder={t('challengePlaceholder')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#1E2A47]/20 focus:border-[#E88B7A] focus:outline-none transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent}
                    onChange={(e) => handleChange('consent', e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#E88B7A] border-2 border-[#1E2A47]/20 rounded focus:ring-2 focus:ring-[#E88B7A]/20"
                    disabled={isLoading}
                  />
                  <label htmlFor="consent" className="text-sm text-[#1E2A47]/70">
                    {t('consent')}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.consent}
                  className="w-full py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
