import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { OutreachEmail } from '../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { artist_id, campaign_id, status } = req.query;
      
      if (!artist_id) {
        return res.status(400).json({ error: 'Artist ID is required' });
      }

      let query = supabase
        .from('outreach_emails')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });

      if (campaign_id) {
        query = query.eq('campaign_id', campaign_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: emails, error } = await query;

      if (error) {
        console.error('Emails fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch emails' });
      }

      res.status(200).json({ emails });
    } catch (error) {
      console.error('Emails API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        campaign_id, 
        artist_id, 
        venue_name, 
        venue_email, 
        venue_city, 
        venue_website, 
        subject, 
        body,
        send_email = false 
      } = req.body;

      if (!artist_id || !venue_name || !subject || !body) {
        return res.status(400).json({ 
          error: 'Artist ID, venue name, subject, and body are required' 
        });
      }

      // Create email record
      const emailData = {
        campaign_id,
        artist_id,
        venue_name,
        venue_email,
        venue_city,
        venue_website,
        subject,
        body,
        status: send_email ? 'sent' : 'draft',
        sent_at: send_email ? new Date().toISOString() : null
      };

      const { data: email, error } = await supabase
        .from('outreach_emails')
        .insert([emailData])
        .select()
        .single();

      if (error) {
        console.error('Email creation error:', error);
        return res.status(500).json({ error: 'Failed to create email' });
      }

      // Send email if requested
      if (send_email && venue_email) {
        try {
          await resend.emails.send({
            from: 'TheGreenRoom.ai <noreply@thegreenroom.ai>',
            to: [venue_email],
            subject,
            html: body.replace(/\n/g, '<br>'),
            replyTo: 'noreply@thegreenroom.ai'
          });
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Update status to indicate sending failed
          await supabase
            .from('outreach_emails')
            .update({ status: 'draft' })
            .eq('id', email.id);
          
          return res.status(500).json({ 
            error: 'Failed to send email, but draft was saved' 
          });
        }
      }

      res.status(201).json({ email });
    } catch (error) {
      console.error('Email creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { 
        id, 
        status, 
        response_content, 
        response_type, 
        notes,
        send_email = false 
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Email ID is required' });
      }

      const updateData: Partial<OutreachEmail> = {};
      if (status !== undefined) updateData.status = status;
      if (response_content !== undefined) updateData.response_content = response_content;
      if (response_type !== undefined) updateData.response_type = response_type;
      if (notes !== undefined) updateData.notes = notes;

      // If sending email, update sent_at timestamp
      if (send_email) {
        updateData.status = 'sent';
        updateData.sent_at = new Date().toISOString();
      }

      const { data: email, error } = await supabase
        .from('outreach_emails')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Email update error:', error);
        return res.status(500).json({ error: 'Failed to update email' });
      }

      // Send email if requested
      if (send_email && email.venue_email) {
        try {
          await resend.emails.send({
            from: 'TheGreenRoom.ai <noreply@thegreenroom.ai>',
            to: [email.venue_email],
            subject: email.subject,
            html: email.body.replace(/\n/g, '<br>'),
            replyTo: 'noreply@thegreenroom.ai'
          });
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          return res.status(500).json({ 
            error: 'Failed to send email, but record was updated' 
          });
        }
      }

      res.status(200).json({ email });
    } catch (error) {
      console.error('Email update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Email ID is required' });
      }

      const { error } = await supabase
        .from('outreach_emails')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Email deletion error:', error);
        return res.status(500).json({ error: 'Failed to delete email' });
      }

      res.status(200).json({ message: 'Email deleted successfully' });
    } catch (error) {
      console.error('Email deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 