'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import SimpleContactForm from './SimpleContactForm';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-[#1E2A47]/10 shadow-sm'
            : 'bg-white/80 backdrop-blur-md border-b border-[#1E2A47]/5'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <a
            href={`/${locale}`}
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#1E2A47] to-[#E88B7A] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            ZedCheckout
          </a>

          {/* CTA Button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white px-6 py-3 min-h-[44px] rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            {t('cta')}
          </button>
        </nav>
      </header>

      <SimpleContactForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
