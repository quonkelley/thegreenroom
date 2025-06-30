const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;

// Initialize Resend with error handling
let resend;
let resendAvailable = false;

try {
  const apiKey = process.env.RESEND_API_KEY || process.env.REACT_APP_RESEND_API_KEY;
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.log('⚠️  Resend API key not configured. Email functionality will be disabled.');
    resend = null;
    resendAvailable = false;
  } else {
    resend = new Resend(apiKey);
    resendAvailable = true;
    console.log('✅ Resend initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Resend:', error.message);
  resend = null;
  resendAvailable = false;
}

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for analytics (in production, use a database)
const analytics = [];
const subscribers = [];

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, source, timestamp } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already subscribed
    if (subscribers.find(sub => sub.email === email)) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Send welcome email using Resend (if available)
    if (!resendAvailable || !resend) {
      console.log('📧 Email service not available - storing subscriber only');
      
      // Store subscriber without sending email
      subscribers.push({
        email,
        source,
        timestamp,
        id: 'no-email-sent'
      });

      // Track analytics
      analytics.push({
        event: 'email_signup',
        email,
        timestamp,
        source,
        emailSent: false
      });

      console.log('Successfully subscribed (no email sent):', email);
      res.json({ 
        success: true, 
        message: 'Subscribed successfully! (Email service not configured)',
        emailSent: false
      });
      return;
    }

    // Send email with error handling
    let emailResult;
    try {
      emailResult = await resend.emails.send({
        from: 'TheGreenRoom.ai <hello@thegreenroom.ai>',
        to: [email],
        subject: 'Welcome to TheGreenRoom.ai! 🎵',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #22c55e, #8b5cf6); padding: 30px; border-radius: 10px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to TheGreenRoom.ai!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your AI-powered booking assistant</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Thanks for joining our waitlist! 🎉</h2>
              
              <p style="color: #666; line-height: 1.6;">
                We're excited to have you on board! You'll be among the first to know when we launch 
                TheGreenRoom.ai - the AI-powered booking platform that's going to revolutionize how 
                independent artists and venues connect.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">What's next?</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>We'll notify you as soon as we launch</li>
                  <li>You'll get early access to all features</li>
                  <li>Exclusive early adopter benefits</li>
                  <li>Priority support when you need it</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                In the meantime, follow us on social media for updates and behind-the-scenes content!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://twitter.com/thegreenroomai" style="display: inline-block; background: #1da1f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">Twitter</a>
                <a href="https://instagram.com/thegreenroomai" style="display: inline-block; background: #e4405f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">Instagram</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2024 TheGreenRoom.ai. All rights reserved.</p>
              <p>You received this email because you signed up for our waitlist.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with subscription even if email fails
      emailResult = { error: emailError.message };
    }

    // Store subscriber
    const subscriberData = {
      email,
      source,
      timestamp,
      id: emailResult.error ? 'email-failed' : emailResult.data?.id || 'unknown'
    };
    subscribers.push(subscriberData);

    // Track analytics
    analytics.push({
      event: 'email_signup',
      email,
      timestamp,
      source,
      emailSent: !emailResult.error
    });

    if (emailResult.error) {
      console.log('Subscribed but email failed:', email, emailResult.error);
      res.json({ 
        success: true, 
        message: 'Subscribed successfully! (Welcome email will be sent later)',
        emailSent: false,
        warning: 'Email service temporarily unavailable'
      });
    } else {
      console.log('Successfully subscribed with email:', email);
      res.json({ 
        success: true, 
        message: 'Welcome email sent successfully!',
        emailSent: true
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
  try {
    const { event, ...data } = req.body;
    
    analytics.push({
      event,
      ...data,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// Get analytics stats
app.get('/api/analytics/stats', (req, res) => {
  try {
    const totalSignups = subscribers.length;
    const today = new Date().toDateString();
    const todaySignups = subscribers.filter(sub => 
      new Date(sub.timestamp).toDateString() === today
    ).length;

    res.json({
      totalSignups,
      todaySignups,
      conversionRate: totalSignups > 0 ? Math.round((todaySignups / totalSignups) * 100) : 0,
      emailServiceAvailable: resendAvailable
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    if (!resendAvailable || !resend) {
      return res.json({ 
        success: false, 
        error: 'Resend not configured',
        message: 'Please configure your Resend API key in the .env file'
      });
    }

    // Test Resend connection
    const { data, error } = await resend.emails.send({
      from: 'TheGreenRoom.ai <hello@thegreenroom.ai>',
      to: ['test@example.com'],
      subject: 'Test Email',
      html: '<p>This is a test email to verify the connection.</p>',
    });

    if (error) {
      return res.json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Connection successful!' });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.json({ success: false, error: error.message });
  }
});

// Get subscribers (for admin purposes)
app.get('/api/subscribers', (req, res) => {
  res.json(subscribers);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    emailService: resendAvailable ? 'available' : 'not configured',
    subscribers: subscribers.length,
    analytics: analytics.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${resendAvailable ? 'Ready with Resend' : 'Not configured'}`);
  console.log(`📊 Analytics tracking enabled`);
  console.log(`💾 In-memory storage active`);
});

// Export for Vercel serverless deployment
module.exports = app; 