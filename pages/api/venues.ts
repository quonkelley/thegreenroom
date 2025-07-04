import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { 
      search, 
      city, 
      genres, 
      venue_type, 
      min_capacity, 
      max_capacity,
      limit = '50',
      offset = '0'
    } = req.query;

    let query = supabase
      .from('venues')
      .select('*')
      .eq('status', 'active');

    // Text search across name, city, and notes
    if (search) {
      const searchTerm = search as string;
      query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
    }

    // City filter
    if (city) {
      query = query.eq('city', city);
    }

    // Genre filter
    if (genres) {
      const genreArray = (genres as string).split(',');
      query = query.overlaps('genres', genreArray);
    }

    // Venue type filter (based on genres and capacity)
    if (venue_type && venue_type !== 'all') {
      switch (venue_type) {
        case 'jazz':
          query = query.overlaps('genres', ['jazz', 'blues']);
          break;
        case 'rock':
          query = query.overlaps('genres', ['rock', 'indie', 'alternative']);
          break;
        case 'coffee':
          query = query.lt('capacity', 100);
          break;
        case 'restaurant':
          query = query.gte('capacity', 100);
          break;
      }
    }

    // Capacity range filter
    if (min_capacity) {
      query = query.gte('capacity', parseInt(min_capacity as string));
    }
    if (max_capacity) {
      query = query.lte('capacity', parseInt(max_capacity as string));
    }

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    // Order by name
    query = query.order('name');

    const { data: venues, error } = await query;

    if (error) {
      console.error('Error fetching venues:', error);
      return res.status(500).json({ error: 'Failed to fetch venues' });
    }

    // Add venue type classification
    const venuesWithType = venues?.map(venue => ({
      ...venue,
      venue_type: classifyVenueType(venue)
    })) || [];

    res.status(200).json({ 
      venues: venuesWithType,
      total: venuesWithType.length,
      message: 'Venues retrieved successfully'
    });

  } catch (error) {
    console.error('Venues API error:', error);
    res.status(500).json({ error: 'Failed to retrieve venues' });
  }
}

function classifyVenueType(venue: any): string {
  const genres = venue.genres || [];
  const capacity = venue.capacity || 0;

  if (genres.some((g: string) => ['jazz', 'blues'].includes(g))) {
    return 'jazz-club';
  }
  if (genres.some((g: string) => ['rock', 'indie', 'alternative'].includes(g))) {
    return 'rock-venue';
  }
  if (capacity < 100) {
    return 'coffee-shop';
  }
  return 'restaurant';
} 