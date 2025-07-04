import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ArtistProfile } from '../../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { data: profile, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        name, 
        genre, 
        city, 
        state, 
        country, 
        website, 
        pricing, 
        availability, 
        bio, 
        email, 
        phone, 
        press_kit_url, 
        social_links,
        user_id 
      } = req.body;

      // Validate required fields
      if (!name || !genre || !city || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, genre, city, and email are required' 
        });
      }

      const profileData = {
        name: name.trim(),
        genre: genre.trim(),
        city: city.trim(),
        state: state?.trim() || null,
        country: country || 'USA',
        website: website?.trim() || null,
        pricing: pricing?.trim() || null,
        availability: availability?.trim() || null,
        bio: bio?.trim() || null,
        email: email.trim(),
        phone: phone?.trim() || null,
        press_kit_url: press_kit_url?.trim() || null,
        social_links: social_links || {},
        profile_complete: true,
        user_id: user_id || null,
      };

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('artist_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
          .select()
          .single();
      } else {
        // Insert new profile
        result = await supabase
          .from('artist_profiles')
          .insert([profileData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Profile save error:', result.error);
        return res.status(500).json({ error: 'Failed to save profile' });
      }

      res.status(200).json({ 
        success: true, 
        data: result.data,
        message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
      });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Profile ID is required' });
      }

      const { data: profile, error } = await supabase
        .from('artist_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.status(200).json({ 
        success: true, 
        data: profile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 