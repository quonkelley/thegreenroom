import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TestEmailVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleVerify = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Email verified successfully! User ID: ${data.user?.id}`,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to verify email',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred while verifying the email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Test Email Verification
          </h2>
          <p className='text-gray-600'>
            Manually verify email addresses in development
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='bg-white py-8 px-6 shadow-xl rounded-lg space-y-6'
        >
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Email Address
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter email to verify'
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || !email}
            className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          {result && (
            <div
              className={`p-4 rounded-md ${
                result.success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {result.message}
            </div>
          )}

          <div className='text-xs text-gray-500 text-center'>
            <p>This tool is only available in development mode.</p>
            <p>
              Use this to test email verification without waiting for emails.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
