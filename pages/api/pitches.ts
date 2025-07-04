import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Create or update a pitch
    try {
      const { artist_id, subject, body, venue_type, venue_name, venue_city } = req.body;

      if (!artist_id || !subject || !body) {
        return res.status(400).json({ error: 'artist_id, subject, and body are required' });
      }

      // Check if pitch already exists for this artist
      const { data: existing, error: existingError } = await supabase
        .from('pitches')
        .select('id')
        .eq('artist_id', artist_id)
        .maybeSingle();

      if (existingError) {
        return res.status(500).json({ error: existingError.message });
      }

      let result;
      if (existing) {
        // Update existing pitch
        const { data, error } = await supabase
          .from('pitches')
          .update({ 
            subject, 
            body, 
            venue_type,
            venue_name,
            venue_city,
            updated_at: new Date().toISOString() 
          })
          .eq('artist_id', artist_id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new pitch
        const { data, error } = await supabase
          .from('pitches')
          .insert([{ 
            artist_id, 
            subject, 
            body,
            venue_type,
            venue_name,
            venue_city
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      res.status(200).json({ success: true, pitch: result });
    } catch (error: any) {
      console.error('Pitch save error:', error);
      res.status(500).json({ error: error.message || 'Failed to save pitch' });
    }
  } else if (req.method === 'GET') {
    // Get pitch for an artist
    try {
      const { artist_id } = req.query;

      if (!artist_id) {
        return res.status(400).json({ error: 'artist_id is required' });
      }

      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('artist_id', artist_id)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ pitch: data });
    } catch (error: any) {
      console.error('Pitch fetch error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch pitch' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 