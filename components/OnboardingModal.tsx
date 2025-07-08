/**
 * OnboardingModal - Contextual Onboarding System
 *
 * This component implements a modern, contextual onboarding system based on industry best practices.
 *
 * Key Features:
 * - Contextual triggers (page visits, feature usage, app starts)
 * - Progressive frequency limits to prevent overwhelming users
 * - Shorter delays for better user experience
 * - Smart completion tracking
 *
 * Usage:
 *
 * 1. Basic usage (automatic on app start):
 *    <OnboardingModal />
 *
 * 2. Contextual triggers in other components:
 *    import { useOnboardingTrigger } from './OnboardingModal';
 *
 *    const { triggerOnboarding } = useOnboardingTrigger();
 *
 *    // Trigger on page visit
 *    triggerOnboarding('page-visit');
 *
 *    // Trigger on feature use
 *    triggerOnboarding('feature-use');
 *
 * 3. Check eligibility:
 *    import { checkOnboardingEligibility } from './OnboardingModal';
 *
 *    if (checkOnboardingEligibility('page-visit')) {
 *      // Show contextual help
 *    }
 *
 * Frequency Limits:
 * - App start: 2 hours between shows
 * - Page visit: 30 minutes between shows
 * - Feature use: 15 minutes between shows
 *
 * Based on best practices from Appcues, Chameleon, and Superhuman onboarding systems.
 */

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { validateEmail, validateId } from '../lib/security';
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

// Export types and functions for use throughout the app
export interface OnboardingContext {
  type: 'page-visit' | 'feature-use' | 'app-start';
  page?: string;
  feature?: string;
}

export const ONBOARDING_CONTEXTS = {
  PAGE_VISIT: 'page-visit',
  FEATURE_USE: 'feature-use',
  APP_START: 'app-start',
} as const;

export default function OnboardingModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Track active step completion to prevent modal from showing during work
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [lastStepCompletion, setLastStepCompletion] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<Record<string, boolean>>({});

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description:
        'Add your bio, social links, and pricing to help venues understand your style.',
      action: 'Complete Profile',
      actionUrl: '/app/profile',
      completed: false,
      priority: 1,
      icon: '👤',
      color: 'bg-blue-500',
    },
    {
      id: 'sample-data',
      title: 'See It In Action',
      description:
        "We'll create sample pitches and campaigns so you can see exactly how TheGreenRoom.ai works.",
      action: 'Create Sample Data',
      completed: false,
      priority: 2,
      icon: '🎯',
      color: 'bg-purple-500',
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
      color: 'bg-green-500',
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
      color: 'bg-orange-500',
    },
  ]);

  // Function to mark a step as actively being worked on
  const markStepActive = (stepId: string) => {
    setActiveStepId(stepId);
    // Don't show modal when user is actively working on a step
    setIsOpen(false);
    if (process.env.NODE_ENV === 'development') {
      // Step marked as active
    }
  };

  // Function to mark a step as completed
  const markStepCompleted = (stepId: string) => {
    setActiveStepId(null);
    setLastStepCompletion(Date.now());
    setStepProgress(prev => ({ ...prev, [stepId]: true }));

    // Update steps state
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );

    if (process.env.NODE_ENV === 'development') {
      // Step marked as completed
    }

    // Show modal briefly to congratulate and guide to next step
    const MODAL_DELAY_MS = 1000;
    setTimeout(() => {
      if (shouldShowOnboarding('step-completion')) {
        setIsOpen(true);
      }
    }, MODAL_DELAY_MS);
  };

  // Function to check if user is actively working on a step
  const isStepActive = (stepId: string) => {
    return activeStepId === stepId;
  };

  // Enhanced onboarding check that respects active work
  const checkOnboardingStatus = useCallback(async () => {
    try {
      // Don't check if user is actively working on a step
      if (activeStepId) {
        if (process.env.NODE_ENV === 'development') {
          // Skipping check - user is active on step
        }
        return;
      }

      // Check if user has explicitly skipped onboarding
      const onboardingSkipped =
        localStorage.getItem('onboarding_completed') === 'true';
      if (onboardingSkipped) {
        setIsOpen(false);
        return;
      }

      // Input validation using security utilities
      const sanitizedEmail = validateEmail(user?.email);
      if (!sanitizedEmail) {
        // Invalid email format detected
        return;
      }

      // Check if user has a complete profile
      const { data: profile, error: profileError } = await supabase
        .from('artist_profiles')
        .select('id, profile_complete, name, genre, bio')
        .eq('email', sanitizedEmail)
        .single();

      // If no profile exists, that's fine - user needs to create one
      if (profileError && profileError.code !== 'PGRST116') {
        // Error fetching profile
        return;
      }

      // If no profile found, user needs to complete profile step
      const hasProfile = !profileError && profile;

      // Only check for pitches/campaigns/emails if user has a profile
      let pitchCount = 0;
      let campaignCount = 0;
      let emailCount = 0;

      if (hasProfile) {
        // Validate profile ID before using in queries
        const validatedProfileId = validateId(profile?.id);

        // Check if user has any pitches
        const { count: pitchCountResult, error: pitchError } = await supabase
          .from('pitches')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', validatedProfileId);

        if (pitchError) {
          // Error fetching pitch count
        } else {
          pitchCount = pitchCountResult || 0;
        }

        // Check if user has any campaigns
        const { count: campaignCountResult, error: campaignError } =
          await supabase
            .from('outreach_campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', validatedProfileId);

        if (campaignError) {
          // Error fetching campaign count
        } else {
          campaignCount = campaignCountResult || 0;
        }

        // Check if user has any emails
        const { count: emailCountResult, error: emailError } = await supabase
          .from('outreach_emails')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', validatedProfileId);

        if (emailError) {
          // Error fetching email count
        } else {
          emailCount = emailCountResult || 0;
        }
      }

      const updatedSteps = steps.map(step => {
        switch (step.id) {
          case 'profile':
            // Profile is complete if it has essential fields
            const hasEssentialFields =
              hasProfile && profile?.name && profile?.genre && profile?.bio;
            return {
              ...step,
              completed: !!profile?.profile_complete || !!hasEssentialFields,
            };
          case 'sample-data':
            // Sample data is complete if user has any pitches or campaigns
            return {
              ...step,
              completed: pitchCount > 0 || campaignCount > 0,
            };
          case 'pitch':
            return { ...step, completed: pitchCount > 0 };
          case 'outreach':
            return {
              ...step,
              completed: campaignCount > 0 || emailCount > 0,
            };
          default:
            return step;
        }
      });

      setSteps(updatedSteps);

      // Find the first incomplete step and set it as current
      const incompleteSteps = updatedSteps.filter(step => !step.completed);
      if (incompleteSteps.length > 0) {
        // Sort by priority and find the first incomplete step
        const sortedIncomplete = incompleteSteps.sort(
          (a, b) => a.priority - b.priority
        );
        const firstIncompleteStep = sortedIncomplete[0];
        if (firstIncompleteStep) {
          const firstIncompleteIndex = updatedSteps.findIndex(
            step => step.id === firstIncompleteStep.id
          );
          setCurrentStep(firstIncompleteIndex);
        }
      }

      // Only show onboarding if:
      // 1. User hasn't completed all steps
      // 2. User hasn't skipped onboarding
      // 3. User isn't actively working on a step
      // 4. Enough time has passed since last completion
      const allCompleted = updatedSteps.every(step => step.completed);
      const timeSinceLastCompletion = Date.now() - lastStepCompletion;
      const minTimeBetweenShows = 5 * 60 * 1000; // 5 minutes

      if (
        !allCompleted &&
        !onboardingSkipped &&
        timeSinceLastCompletion > minTimeBetweenShows
      ) {
        const lastShown = localStorage.getItem('onboarding_last_shown');
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;

        if (!lastShown || now - parseInt(lastShown) > twoHours) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      // Error checking onboarding status
    }
  }, [user?.email, activeStepId, lastStepCompletion]);

  useEffect(() => {
    if (user?.email) {
      checkOnboardingStatus();
    }
  }, [user, checkOnboardingStatus]);

  // Enhanced step action handler
  const handleStepAction = async (step: OnboardingStep) => {
    if (step.id === 'sample-data') {
      await createSampleData();
    } else if (step.actionUrl) {
      // Mark step as active before navigating
      markStepActive(step.id);

      // Close modal and navigate
      setIsOpen(false);
      setTimeout(() => {
        window.location.href = step.actionUrl!;
      }, 300);
    }
  };

  const createSampleData = async () => {
    // Input validation using security utilities
    const sanitizedEmail = validateEmail(user?.email);
    if (!sanitizedEmail) {
      // Invalid email format detected
      return;
    }

    setLoading(true);
    try {
      // Get artist profile ID with proper error handling
      const { data: profile, error: profileError } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('email', sanitizedEmail)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Validate profile ID before using
      const validatedProfileId = validateId(profile.id);
      if (!validatedProfileId) {
        throw new Error('Invalid profile ID');
      }

      const response = await fetch('/api/onboarding/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist_id: validatedProfileId,
          email: sanitizedEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sample data');
      }

      // Mark the sample-data step as completed using the new function
      markStepCompleted('sample-data');
    } catch (error) {
      // Error creating sample data
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = () => {
    setIsOpen(false);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_last_shown', Date.now().toString());
  };

  const skipForNow = () => {
    setIsOpen(false);
    // Reduced delay from 24 hours to 2 hours for better user experience
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    localStorage.setItem(
      'onboarding_last_shown',
      (Date.now() + twoHours).toString()
    );
  };

  // Function to manually reopen onboarding (for testing or user preference)
  const reopenOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_last_shown');
    setIsOpen(true);
  };

  // New function to check if onboarding should show based on context
  const shouldShowOnboarding = (context?: string) => {
    // If user has completed onboarding, don't show
    if (localStorage.getItem('onboarding_completed') === 'true') {
      return false;
    }

    // Check if we're within the frequency limit
    const lastShown = localStorage.getItem('onboarding_last_shown');
    const now = Date.now();

    if (lastShown) {
      const lastShownTime = parseInt(lastShown);
      // If last shown is in the future (due to skipForNow), check if we're past it
      if (lastShownTime > now) {
        return false;
      }
    }

    // Context-specific frequency limits
    const contextLimits = {
      'page-visit': 30 * 60 * 1000, // 30 minutes between page visits
      'feature-use': 15 * 60 * 1000, // 15 minutes between feature usage
      'app-start': 2 * 60 * 60 * 1000, // 2 hours between app starts
    };

    const limit =
      contextLimits[context as keyof typeof contextLimits] ||
      contextLimits['app-start'];
    const lastContextShown = localStorage.getItem(
      `onboarding_last_shown_${context}`
    );

    if (lastContextShown) {
      const lastContextTime = parseInt(lastContextShown);
      if (now - lastContextTime < limit) {
        return false;
      }
    }

    return true;
  };

  // Function to show onboarding with context tracking
  const showOnboardingWithContext = (context: string = 'app-start') => {
    if (shouldShowOnboarding(context)) {
      setIsOpen(true);
      localStorage.setItem(
        `onboarding_last_shown_${context}`,
        Date.now().toString()
      );
    }
  };

  // Expose functions globally for testing and contextual triggers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).markStepActive = markStepActive;
      (window as any).markStepCompleted = markStepCompleted;
      (window as any).reopenOnboarding = reopenOnboarding;
      (window as any).resetOnboarding = () => {
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboarding_last_shown');
        localStorage.removeItem('onboarding_last_shown_page-visit');
        localStorage.removeItem('onboarding_last_shown_feature-use');
        localStorage.removeItem('onboarding_last_shown_app-start');
        setActiveStepId(null);
        setLastStepCompletion(0);
        setStepProgress({});
        window.location.reload();
      };
      (window as any).showOnboardingWithContext = showOnboardingWithContext;
    }
  }, []);

  const getCompletedCount = () => steps.filter(step => step.completed).length;
  const getTotalSteps = () => steps.length;

  if (!isOpen) {
    return null;
  }

  // Check if all steps are completed
  const allCompleted = steps.every(step => step.completed);
  if (allCompleted) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className='p-8 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {/* Logo */}
                <div className='w-12 h-12 relative'>
                  <Image
                    src='/logo.svg'
                    alt='TheGreenRoom.ai Logo'
                    width={48}
                    height={48}
                    className='object-contain'
                  />
                </div>
                                <div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                    Welcome to TheGreenRoom.ai! 🎵
                  </h2>
                  <p className='text-gray-600 text-lg'>
                    Let&apos;s get you set up to start booking gigs
                  </p>
                  <div className='mt-4 flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-600'>
                        Progress:
                      </span>
                      <span className='text-lg font-bold text-green-600'>
                        {getCompletedCount()}/{getTotalSteps()}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-600'>
                        Next:
                      </span>
                      <span className='text-sm font-medium text-gray-900'>
                        {steps[currentStep]?.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={skipOnboarding}
                className='text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='px-8 py-6 bg-gray-50'>
            <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>
                {Math.round((getCompletedCount() / getTotalSteps()) * 100)}%
                Complete
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <motion.div
                className='bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full'
                initial={{ width: 0 }}
                animate={{
                  width: `${(getCompletedCount() / getTotalSteps()) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className='p-8'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className='text-center mb-8'
            >
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${steps[currentStep]?.color} text-white text-3xl mb-6`}
              >
                {steps[currentStep]?.icon}
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                {steps[currentStep]?.title}
              </h3>
              <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
                {steps[currentStep]?.description}
              </p>
            </motion.div>

            {/* Action Button */}
            <div className='text-center'>
              <motion.button
                onClick={() =>
                  steps[currentStep] && handleStepAction(steps[currentStep])
                }
                disabled={loading}
                className='bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    Creating...
                  </div>
                ) : (
                  steps[currentStep]?.action
                )}
              </motion.button>
            </div>
          </div>

          {/* All Steps Overview */}
          <div className='p-8 border-t border-gray-200 bg-gray-50'>
            <h4 className='font-bold text-gray-900 mb-6 text-lg'>
              Your Onboarding Journey
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      step.completed
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <div className='flex-1'>
                    <p
                      className={`font-semibold ${
                        step.completed ? 'text-gray-600' : 'text-gray-900'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className='text-sm text-gray-500'>{step.description}</p>
                  </div>
                  {step.completed && (
                    <span className='text-green-600 text-sm font-bold'>
                      Complete
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className='p-8 border-t border-gray-200 flex justify-between items-center'>
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
              disabled={currentStep === 0}
              className='text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              ← Previous
            </button>
            <div className='flex gap-4'>
              <button
                onClick={skipForNow}
                className='text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                Skip for now
              </button>
              <button
                onClick={skipOnboarding}
                className='text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm'
              >
                Don&apos;t show again
              </button>
              {currentStep < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
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

// Custom hook for triggering contextual onboarding
export const useOnboardingTrigger = () => {
  const triggerOnboarding = (context: string = 'app-start') => {
    if (
      typeof window !== 'undefined' &&
      (window as any).showOnboardingWithContext
    ) {
      (window as any).showOnboardingWithContext(context);
    }
  };

  return { triggerOnboarding };
};

// Helper function to check if onboarding should show for a specific context
export const checkOnboardingEligibility = (context: string = 'app-start') => {
  if (typeof window !== 'undefined' && (window as any).shouldShowOnboarding) {
    return (window as any).shouldShowOnboarding(context);
  }
  return false;
};

// Export functions for other components to use
export const useOnboardingStepTracker = () => {
  const markStepActive = (stepId: string) => {
    if (typeof window !== 'undefined' && (window as any).markStepActive) {
      (window as any).markStepActive(stepId);
    }
  };

  const markStepCompleted = (stepId: string) => {
    if (typeof window !== 'undefined' && (window as any).markStepCompleted) {
      (window as any).markStepCompleted(stepId);
    }
  };

  return { markStepActive, markStepCompleted };
};
