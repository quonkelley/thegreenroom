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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use the regular auth API to create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
      },
    });

    // Check if the error is due to duplicate email
    if (error) {
      // Signup error
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('already been registered') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email already registered') ||
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('unique constraint')
      ) {
        return res.status(400).json({
          error:
            'An account with this email already exists. Please try logging in instead.',
        });
      }
      return res.status(500).json({ error: error.message });
    }

    // If no user data returned, it means email confirmation is required
    if (!data.user) {
      return res.status(400).json({
        error: 'Signup requires email confirmation. Please check your email.',
      });
    }

    // User created successfully

    // Since email confirmation is disabled in your Supabase settings,
    // we need to manually confirm the email using the admin API
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      {
        email_confirm: true,
      }
    );

    if (confirmError) {
      // Error confirming email
      return res.status(500).json({ error: 'Failed to confirm email' });
    }

    // Email confirmed successfully

    res.status(200).json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      user: data.user,
    });
  } catch (error) {
    // Signup API error
    res.status(500).json({ error: 'Internal server error' });
  }
}
