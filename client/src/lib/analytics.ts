/**
 * Google Analytics 4 Event Tracking Utility
 * 
 * Usage:
 * 1. Replace 'GA_MEASUREMENT_ID' in index.html with your actual GA4 Measurement ID (G-XXXXXXXXXX)
 * 2. Import and use trackEvent() to log custom events
 * 
 * Example:
 * trackEvent('button_click', { button_name: 'Book Demo', page: 'home' });
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track a custom event in GA4
 * @param eventName - Name of the event (e.g., 'button_click', 'video_play')
 * @param eventParams - Additional parameters for the event
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('[GA4 Event]', eventName, eventParams);
  } else {
    console.warn('[GA4] gtag not loaded, event not tracked:', eventName);
  }
}

/**
 * Track button clicks
 */
export function trackButtonClick(buttonName: string, additionalParams?: Record<string, any>) {
  trackEvent('button_click', {
    button_name: buttonName,
    ...additionalParams
  });
}

/**
 * Track video interactions
 */
export function trackVideoEvent(action: 'play' | 'pause' | 'complete', videoName: string) {
  trackEvent(`video_${action}`, {
    video_name: videoName
  });
}

/**
 * Track chat interactions
 */
export function trackChatEvent(action: 'open' | 'close' | 'message_sent', additionalParams?: Record<string, any>) {
  trackEvent(`chat_${action}`, {
    chat_bot: 'Leo',
    ...additionalParams
  });
}

/**
 * Track conversion events
 */
export function trackConversion(conversionType: 'demo_booking' | 'fiverr_click' | 'chat_started') {
  trackEvent('conversion', {
    conversion_type: conversionType
  });
}

/**
 * Track page views (called automatically by GA4, but can be used for SPAs)
 */
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
}
