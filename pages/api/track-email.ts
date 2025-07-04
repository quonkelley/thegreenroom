import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      event, 
      emailId, 
      artistId, 
      venueName, 
      venueEmail, 
      subject, 
      status, 
      responseType,
      metadata 
    } = req.body;

    // Validate required fields
    if (!event || !artistId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: event, artistId' 
      });
    }

    // Insert email event into database
    const { data, error } = await supabase
      .from('email_events')
      .insert({
        event,
        email_id: emailId,
        artist_id: artistId,
        venue_name: venueName,
        venue_email: venueEmail,
        subject,
        status: status || 'sent',
        response_type: responseType,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Email tracking error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to track email event' 
      });
    }

    // Update outreach_emails table if this is a new email
    if (event === 'email_sent' && emailId) {
      await supabase
        .from('outreach_emails')
        .upsert({
          id: emailId,
          artist_id: artistId,
          venue_name: venueName,
          venue_email: venueEmail,
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
    }

    // Update email status if this is a status change
    if (event === 'email_opened' || event === 'email_replied') {
      await supabase
        .from('outreach_emails')
        .update({
          status: event === 'email_opened' ? 'opened' : 'replied',
          response_type: responseType,
          updated_at: new Date().toISOString()
        })
        .eq('id', emailId);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Email event tracked successfully',
      eventId: data?.[0]?.id
    });

  } catch (error) {
    console.error('Email tracking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
} 