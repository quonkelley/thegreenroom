import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Sample email events data
    const emailEvents = [
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'The Blue Note',
        venue_email: 'booking@bluenote.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'sent',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'The Blue Note',
        venue_email: 'booking@bluenote.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'opened',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'The Blue Note',
        venue_email: 'booking@bluenote.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'replied',
        response_type: 'positive',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'Smoke Jazz Club',
        venue_email: 'info@smokejazz.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'sent',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'Smoke Jazz Club',
        venue_email: 'info@smokejazz.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'opened',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'Birdland Jazz Club',
        venue_email: 'booking@birdland.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'sent',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        event: 'email_sent',
        artist_id: profile.id,
        venue_name: 'Birdland Jazz Club',
        venue_email: 'booking@birdland.com',
        subject: 'Jazz Performance Inquiry - The Green Room',
        status: 'replied',
        response_type: 'negative',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Sample venue discovery events
    const venueDiscoveryEvents = [
      {
        artist_id: profile.id,
        event_type: 'venue_search',
        venue_name: 'Jazz Clubs',
        venue_city: 'New York',
        search_terms: 'jazz clubs new york',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'venue_view',
        venue_name: 'The Blue Note',
        venue_city: 'New York',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'venue_view',
        venue_name: 'Smoke Jazz Club',
        venue_city: 'New York',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'venue_view',
        venue_name: 'Birdland Jazz Club',
        venue_city: 'New York',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'venue_search',
        venue_name: 'Music Venues',
        venue_city: 'Los Angeles',
        search_terms: 'music venues los angeles',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'venue_view',
        venue_name: 'The Troubadour',
        venue_city: 'Los Angeles',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        artist_id: profile.id,
        event_type: 'pitch_created',
        venue_name: 'The Blue Note',
        venue_city: 'New York',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Get a sample pitch to reference
    const { data: samplePitch } = await supabase
      .from('pitches')
      .select('id')
      .eq('artist_id', profile.id)
      .limit(1)
      .single();

    // Sample pitch metrics data
    const pitchMetrics = samplePitch ? [
      {
        pitch_id: samplePitch.id,
        artist_id: profile.id,
        venue_name: 'The Blue Note',
        venue_city: 'New York',
        venue_type: 'jazz_club',
        email_sent: true,
        email_opened: true,
        email_replied: true,
        response_type: 'positive',
        booking_result: 'booked',
        booking_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: 1500.00,
        notes: 'Confirmed booking for March 15th, 2024',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : [];

    // Insert sample data
    const { error: emailError } = await supabase
      .from('email_events')
      .insert(emailEvents);

    const { error: discoveryError } = await supabase
      .from('venue_discovery_events')
      .insert(venueDiscoveryEvents);

    let pitchMetricsError = null;
    if (pitchMetrics.length > 0) {
      const { error } = await supabase
        .from('pitch_metrics')
        .insert(pitchMetrics);
      pitchMetricsError = error;
    }

    if (emailError || discoveryError || pitchMetricsError) {
      console.error('Errors inserting sample data:', { emailError, discoveryError, pitchMetricsError });
      return res.status(500).json({ 
        error: 'Failed to insert sample data',
        details: { emailError, discoveryError, pitchMetricsError }
      });
    }

    res.json({ 
      success: true, 
      message: 'Sample analytics data created successfully',
      data: {
        emailEvents: emailEvents.length,
        venueDiscoveryEvents: venueDiscoveryEvents.length,
        pitchMetrics: pitchMetrics.length
      }
    });

  } catch (error) {
    console.error('Error creating sample analytics data:', error);
    res.status(500).json({ error: 'Failed to create sample data' });
  }
} 