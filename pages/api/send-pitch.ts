import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

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
      to, 
      subject, 
      content, 
      venueName, 
      artistName, 
      artistEmail,
      venueEmail,
      scheduledFor 
    } = req.body;

    // Validate required fields
    if (!to || !subject || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, content' 
      });
    }

    // Create email HTML with professional styling
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4ADE80, #8B5CF6);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #4ADE80, #8B5CF6);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .venue-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4ADE80;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">TheGreenRoom.ai</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-Powered Booking Platform</p>
          </div>
          
          <div class="content">
            ${content}
            
            <div class="venue-info">
              <strong>Sent via TheGreenRoom.ai</strong><br>
              ${artistName ? `From: ${artistName}` : ''}<br>
              ${artistEmail ? `Contact: ${artistEmail}` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent via TheGreenRoom.ai - AI-powered booking for independent artists and venues.</p>
            <p>To respond, please reply directly to this email.</p>
          </div>
        </body>
      </html>
    `;

    // Prepare email data
    const emailData: any = {
      from: 'TheGreenRoom.ai <noreply@thegreenroom.ai>',
      to: [to],
      subject: subject,
      html: emailHtml,
      reply_to: artistEmail || 'noreply@thegreenroom.ai'
    };

    // Add scheduling if specified
    if (scheduledFor) {
      emailData.scheduled_for = new Date(scheduledFor).toISOString();
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Email send error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      });
    }

    // Track email event for analytics
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/track-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'email_sent',
          emailId: data?.id,
          artistId: req.body.artistId || 'unknown',
          venueName,
          venueEmail: to,
          subject,
          status: 'sent',
          metadata: {
            messageId: data?.id,
            artistName,
            artistEmail
          }
        })
      });
    } catch (trackingError) {
      console.error('Failed to track email event:', trackingError);
    }

    // Email sent successfully

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: data?.id
    });

  } catch (error) {
    console.error('Send pitch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
} 