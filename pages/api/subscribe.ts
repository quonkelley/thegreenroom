import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory storage (replace with Supabase later)
let subscribers: any[] = [];
let analytics: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, source, timestamp } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    if (subscribers.find(sub => sub.email === email)) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Send email with error handling
    let emailResult;
    try {
      emailResult = await resend.emails.send({
        from: 'TheGreenRoom.ai <onboarding@resend.dev>',
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
    } catch (emailError: unknown) {
      console.error('Email sending failed:', emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      emailResult = { error: errorMessage };
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
} 