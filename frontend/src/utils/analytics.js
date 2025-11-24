import Cookies from 'js-cookie';

/**
 * Analytics utility functions
 */

/**
 * Check if analytics cookies are enabled
 */
export const isAnalyticsEnabled = () => {
  return Cookies.get('cookie-analytics') === 'true';
};

/**
 * Track page view
 */
export const trackPageView = (path) => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  // Placeholder for analytics tracking
  // Replace with your analytics service (Google Analytics, etc.)
  console.log('Page view:', path);
  
  // Example: Google Analytics
  // if (window.gtag) {
  //   window.gtag('config', 'GA_MEASUREMENT_ID', {
  //     page_path: path,
  //   });
  // }
};

/**
 * Track event
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (!isAnalyticsEnabled()) {
    return;
  }

  // Placeholder for event tracking
  console.log('Event:', eventName, eventData);
  
  // Example: Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', eventName, eventData);
  // }
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName, location) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

/**
 * Track form submission
 */
export const trackFormSubmission = (formName, success = true) => {
  trackEvent('form_submission', {
    form_name: formName,
    success: success,
  });
};

/**
 * Track external link click
 */
export const trackExternalLink = (url) => {
  trackEvent('external_link_click', {
    url: url,
  });
};


