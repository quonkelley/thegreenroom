import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { supabase } from '../../lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      name,
      genre,
      city,
      bio,
      pricing,
      availability,
      social_links,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed (in Supabase)
    const { data: existing, error: existingError } = await supabase
      .from('artist_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingError) {
      return res.status(500).json({ error: existingError.message });
    }
    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Insert new artist profile
    const { data: profile, error: insertError } = await supabase
      .from('artist_profiles')
      .insert([
        {
          email,
          name: name || '',
          genre: genre || '',
          city: city || '',
          bio: bio || '',
          pricing: pricing || '',
          availability: availability || '',
          social_links: social_links || {},
          profile_complete: false,
        },
      ])
      .select()
      .single();
    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Send welcome email
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
      // Don't fail the signup if email fails
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
}
