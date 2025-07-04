import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OutreachStats } from '../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { artist_id } = req.query;
      
      if (!artist_id) {
        return res.status(400).json({ error: 'Artist ID is required' });
      }

      // Get outreach stats using the database function
      const { data: stats, error } = await supabase
        .rpc('get_outreach_stats', { artist_uuid: artist_id });

      if (error) {
        console.error('Stats fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }

      // Get recent activity (last 10 emails)
      const { data: recentEmails, error: recentError } = await supabase
        .from('outreach_emails')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('Recent emails fetch error:', recentError);
        return res.status(500).json({ error: 'Failed to fetch recent emails' });
      }

      // Get campaign stats
      const { data: campaigns, error: campaignsError } = await supabase
        .from('outreach_campaigns')
        .select('*')
        .eq('artist_id', artist_id)
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Campaigns fetch error:', campaignsError);
        return res.status(500).json({ error: 'Failed to fetch campaigns' });
      }

      // Get pending follow-ups
      const { data: followups, error: followupsError } = await supabase
        .from('outreach_followups')
        .select('*')
        .eq('artist_id', artist_id)
        .is('completed_at', null)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(5);

      if (followupsError) {
        console.error('Followups fetch error:', followupsError);
        return res.status(500).json({ error: 'Failed to fetch followups' });
      }

      // Calculate additional metrics
      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
      const pendingFollowups = followups?.length || 0;

      // Get status breakdown
      const statusBreakdown = {
        draft: recentEmails?.filter(e => e.status === 'draft').length || 0,
        sent: recentEmails?.filter(e => e.status === 'sent').length || 0,
        opened: recentEmails?.filter(e => e.status === 'opened').length || 0,
        replied: recentEmails?.filter(e => e.status === 'replied').length || 0,
        bounced: recentEmails?.filter(e => e.status === 'bounced').length || 0
      };

      // Get response type breakdown
      const responseBreakdown = {
        positive: recentEmails?.filter(e => e.response_type === 'positive').length || 0,
        negative: recentEmails?.filter(e => e.response_type === 'negative').length || 0,
        neutral: recentEmails?.filter(e => e.response_type === 'neutral').length || 0,
        no_response: recentEmails?.filter(e => e.response_type === 'no_response').length || 0
      };

      const analytics = {
        stats: stats?.[0] || {
          total_emails: 0,
          sent_emails: 0,
          opened_emails: 0,
          replied_emails: 0,
          response_rate: 0,
          positive_responses: 0,
          negative_responses: 0
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns
        },
        followups: {
          pending: pendingFollowups
        },
        statusBreakdown,
        responseBreakdown,
        recentEmails: recentEmails || [],
        upcomingFollowups: followups || []
      };

      res.status(200).json(analytics);
    } catch (error) {
      console.error('Analytics API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 