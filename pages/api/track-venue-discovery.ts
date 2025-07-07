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
      event_type,
      venue_id,
      venue_name,
      venue_city,
      search_terms,
      filters,
      metadata,
    } = req.body;

    // Get user from session or headers
    const artistId = req.headers['x-artist-id'] || req.body.artist_id;

    // Validate required fields
    if (!event_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: event_type',
      });
    }

    // Only track if we have a valid artist_id (UUID)
    if (
      !artistId ||
      artistId === 'unknown' ||
      typeof artistId !== 'string' ||
      artistId.length !== 36
    ) {
      // Skip tracking for anonymous users or invalid IDs
      return res.status(200).json({
        success: true,
        message: 'Event skipped - no valid user ID',
        skipped: true,
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
        created_at: new Date().toISOString(),
      })
      .select(); // Ensure we get the inserted row(s)

    if (error) {
      console.error('Venue discovery tracking error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to track venue discovery event',
      });
    }

    // Type assertion to any[] to avoid TS error
    const inserted = data as any[];

    res.status(200).json({
      success: true,
      message: 'Venue discovery event tracked successfully',
      eventId: inserted?.[0]?.id,
    });
  } catch (error) {
    console.error('Venue discovery tracking error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
