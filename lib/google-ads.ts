/**
 * Google Ads Conversion Tracking
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Tracks a lead form submission conversion (waitlist)
 */
export function trackLeadConversion() {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17670223006/IdWPCKiXrcgbEJ7p6OlB',
      'value': 1.0,
      'currency': 'EUR'
    });
    console.log('Google Ads lead conversion tracked');
  } else {
    console.warn('Google Ads gtag not available');
  }
}

/**
 * Tracks a capture form submission conversion (landing page)
 */
export function trackCaptureConversion() {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17670223006/CAPTURE_CONVERSION_LABEL', // To be configured with actual label
      'value': 1.0,
      'currency': 'EUR',
      'event_category': 'Lead Capture',
      'event_label': 'Landing Page Capture'
    });
    console.log('Google Ads capture conversion tracked');
  } else {
    console.warn('Google Ads gtag not available');
  }
}

