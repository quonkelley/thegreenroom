import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      event_type, 
      venue_id, 
      venue_name, 
      venue_city, 
      search_terms, 
      filters, 
      metadata 
    } = req.body;

    // Get user from session (you'll need to implement proper auth)
    // For now, we'll use a placeholder artist_id
    const artistId = req.headers['x-artist-id'] || 'unknown';

    // Validate required fields
    if (!event_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: event_type' 
      });
    }

    // Insert venue discovery event into database
    const { data, error } = await supabase
      .from('venue_discovery_events')
      .insert({
        artist_id: artistId,
        event_type,
        venue_id,
        venue_name,
        venue_city,
        search_terms,
        filters: filters || {},
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Venue discovery tracking error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to track venue discovery event' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Venue discovery event tracked successfully',
      eventId: data?.[0]?.id
    });

  } catch (error) {
    console.error('Venue discovery tracking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
} 