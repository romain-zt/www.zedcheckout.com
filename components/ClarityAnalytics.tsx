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

    // Wait for the page to be fully loaded including styles
    const initClarity = () => {
      if (document.readyState === 'complete') {
        // Add a small delay to ensure CSS is fully applied
        setTimeout(() => {
          Clarity.init(clarityProjectId);
          console.log('Microsoft Clarity initialized with project ID:', clarityProjectId);
        }, 100);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            Clarity.init(clarityProjectId);
            console.log('Microsoft Clarity initialized with project ID:', clarityProjectId);
          }, 100);
        });
      }
    };

    initClarity();
  }, []);

  return null;
}

