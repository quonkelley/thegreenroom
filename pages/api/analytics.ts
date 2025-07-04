import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { event, ...data } = req.body;
      
      // Track analytics event (can be expanded later)
      console.log('Analytics event:', { event, ...data });

      res.json({ success: true });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  } else if (req.method === 'GET') {
    try {
      const { user_id, timeframe = '30d' } = req.query;
      
      if (!user_id) {
        // Return basic waitlist stats for public analytics (landing page)
        res.json({
          totalSignups: 0,
          todaySignups: 0,
          conversionRate: 0,
          emailServiceAvailable: true
        });
        return;
      }

      // Get user-specific analytics
      const userAnalytics = await getUserAnalytics(user_id as string, timeframe as string);
      res.json(userAnalytics);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUserAnalytics(userId: string, timeframe: string) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { error: 'Profile not found' };
    }

    // Calculate days for analytics
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get data directly from views instead of using the problematic function
    const { data: emailPerformance } = await supabase
      .from('email_performance_summary')
      .select('*')
      .eq('artist_id', profile.id)
      .single();

    const { data: venueDiscovery } = await supabase
      .from('venue_discovery_summary')
      .select('*')
      .eq('artist_id', profile.id)
      .single();

    const { data: pitchSuccess } = await supabase
      .from('pitch_success_summary')
      .select('*')
      .eq('artist_id', profile.id)
      .single();

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('email_events')
      .select('*')
      .eq('artist_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get additional pitch and campaign stats
    const { count: totalPitches } = await supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id);

    const { count: totalCampaigns } = await supabase
      .from('outreach_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id);

    const { count: activeCampaigns } = await supabase
      .from('outreach_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('status', 'active');

    // Calculate goals progress
    const goalsProgress = calculateGoalsProgress({
      totalPitches: totalPitches || 0,
      totalEmails: emailPerformance?.total_emails || 0,
      responseRate: emailPerformance?.response_rate || 0,
      positiveResponses: emailPerformance?.positive_responses || 0,
      successfulBookings: pitchSuccess?.successful_bookings || 0
    });

    return {
      profile: {
        name: profile.name,
        genre: profile.genre,
        city: profile.city,
        memberSince: profile.created_at
      },
      overview: {
        totalPitches: totalPitches || 0,
        recentPitches: pitchSuccess?.total_pitches || 0,
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        totalEmails: emailPerformance?.total_emails || 0,
        sentEmails: emailPerformance?.emails_sent || 0,
        openedEmails: emailPerformance?.emails_opened || 0,
        repliedEmails: emailPerformance?.emails_replied || 0,
        responseRate: emailPerformance?.response_rate || 0,
        openRate: emailPerformance?.open_rate || 0,
        positiveResponses: emailPerformance?.positive_responses || 0,
        negativeResponses: emailPerformance?.negative_responses || 0,
        successfulBookings: pitchSuccess?.successful_bookings || 0,
        bookingConversionRate: pitchSuccess?.booking_conversion_rate || 0,
        totalRevenue: pitchSuccess?.total_revenue || 0,
        venuesViewed: venueDiscovery?.venues_viewed || 0,
        citiesExplored: venueDiscovery?.cities_explored || 0
      },
      performance: {
        dailyStats: [],
        trends: { sent: [], opened: [], replied: [] },
        averages: { dailySent: 0, dailyOpened: 0, dailyReplied: 0 }
      },
      goals: goalsProgress,
      recentActivity: recentActivity || [],
      venueDiscovery: venueDiscovery || {},
      pitchSuccess: pitchSuccess || {},
      timeframe
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
}

function calculateGoalsProgress(metrics: any) {
  // Default goals (can be made configurable later)
  const goals = {
    monthlyPitches: 20,
    monthlyEmails: 50,
    targetResponseRate: 15,
    monthlyBookings: 3
  };

  return {
    pitches: {
      current: metrics.totalPitches,
      goal: goals.monthlyPitches,
      progress: Math.min((metrics.totalPitches / goals.monthlyPitches) * 100, 100),
      status: metrics.totalPitches >= goals.monthlyPitches ? 'completed' : 'in_progress'
    },
    emails: {
      current: metrics.totalEmails,
      goal: goals.monthlyEmails,
      progress: Math.min((metrics.totalEmails / goals.monthlyEmails) * 100, 100),
      status: metrics.totalEmails >= goals.monthlyEmails ? 'completed' : 'in_progress'
    },
    responseRate: {
      current: metrics.responseRate,
      goal: goals.targetResponseRate,
      progress: Math.min((metrics.responseRate / goals.targetResponseRate) * 100, 100),
      status: metrics.responseRate >= goals.targetResponseRate ? 'completed' : 'in_progress'
    },
    bookings: {
      current: metrics.successfulBookings || metrics.positiveResponses,
      goal: goals.monthlyBookings,
      progress: Math.min(((metrics.successfulBookings || metrics.positiveResponses) / goals.monthlyBookings) * 100, 100),
      status: (metrics.successfulBookings || metrics.positiveResponses) >= goals.monthlyBookings ? 'completed' : 'in_progress'
    }
  };
}

function calculateTrends(dailyStats: any[]) {
  const sent = dailyStats.map(stat => stat.emails_sent || 0);
  const opened = dailyStats.map(stat => stat.emails_opened || 0);
  const replied = dailyStats.map(stat => stat.emails_replied || 0);
  
  return { sent, opened, replied };
}

function calculateAverages(dailyStats: any[]) {
  if (dailyStats.length === 0) {
    return { dailySent: 0, dailyOpened: 0, dailyReplied: 0 };
  }
  
  const totalSent = dailyStats.reduce((sum, stat) => sum + (stat.emails_sent || 0), 0);
  const totalOpened = dailyStats.reduce((sum, stat) => sum + (stat.emails_opened || 0), 0);
  const totalReplied = dailyStats.reduce((sum, stat) => sum + (stat.emails_replied || 0), 0);
  
  return {
    dailySent: totalSent / dailyStats.length,
    dailyOpened: totalOpened / dailyStats.length,
    dailyReplied: totalReplied / dailyStats.length
  };
} 