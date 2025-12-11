'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="relative bg-gradient-to-br from-[#0F172A] via-[#1E2A47] to-[#0F172A] text-white py-20 px-6 overflow-hidden border-t border-white/10">
      {/* Animated decorative background elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E88B7A]/10 to-transparent rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#FFC9B9]/10 to-transparent rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Brand with enhanced styling */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full">
            <div className="w-3 h-3 bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] rounded-full animate-pulse" />
            <div className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t('brand')}
            </div>
          </div>
        </div>
        
        {/* Main Links with glassmorphism cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16 max-w-5xl mx-auto">
          <a
            href="https://linkedin.com/in/romain-piveteau"
            target="_blank"
            rel="noopener noreferrer"
            className="group backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFC9B9]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">💼</div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                LinkedIn
              </div>
              <div className="text-xs text-white/50">12K followers</div>
            </div>
          </a>
          
          <a
            href="https://zedcheckout.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E88B7A]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">🚀</div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                ZedCheckout
              </div>
              <div className="text-xs text-white/50">Product</div>
            </div>
          </a>
          
          <a
            href="https://github.com/romain-zt"
            target="_blank"
            rel="noopener noreferrer"
            className="group backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFC9B9]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">💻</div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                GitHub
              </div>
              <div className="text-xs text-white/50">Code</div>
            </div>
          </a>
          
          <a 
            href="mailto:romain@zedcheckout.com"
            className="group backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E88B7A]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">✉️</div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                Email
              </div>
              <div className="text-xs text-white/50">Contact</div>
            </div>
          </a>
        </div>

        {/* Divider with gradient */}
        <div className="w-full max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />

        {/* Legal Information with better styling */}
        <div className="text-center space-y-3 mb-10 max-w-3xl mx-auto">
          <p className="text-sm text-white/70 font-light">
            {t('legal.company')} - {t('legal.siret')}
          </p>
          <p className="text-sm text-white/60 font-light">
            {t('legal.address')}
          </p>
          <p className="text-sm text-white/60 font-light">
            {t('legal.tva')}
          </p>
        </div>

        {/* Secondary Links with enhanced hover */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-10 text-sm">
          <a 
            href="/mentions-legales"
            className="text-white/50 hover:text-[#FFC9B9] transition-all duration-300 relative group"
          >
            <span className="relative">
              {t('legal.mentions')}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#FFC9B9] group-hover:w-full transition-all duration-300" />
            </span>
          </a>
          <span className="text-white/20">•</span>
          <a 
            href="/rgpd"
            className="text-white/50 hover:text-[#FFC9B9] transition-all duration-300 relative group"
          >
            <span className="relative">
              {t('legal.rgpd')}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#FFC9B9] group-hover:w-full transition-all duration-300" />
            </span>
          </a>
          <span className="text-white/20">•</span>
          <a 
            href="/confidentialite"
            className="text-white/50 hover:text-[#FFC9B9] transition-all duration-300 relative group"
          >
            <span className="relative">
              {t('legal.confidentiality')}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#FFC9B9] group-hover:w-full transition-all duration-300" />
            </span>
          </a>
        </div>

        {/* Copyright with accent */}
        <div className="text-center">
          <p className="text-sm text-white/40 font-light">
            {t('copyright')}
          </p>
          <div className="mt-6 w-16 h-1 bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] rounded-full mx-auto" />
        </div>
      </div>
    </footer>
  );
}
