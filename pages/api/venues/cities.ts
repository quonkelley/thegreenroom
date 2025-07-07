import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get all unique cities from venues table
    const { data: venues, error } = await supabase
      .from('venues')
      .select('city')
      .eq('status', 'active')
      .order('city');

    if (error) {
      console.error('Error fetching cities:', error);
      return res.status(500).json({ error: 'Failed to fetch cities' });
    }

    // Extract unique cities and sort them
    const cities = [
      ...new Set(venues?.map(venue => venue.city).filter(Boolean)),
    ].sort();

    res.status(200).json({
      cities,
      total: cities.length,
      message: 'Cities retrieved successfully',
    });
  } catch (error) {
    console.error('Cities API error:', error);
    res.status(500).json({ error: 'Failed to retrieve cities' });
  }
}
