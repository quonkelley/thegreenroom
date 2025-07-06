import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  completed: boolean;
  priority: number; // Higher number = higher priority
  icon: string;
  color: string;
}

export default function OnboardingModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'sample-data',
      title: 'See It In Action',
      description: 'We\'ll create sample pitches and campaigns so you can see exactly how TheGreenRoom.ai works.',
      action: 'Create Sample Data',
      completed: false,
      priority: 1,
      icon: '🎯',
      color: 'bg-purple-500'
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, social links, and pricing to help venues understand your style.',
      action: 'Complete Profile',
      actionUrl: '/app/profile',
      completed: false,
      priority: 2,
      icon: '👤',
      color: 'bg-blue-500'
    },
    {
      id: 'pitch',
      title: 'Generate Your First Pitch',
      description: 'Use AI to create a personalized booking pitch for venues.',
      action: 'Create Pitch',
      actionUrl: '/app/pitch',
      completed: false,
      priority: 3,
      icon: '🤖',
      color: 'bg-green-500'
    },
    {
      id: 'outreach',
      title: 'Track Your Outreach',
      description: 'Monitor your email campaigns and responses from venues.',
      action: 'View Outreach',
      actionUrl: '/app/outreach',
      completed: false,
      priority: 4,
      icon: '📊',
      color: 'bg-orange-500'
    }
  ]);

  useEffect(() => {
    if (user?.email) {
      checkOnboardingStatus();
    }
  }, [user]);

    const checkOnboardingStatus = useCallback(async () => {
    try {
      // Check if user has a complete profile
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id, profile_complete, name, genre, bio')
        .eq('email', user?.email)
        .single();

      // Check if user has any pitches
      const { count: pitchCount } = await supabase
        .from('pitches')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile?.id || '');

      // Check if user has any campaigns
      const { count: campaignCount } = await supabase
        .from('outreach_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile?.id || '');

      // Check if user has any emails
      const { count: emailCount } = await supabase
        .from('outreach_emails')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile?.id || '');

      const updatedSteps = steps.map(step => {
        switch (step.id) {
          case 'profile':
            // Profile is complete if it has essential fields
            const hasEssentialFields = profile?.name && profile?.genre && profile?.bio;
            return { ...step, completed: !!profile?.profile_complete || !!hasEssentialFields };
          case 'sample-data':
            // Sample data is complete if user has any pitches or campaigns
            return { ...step, completed: (pitchCount || 0) > 0 || (campaignCount || 0) > 0 };
          case 'pitch':
            return { ...step, completed: (pitchCount || 0) > 0 };
          case 'outreach':
            return { ...step, completed: (campaignCount || 0) > 0 || (emailCount || 0) > 0 };
          default:
            return step;
        }
      });

      setSteps(updatedSteps);

      // Find the first incomplete step and set it as current
      const incompleteSteps = updatedSteps.filter(step => !step.completed);
      if (incompleteSteps.length > 0) {
        // Sort by priority and find the first incomplete step
        const sortedIncomplete = incompleteSteps.sort((a, b) => a.priority - b.priority);
        const firstIncompleteStep = sortedIncomplete[0];
        if (firstIncompleteStep) {
          const firstIncompleteIndex = updatedSteps.findIndex(step => step.id === firstIncompleteStep.id);
          setCurrentStep(firstIncompleteIndex);
        }
      }

      // Show onboarding if user hasn't completed all steps
      const allCompleted = updatedSteps.every(step => step.completed);
      if (!allCompleted) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, [user?.email, steps]);

  const handleStepAction = async (step: OnboardingStep) => {
    if (step.id === 'sample-data') {
      await createSampleData();
    } else if (step.actionUrl) {
      // Close modal and navigate
      setIsOpen(false);
      setTimeout(() => {
        window.location.href = step.actionUrl!;
      }, 300);
    }
  };

  const createSampleData = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Get artist profile ID
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const response = await fetch('/api/onboarding/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist_id: profile.id,
          email: user.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sample data');
      }

      // Update the step as completed
      const updatedSteps = steps.map(step =>
        step.id === 'sample-data' ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);

      // Move to next incomplete step
      const nextIncompleteIndex = updatedSteps.findIndex((step, index) =>
        index > currentStep && !step.completed
      );
      if (nextIncompleteIndex !== -1) {
        setCurrentStep(nextIncompleteIndex);
      } else {
        // If no next incomplete step, find the first incomplete step
        const firstIncompleteIndex = updatedSteps.findIndex(step => !step.completed);
        if (firstIncompleteIndex !== -1) {
          setCurrentStep(firstIncompleteIndex);
        }
      }

    } catch (error) {
      console.error('Error creating sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = () => {
    setIsOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const getCompletedCount = () => steps.filter(step => step.completed).length;
  const getTotalSteps = () => steps.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TheGreenRoom.ai! 🎵</h2>
                <p className="text-gray-600 text-lg">Let&apos;s get you set up to start booking gigs</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Progress:</span>
                    <span className="text-lg font-bold text-green-600">{getCompletedCount()}/{getTotalSteps()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Next:</span>
                    <span className="text-sm font-medium text-gray-900">{steps[currentStep]?.title}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={skipOnboarding}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-6 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round((getCompletedCount() / getTotalSteps()) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(getCompletedCount() / getTotalSteps()) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-8"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${steps[currentStep]?.color} text-white text-3xl mb-6`}>
                {steps[currentStep]?.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {steps[currentStep]?.title}
              </h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {steps[currentStep]?.description}
              </p>
            </motion.div>

            {/* Action Button */}
            <div className="text-center">
              <motion.button
                onClick={() => steps[currentStep] && handleStepAction(steps[currentStep])}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  steps[currentStep]?.action
                )}
              </motion.button>
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <h4 className="font-bold text-gray-900 mb-6 text-lg">Your Onboarding Journey</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-white border-2 border-green-200 shadow-lg'
                      : step.completed
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    step.completed
                      ? 'bg-green-600 text-white'
                      : index === currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      step.completed ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                  {step.completed && (
                    <span className="text-green-600 text-sm font-bold">Complete</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-8 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              ← Previous
            </button>
            <div className="flex gap-4">
              <button
                onClick={skipOnboarding}
                className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip for now
              </button>
              {currentStep < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
