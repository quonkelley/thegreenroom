import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToWaitlist, validateEmail } from '../lib/emailService';
import { EmailSignupResult, EmailSignupProps } from '../types';

const EmailSignup: React.FC<EmailSignupProps> = ({ 
  className = '', 
  onSuccess, 
  onError 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
      onError?.('Invalid email format');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await subscribeToWaitlist(email);
      
      if (result.success) {
        setSubmitStatus('success');
        setEmail('');
        setTimeout(() => setSubmitStatus(null), 5000);
        onSuccess?.(result);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(null), 3000);
        onError?.(result.error || 'Subscription failed');
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
      onError?.(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (submitStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-primary-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'success':
        return 'Successfully subscribed! Check your email.';
      case 'error':
        return 'Something went wrong. Please try again.';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`w-full max-w-md mx-auto ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 focus-within:border-primary-400 transition-all duration-300">
            <Mail className="w-5 h-5 text-white/60 mr-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              disabled={isSubmitting}
              required
            />
            <motion.button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="ml-3 px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-purple text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Join Waitlist'
              )}
            </motion.button>
          </div>
          
          {/* Status Message */}
          {submitStatus && (
            <motion.div
              className="mt-3 flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {getStatusIcon()}
              <span className={submitStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
                {getStatusMessage()}
              </span>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default EmailSignup; 