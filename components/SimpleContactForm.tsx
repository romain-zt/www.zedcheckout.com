'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { submitContactForm } from '@/app/actions/contact';

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto"
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
                <h2 className="text-3xl font-bold text-[#1E2A47] mb-2">
                  {t('title')}
                </h2>
                <p className="text-[#1E2A47]/60 text-sm">
                  {t('subtitle')}
                </p>
              </div>

              {/* Intro Text */}
              <p className="text-sm text-[#1E2A47]/70 mb-6">
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
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Stakeholder Type */}
                <div>
                  <label htmlFor="stakeholderType" className="block text-sm font-medium text-[#1E2A47] mb-2">
                    {t('fields.stakeholderType')} <span className="text-[#E88B7A]">*</span>
                  </label>
                  <select
                    id="stakeholderType"
                    value={formData.stakeholderType}
                    onChange={(e) => handleChange('stakeholderType', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.stakeholderType
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#E88B7A]/20 transition-colors bg-white`}
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
                    <p className="mt-1.5 text-sm text-red-600">{errors.stakeholderType}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#1E2A47] mb-2">
                    {t('fields.firstName')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1E2A47] mb-2">
                    {t('fields.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#1E2A47] mb-2">
                    {t('fields.phone')}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.phone
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                                {/* Website */}
                                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-[#1E2A47] mb-2">
                    {t('fields.website')}
                  </label>
                  <input
                    id="website"
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.website
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-[#1E2A47]/20 focus:border-[#E88B7A]'
                    } focus:outline-none focus:ring-2 focus:ring-[#E88B7A]/20 transition-colors`}
                    disabled={isLoading}
                  />
                  {errors.website && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.website}</p>
                  )}
                </div>

                {/* Privacy Note */}
                <div className="text-sm text-[#1E2A47]/60 text-center py-2">
                  {t('privacyNote')}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
