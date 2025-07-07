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

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Only available in development' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // List all users and find the one with matching email
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      return res.status(500).json({ error: 'Failed to list users' });
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user to confirm their email
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: data.user,
    });
  } catch (error) {
    console.error('Test verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
