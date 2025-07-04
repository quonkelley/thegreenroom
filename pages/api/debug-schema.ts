import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try to get a sample row from artist_profiles to see if it exists and what columns it has
    const { data: sample, error: sampleError } = await supabase
      .from('artist_profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('Error fetching from artist_profiles:', sampleError);
      
      // If the table doesn't exist, let's try to create it
      if (sampleError.code === '42P01') {
        return res.status(200).json({
          error: 'Table does not exist',
          message: 'artist_profiles table does not exist. You need to create it first.',
          suggestion: 'Run the artist-profiles-schema.sql script in your Supabase SQL editor'
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to access artist_profiles table', 
        details: sampleError 
      });
    }

    // If we get here, the table exists and we can see its structure
    const columnNames = sample && sample.length > 0 ? Object.keys(sample[0]) : [];

    res.status(200).json({
      success: true,
      tableExists: true,
      columnNames: columnNames,
      sampleData: sample,
      message: 'artist_profiles table exists and is accessible'
    });

  } catch (error) {
    console.error('Debug schema error:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
} 