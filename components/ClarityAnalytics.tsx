'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityAnalytics() {
  useEffect(() => {
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    if (!clarityProjectId) {
      console.warn('Microsoft Clarity Project ID not found. Please set NEXT_PUBLIC_CLARITY_PROJECT_ID environment variable.');
      return;
    }

    const initClarity = async () => {
      // Wait for fonts to be ready (Google Fonts, etc.)
      if ('fonts' in document) {
        try {
          await (document as any).fonts.ready;
        } catch (e) {
          console.warn('Font loading check failed, proceeding anyway');
        }
      }

      // Then wait for complete page load and rendering
      const startClarity = () => {
        // Force reflow to ensure CSS is applied
        void document.documentElement.offsetHeight;
        
        setTimeout(() => {
          Clarity.init(clarityProjectId);
          console.log('Microsoft Clarity initialized with fonts and CSS ready');
        }, 500);
      };

      if (document.readyState === 'complete') {
        startClarity();
      } else {
        window.addEventListener('load', startClarity);
      }
    };

    initClarity();
  }, []);

  return null;
}

