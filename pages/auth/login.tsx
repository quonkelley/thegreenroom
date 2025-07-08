import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { LoginForm, SignUpForm } from '../../components/AuthForms';
import { useAuth } from '../../lib/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (user) {
    router.push('/app/profile');
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='w-16 h-16 mx-auto mb-4 relative'>
              <Image
                src='/logo.svg'
                alt='TheGreenRoom.ai Logo'
                width={64}
                height={64}
                className='object-contain'
              />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-3xl font-bold text-gray-900'
          >
            Welcome to TheGreenRoom.ai
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='mt-2 text-sm text-gray-600'
          >
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='bg-white py-8 px-6 shadow-xl rounded-lg'
        >
          {isLogin ? <LoginForm /> : <SignUpForm />}

          <div className='mt-6 text-center'>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className='text-blue-600 hover:text-blue-500 text-sm font-medium'
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
