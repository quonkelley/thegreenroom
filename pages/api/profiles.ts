import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers for mobile compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const { data: profile, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch profile',
        });
      }

      if (!profile) {
        return res.status(200).json({
          success: true,
          profile: null,
          message: 'No profile found for this user',
        });
      }

      res.status(200).json({
        success: true,
        profile: profile,
      });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Validate request body exists
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
        });
      }

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
        user_id,
      } = req.body;

      // Validate required fields
      if (!name || !genre || !city || !email) {
        return res.status(400).json({
          success: false,
          error:
            'Missing required fields: name, genre, city, and email are required',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
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
      const { data: existingProfile, error: checkError } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error('Profile check error:', checkError);
        return res.status(500).json({
          success: false,
          error: 'Failed to check existing profile',
        });
      }

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
        return res.status(500).json({
          success: false,
          error: 'Failed to save profile',
        });
      }

      // Ensure we always return a valid JSON response
      res.status(200).json({
        success: true,
        data: result.data,
        message: existingProfile
          ? 'Profile updated successfully'
          : 'Profile created successfully',
      });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  } else if (req.method === 'PUT') {
    try {
      // Validate request body exists
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body',
        });
      }

      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Profile ID is required',
        });
      }

      const { data: profile, error } = await supabase
        .from('artist_profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to update profile',
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Profile API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
