import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

// In-memory storage for basic analytics (replace with Supabase later)
let analytics: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { event, ...data } = req.body;
      
      analytics.push({
        event,
        ...data,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  } else if (req.method === 'GET') {
    try {
      const { user_id, timeframe = '30d' } = req.query;
      
      if (!user_id) {
        // Return basic waitlist stats for public analytics
        const totalSignups = analytics.filter(a => a.event === 'email_signup').length;
        const today = new Date().toDateString();
        const todaySignups = analytics.filter(a => 
          a.event === 'email_signup' && 
          new Date(a.timestamp).toDateString() === today
        ).length;

        res.json({
          totalSignups,
          todaySignups,
          conversionRate: totalSignups > 0 ? Math.round((todaySignups / totalSignups) * 100) : 0,
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

    // Calculate date range
    const now = new Date();
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Get outreach stats
    const { data: outreachStats } = await supabase
      .rpc('get_outreach_stats', { artist_uuid: profile.id });

    // Get pitch generation stats
    const { count: totalPitches } = await supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id);

    const { count: recentPitches } = await supabase
      .from('pitches')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .gte('created_at', startDate.toISOString());

    // Get campaign stats
    const { count: totalCampaigns } = await supabase
      .from('outreach_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id);

    const { count: activeCampaigns } = await supabase
      .from('outreach_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('status', 'active');

    // Get email performance over time
    const { data: emailTimeline } = await supabase
      .from('outreach_emails')
      .select('sent_at, status, response_type')
      .eq('artist_id', profile.id)
      .gte('sent_at', startDate.toISOString())
      .order('sent_at', { ascending: true });

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('outreach_emails')
      .select(`
        *,
        outreach_campaigns(name)
      `)
      .eq('artist_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate performance metrics
    const performanceMetrics = calculatePerformanceMetrics(emailTimeline || [], daysAgo);
    
    // Calculate goals progress
    const goalsProgress = calculateGoalsProgress({
      totalPitches: totalPitches || 0,
      totalEmails: outreachStats?.[0]?.total_emails || 0,
      responseRate: outreachStats?.[0]?.response_rate || 0,
      positiveResponses: outreachStats?.[0]?.positive_responses || 0
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
        recentPitches: recentPitches || 0,
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        totalEmails: outreachStats?.[0]?.total_emails || 0,
        sentEmails: outreachStats?.[0]?.sent_emails || 0,
        openedEmails: outreachStats?.[0]?.opened_emails || 0,
        repliedEmails: outreachStats?.[0]?.replied_emails || 0,
        responseRate: outreachStats?.[0]?.response_rate || 0,
        positiveResponses: outreachStats?.[0]?.positive_responses || 0,
        negativeResponses: outreachStats?.[0]?.negative_responses || 0
      },
      performance: performanceMetrics,
      goals: goalsProgress,
      recentActivity: recentActivity || [],
      timeframe
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
}

function calculatePerformanceMetrics(emailTimeline: any[], daysAgo: number) {
  const dailyStats = new Map();
  
  // Initialize daily stats
  for (let i = 0; i < daysAgo; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyStats.set(dateKey, {
      sent: 0,
      opened: 0,
      replied: 0,
      positive: 0,
      negative: 0
    });
  }

  // Aggregate email data by day
  emailTimeline.forEach(email => {
    if (email.sent_at) {
      const dateKey = email.sent_at.split('T')[0];
      const stats = dailyStats.get(dateKey);
      if (stats) {
        stats.sent++;
        if (email.status === 'opened' || email.status === 'replied') {
          stats.opened++;
        }
        if (email.status === 'replied') {
          stats.replied++;
        }
        if (email.response_type === 'positive') {
          stats.positive++;
        }
        if (email.response_type === 'negative') {
          stats.negative++;
        }
      }
    }
  });

  // Calculate trends
  const sortedDates = Array.from(dailyStats.keys()).sort();
  const sentTrend = sortedDates.map(date => dailyStats.get(date).sent);
  const openedTrend = sortedDates.map(date => dailyStats.get(date).opened);
  const repliedTrend = sortedDates.map(date => dailyStats.get(date).replied);

  return {
    dailyStats: Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      ...stats
    })),
    trends: {
      sent: sentTrend,
      opened: openedTrend,
      replied: repliedTrend
    },
    averages: {
      dailySent: sentTrend.reduce((a, b) => a + b, 0) / daysAgo,
      dailyOpened: openedTrend.reduce((a, b) => a + b, 0) / daysAgo,
      dailyReplied: repliedTrend.reduce((a, b) => a + b, 0) / daysAgo
    }
  };
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
      current: metrics.positiveResponses,
      goal: goals.monthlyBookings,
      progress: Math.min((metrics.positiveResponses / goals.monthlyBookings) * 100, 100),
      status: metrics.positiveResponses >= goals.monthlyBookings ? 'completed' : 'in_progress'
    }
  };
} 