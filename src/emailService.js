// Email service for TheGreenRoom.ai landing page
// Using Mailchimp API for email collection

const MAILCHIMP_API_KEY = process.env.REACT_APP_MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.REACT_APP_MAILCHIMP_LIST_ID;
const MAILCHIMP_SERVER_PREFIX = process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX;

export const subscribeToWaitlist = async (email) => {
  try {
    // For now, we'll use a simple approach that works with Mailchimp's signup form
    // This will redirect to Mailchimp's hosted signup form
    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.list-manage.com/subscribe/post?u=${MAILCHIMP_LIST_ID}&id=${MAILCHIMP_LIST_ID}`;
    
    // Open Mailchimp signup form in new window/tab
    window.open(`${mailchimpUrl}&EMAIL=${encodeURIComponent(email)}`, '_blank');
    
    return { success: true, message: 'Redirecting to signup form...' };
  } catch (error) {
    console.error('Email subscription error:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
};

// Alternative: Direct API integration (requires backend)
export const subscribeDirectly = async (email) => {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
    console.warn('Mailchimp credentials not configured');
    return { success: false, message: 'Email service not configured yet.' };
  }

  try {
    const response = await fetch(`https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          SOURCE: 'Landing Page',
          SIGNUP_DATE: new Date().toISOString().split('T')[0]
        }
      })
    });

    if (response.ok) {
      return { success: true, message: 'Successfully subscribed to waitlist!' };
    } else {
      const errorData = await response.json();
      console.error('Mailchimp API error:', errorData);
      return { success: false, message: 'Failed to subscribe. Please try again.' };
    }
  } catch (error) {
    console.error('Email subscription error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Simple email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 