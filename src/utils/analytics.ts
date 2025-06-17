
// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Create script tag for gtag
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user interactions
export const trackUserAction = (action: string, details?: any) => {
  trackEvent(action, 'user_interaction', JSON.stringify(details));
};
