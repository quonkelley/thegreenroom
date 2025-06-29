// Email validation function
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Subscribe to waitlist using Mailchimp's hosted form
export const subscribeToWaitlist = async (email) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check if Mailchimp is loaded
    if (typeof window !== 'undefined' && window.mc) {
      // Use Mailchimp's hosted form submission
      const result = await window.mc.subscribe({
        email: email,
        // You can add additional fields here if needed
        // firstName: firstName,
        // lastName: lastName,
      });
      
      return { success: true, data: result };
    } else {
      // Fallback: redirect to Mailchimp's hosted form
      const mailchimpUrl = 'https://thegreenroom.us6.list-manage.com/subscribe/post?u=5b4cae7f234fe3a2488a9050e&id=003255698606a22b5bb5ed509';
      const formData = new FormData();
      formData.append('EMAIL', email);
      
      const response = await fetch(mailchimpUrl, {
        method: 'POST',
        body: formData,
      });
      
      return { success: true, data: response };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 