import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      return res.json({
        success: false,
        error: 'Resend not configured',
        message:
          'Please configure your Resend API key in the environment variables',
      });
    }

    // Test Resend connection with a valid test email
    const { data, error } = await resend.emails.send({
      from: 'TheGreenRoom.ai <onboarding@resend.dev>',
      to: ['test@resend.dev'],
      subject: 'Test Email',
      html: '<p>This is a test email to verify the connection.</p>',
    });

    if (error) {
      return res.json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Connection successful!' });
  } catch (error) {
    console.error('Connection test failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.json({ success: false, error: errorMessage });
  }
}
