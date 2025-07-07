import { motion } from 'framer-motion';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function EmailVerification() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Router info

        // Get the tokens from URL params - Supabase uses different parameter names
        const {
          access_token,
          refresh_token,
          token, // Supabase sometimes uses 'token'
          type, // Supabase uses 'type' to indicate the action
          error,
          error_description,
        } = router.query;

        if (error) {
          setStatus('error');
          setMessage(
            (Array.isArray(error_description)
              ? error_description[0]
              : error_description) ||
              'Email verification failed. Please try again.'
          );
          return;
        }

        // Check for the actual token (Supabase might use 'token' instead of 'access_token')
        const actualToken = access_token || token;

        if (!actualToken) {
          // No token found in URL params

          // Try to extract token from hash if it's not in query params
          if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            // URL hash

            if (hash) {
              const hashParams = new URLSearchParams(hash.substring(1));
              const hashAccessToken = hashParams.get('access_token');
              const hashRefreshToken = hashParams.get('refresh_token');

              if (hashAccessToken) {
                // Found access token in hash

                // Set the session with the access token
                const { data, error: sessionError } =
                  await supabase.auth.setSession({
                    access_token: hashAccessToken,
                    refresh_token: hashRefreshToken || '',
                  });

                if (data?.session) {
                  // Session set successfully with hash token
                  setStatus('success');
                  setMessage(
                    'Email verified successfully! Redirecting to your profile...'
                  );
                  setTimeout(() => {
                    router.push('/app/profile');
                  }, 2000);
                  return;
                } else {
                  // Failed to set session with hash token
                  setStatus('error');
                  setMessage('Verification failed. Please try again.');
                  return;
                }
              }
            }
          }

          setStatus('error');
          setMessage(
            'Invalid verification link. Please check your email and try again.'
          );
          return;
        }

        // Found token, attempting to set session

        // Set session with the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: actualToken as string,
          refresh_token: (refresh_token as string) || '',
        });

        if (sessionError) {
          // Session error
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          return;
        }

        if (data?.session) {
          // Verification successful
          setStatus('success');
          setMessage(
            'Email verified successfully! Redirecting to your profile...'
          );

          // Redirect to profile page after a short delay
          setTimeout(() => {
            router.push('/app/profile');
          }, 2000);
        } else {
          // No session created from verification
          setStatus('error');
          setMessage('Verification failed. Please try again.');
        }
      } catch (error) {
        // Verification error
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    if (router.isReady) {
      handleEmailVerification();
    }
  }, [router.isReady, router.query, router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Email Verification
          </h2>
          <p className='text-gray-600'>
            We&apos;re verifying your email address
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='bg-white py-8 px-6 shadow-xl rounded-lg text-center'
        >
          {status === 'loading' && (
            <div className='space-y-4'>
              <Loader className='w-12 h-12 text-blue-500 animate-spin mx-auto' />
              <p className='text-gray-700'>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className='space-y-4'>
              <CheckCircle className='w-12 h-12 text-green-500 mx-auto' />
              <p className='text-green-700 font-medium'>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className='space-y-4'>
              <XCircle className='w-12 h-12 text-red-500 mx-auto' />
              <p className='text-red-700'>{message}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors'
              >
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
