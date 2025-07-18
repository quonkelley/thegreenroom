// Email validation function
export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get the correct API base URL for development vs production
const getApiBaseUrl = () => {
  // Use relative URLs that work in both development and production
  // In development: /api -> proxy to localhost:3001
  // In production: /api -> Vercel serverless function
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Subscribe to waitlist using Resend
export const subscribeToWaitlist = async email => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Send welcome email using Resend
    const response = await fetch(`${API_BASE_URL}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        source: 'landing-page',
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Track successful signup
      trackEmailSignup(email);
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error || 'Failed to subscribe' };
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }
};

// Analytics tracking
export const trackEmailSignup = email => {
  // Send analytics event
  fetch(`${API_BASE_URL}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'email_signup',
      email,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      page: window.location.pathname,
    }),
  }).catch(console.error);
};

// Track page views
export const trackPageView = page => {
  fetch(`${API_BASE_URL}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'page_view',
      page,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    }),
  }).catch(console.error);
};

// Track button clicks
export const trackButtonClick = buttonName => {
  fetch(`${API_BASE_URL}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'button_click',
      button: buttonName,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    }),
  }).catch(console.error);
};

// Test connection function
export const testEmailConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-connection`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
};
