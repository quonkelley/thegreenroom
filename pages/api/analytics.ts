import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage (replace with Supabase later)
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
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 