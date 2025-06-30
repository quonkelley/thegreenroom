// Simple analytics for tracking
export const trackEvent = (eventName, data = {}) => {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      user_agent: navigator.userAgent
    }),
  }).catch(console.error);
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Track page views
export const trackPageView = (page) => {
  trackEvent('page_view', { page });
};

// Track email signups
export const trackEmailSignup = (email) => {
  trackEvent('email_signup', { email });
};

// Track button clicks
export const trackButtonClick = (buttonName) => {
  trackEvent('button_click', { button: buttonName });
}; 