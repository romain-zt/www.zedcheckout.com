'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SimpleContactForm from './SimpleContactForm';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track nav clicks with GA4
  const handleNavClick = (label: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'nav_click', {
        event_category: 'navigation',
        event_label: label,
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Smooth scroll to anchor
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    handleNavClick(href.replace('#', ''));
  };

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#recherches"
              onClick={(e) => scrollToSection(e, '#recherches')}
              className="text-sm text-[#1E2A47]/70 hover:text-[#E88B7A] transition-colors duration-300 font-medium"
            >
              {t('nav.research')}
            </a>
            <a
              href="#produits"
              onClick={(e) => scrollToSection(e, '#produits')}
              className="text-sm text-[#1E2A47]/70 hover:text-[#E88B7A] transition-colors duration-300 font-medium"
            >
              {t('nav.products')}
            </a>
            <a
              href="#apropos"
              onClick={(e) => scrollToSection(e, '#apropos')}
              className="text-sm text-[#1E2A47]/70 hover:text-[#E88B7A] transition-colors duration-300 font-medium"
            >
              {t('nav.about')}
            </a>
          </div>

          {/* CTA Button (Desktop & Mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] text-white px-6 py-3 min-h-[44px] rounded-full font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t('cta')}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#1E2A47] hover:text-[#E88B7A] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X 
                  className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Drawer */}
        <div
          className={`md:hidden fixed inset-0 top-[73px] bg-white border-t border-[#1E2A47]/10 shadow-lg transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex flex-col items-center gap-6 p-8 bg-white shadow-lg">
            <a
              href="#recherches"
              onClick={(e) => scrollToSection(e, '#recherches')}
              className={`text-lg text-[#1E2A47]/70 hover:text-[#E88B7A] transition-all duration-300 font-medium transform min-h-[44px] flex items-center ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100 delay-100' : 'translate-x-4 opacity-0'
              }`}
            >
              {t('nav.research')}
            </a>
            <a
              href="#produits"
              onClick={(e) => scrollToSection(e, '#produits')}
              className={`text-lg text-[#1E2A47]/70 hover:text-[#E88B7A] transition-all duration-300 font-medium transform min-h-[44px] flex items-center ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100 delay-200' : 'translate-x-4 opacity-0'
              }`}
            >
              {t('nav.products')}
            </a>
            <a
              href="#apropos"
              onClick={(e) => scrollToSection(e, '#apropos')}
              className={`text-lg text-[#1E2A47]/70 hover:text-[#E88B7A] transition-all duration-300 font-medium transform min-h-[44px] flex items-center ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100 delay-300' : 'translate-x-4 opacity-0'
              }`}
            >
              {t('nav.about')}
            </a>
          </div>
        </div>
      </header>

      <SimpleContactForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
