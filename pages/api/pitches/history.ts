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
    const { artist_id } = req.query;

    if (!artist_id) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    // Get pitch history with outreach data
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select(`
        *,
        outreach_emails (
          id,
          status,
          sent_at,
          opened_at,
          replied_at,
          response_type
        )
      `)
      .eq('artist_id', artist_id)
      .order('created_at', { ascending: false });

    if (pitchesError) {
      console.error('Error fetching pitch history:', pitchesError);
      return res.status(500).json({ error: 'Failed to fetch pitch history' });
    }

    // Calculate success metrics for each pitch
    const pitchesWithMetrics = pitches?.map(pitch => {
      const outreachEmails = pitch.outreach_emails || [];
      const totalSent = outreachEmails.filter((email: any) => email.status === 'sent' || email.status === 'delivered' || email.status === 'opened' || email.status === 'replied').length;
      const totalReplied = outreachEmails.filter((email: any) => email.response_type === 'positive' || email.response_type === 'neutral').length;
      const successRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

      return {
        ...pitch,
        success_rate: successRate,
        response_count: totalReplied,
        total_sent: totalSent,
        outreach_emails: undefined // Remove the nested data
      };
    }) || [];

    res.status(200).json({ 
      pitches: pitchesWithMetrics,
      message: 'Pitch history retrieved successfully'
    });

  } catch (error) {
    console.error('Pitch history error:', error);
    res.status(500).json({ error: 'Failed to retrieve pitch history' });
  }
} 