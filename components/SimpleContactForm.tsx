'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { submitContactForm } from '@/app/actions/contact';
import Modal from './Modal';

interface SimpleContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleContactForm({ isOpen, onClose }: SimpleContactFormProps) {
  const t = useTranslations('contactForm');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    stakeholderType: '',
    firstName: '',
    website: '',
    email: '',
    phone: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ stakeholderType: '', firstName: '', website: '', email: '', phone: '' });
      setErrors({});
      setFeedback(null);
    }
  }, [isOpen]);

  // Auto-focus first field on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const firstInput = document.querySelector<HTMLSelectElement>('#stakeholderType');
        firstInput?.focus();
      }, 100);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.stakeholderType) {
      newErrors.stakeholderType = t('errors.required');
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('errors.required');
    }

    if (!formData.website.trim()) {
      newErrors.website = t('errors.required');
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = t('errors.invalidUrl');
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = t('errors.required');
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = t('errors.invalidEmail');
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('errors.required');
    } else {
      const phonePattern = /^[\d\s\+\-\(\)]+$/;
      if (!phonePattern.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 8) {
        newErrors.phone = t('errors.invalidPhone');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await submitContactForm(formData);

      if (result.isSuccess) {
        setFeedback({ type: 'success', message: t('success') });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setFeedback({ type: 'error', message: t('error') });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: t('error') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track stakeholder type selection with GA4
    if (field === 'stakeholderType' && value && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'stakeholder_type_selected', {
        event_category: 'contact_form',
        event_label: value,
      });
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="-mt-11 sm:mt-0">
        {/* Header */}
        <div className="mb-4 sm:mb-8 sm:pr-8">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#1E2A47] mb-1 leading-tight">
                  {t('title')}
                </h2>
                <p className="text-[#1E2A47]/60 text-xs sm:text-sm">
                  {t('subtitle')}
                </p>
              </div>

              {/* Intro Text */}
              <p className="text-[11px] sm:text-sm text-[#1E2A47]/70 mb-4 sm:mb-6">
                {t('intro')}
              </p>

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
                {/* Stakeholder Type */}
                <div>
                  <label htmlFor="stakeholderType" className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('fields.stakeholderType')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    id="stakeholderType"
                    value={formData.stakeholderType}
                    onChange={(e) => handleChange('stakeholderType', e.target.value)}
                    className={`w-full px-3 py-2 sm:py-2.5 text-[15px] rounded-lg border ${
                      errors.stakeholderType
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-1 focus:ring-[#E88B7A]/20 transition-colors bg-white appearance-none cursor-pointer`}
                    disabled={isLoading}
                  >
                    <option value="">{t('fields.stakeholderPlaceholder')}</option>
                    <option value="partner">{t('fields.stakeholderPartner')}</option>
                    <option value="researcher">{t('fields.stakeholderResearcher')}</option>
                    <option value="media">{t('fields.stakeholderMedia')}</option>
                    <option value="investor">{t('fields.stakeholderInvestor')}</option>
                    <option value="entrepreneur">{t('fields.stakeholderEntrepreneur')}</option>
                    <option value="other">{t('fields.stakeholderOther')}</option>
                  </select>
                  {errors.stakeholderType && (
                    <p className="mt-0.5 text-[11px] text-red-600">{errors.stakeholderType}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('fields.firstName')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 sm:py-2.5 text-[15px] rounded-lg border ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-1 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="mt-0.5 text-[11px] text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('fields.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 sm:py-2.5 text-[15px] rounded-lg border ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-1 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-0.5 text-[11px] text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('fields.phone')}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={`w-full px-3 py-2 sm:py-2.5 text-[15px] rounded-lg border ${
                      errors.phone
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-1 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="mt-0.5 text-[11px] text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-xs sm:text-sm font-medium text-[#1E2A47] mb-1">
                    {t('fields.website')}
                  </label>
                  <input
                    id="website"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className={`w-full px-3 py-2 sm:py-2.5 text-[15px] rounded-lg border ${
                      errors.website
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-1 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.website && (
                    <p className="mt-0.5 text-[11px] text-red-600">{errors.website}</p>
                  )}
                </div>

                {/* Privacy Note */}
                <div className="text-[11px] sm:text-xs text-[#1E2A47]/60 text-center py-2">
                  {t('privacyNote')}
                </div>

                {/* Submit Button */}
                <div className="pt-3 sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 sm:py-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-[#1E2A47]/10">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white font-bold text-[15px] sm:text-base rounded-lg shadow-lg active:scale-[0.98] sm:hover:shadow-xl sm:hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
