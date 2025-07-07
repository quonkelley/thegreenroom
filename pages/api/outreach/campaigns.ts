import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OutreachCampaign } from '../../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const { data: campaigns, error } = await supabase
        .from('outreach_campaigns')
        .select('*')
        .eq('artist_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Campaign fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch campaigns' });
      }

      res.status(200).json({ campaigns });
    } catch (error) {
      console.error('Campaigns API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, artist_id } = req.body;

      if (!name || !artist_id) {
        return res
          .status(400)
          .json({ error: 'Name and artist_id are required' });
      }

      const { data: campaign, error } = await supabase
        .from('outreach_campaigns')
        .insert([
          {
            name,
            description,
            artist_id,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Campaign creation error:', error);
        return res.status(500).json({ error: 'Failed to create campaign' });
      }

      res.status(201).json({ campaign });
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, description, status } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Campaign ID is required' });
      }

      const updateData: Partial<OutreachCampaign> = {};
      if (name !== undefined) {
        updateData.name = name;
      }
      if (description !== undefined) {
        updateData.description = description;
      }
      if (status !== undefined) {
        updateData.status = status;
      }

      const { data: campaign, error } = await supabase
        .from('outreach_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Campaign update error:', error);
        return res.status(500).json({ error: 'Failed to update campaign' });
      }

      res.status(200).json({ campaign });
    } catch (error) {
      console.error('Campaign update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Campaign ID is required' });
      }

      const { error } = await supabase
        .from('outreach_campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Campaign deletion error:', error);
        return res.status(500).json({ error: 'Failed to delete campaign' });
      }

      res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Campaign deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
