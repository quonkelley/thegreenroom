# Email Integration Setup Guide

## 🚀 Quick Setup (Recommended)

### Option 1: Mailchimp Signup Form (Easiest)
1. **Create a Mailchimp account** at [mailchimp.com](https://mailchimp.com) (free tier)
2. **Create a new audience/list** for "TheGreenRoom.ai Waitlist"
3. **Get your signup form URL**:
   - Go to Audience > Signup forms > Embedded forms
   - Copy the form URL
4. **Update the email service** with your form URL

### Option 2: Direct API Integration (Advanced)
1. **Get your Mailchimp API key**:
   - Account > Extras > API Keys
   - Create a new API key
2. **Get your List ID**:
   - Audience > Settings > Audience name and defaults
   - Copy the Audience ID
3. **Get your Server Prefix**:
   - Found in your API key URL (e.g., "us1" in https://us1.api.mailchimp.com)
4. **Create a .env file** in your project root:
   ```
   REACT_APP_MAILCHIMP_API_KEY=your_api_key_here
   REACT_APP_MAILCHIMP_LIST_ID=your_list_id_here
   REACT_APP_MAILCHIMP_SERVER_PREFIX=us1
   ```

## 📧 Alternative Email Services

### ConvertKit (Creator-focused)
- Free tier: 1,000 subscribers
- Great for creators and musicians
- Simple setup

### EmailJS (Direct email)
- Free tier: 200 emails/month
- No service signup needed
- Direct email sending

## 🧪 Testing Your Integration

1. **Test the form** with a real email address
2. **Check your email service** to confirm signups
3. **Verify welcome emails** are being sent
4. **Test error handling** with invalid emails

## 🔧 Current Implementation

The landing page now includes:
- ✅ **Email validation** - Checks for valid email format
- ✅ **Loading states** - Shows "Joining..." while processing
- ✅ **Success messages** - Confirms successful signup
- ✅ **Error handling** - Shows helpful error messages
- ✅ **Form protection** - Prevents double submissions

## 🎯 Next Steps

1. **Choose your email service** (Mailchimp recommended)
2. **Set up your account** and get credentials
3. **Test the integration** with real emails
4. **Customize welcome emails** for your brand
5. **Set up email sequences** for your waitlist

## 💡 Pro Tips

- **Start with Mailchimp's free tier** - 500 contacts, 2,500 emails/month
- **Create a welcome email sequence** to engage new signups
- **Track your signup rate** to optimize the landing page
- **Set up email automation** for when you launch

Your email integration is ready to go! Just choose your service and add your credentials. 🎸 