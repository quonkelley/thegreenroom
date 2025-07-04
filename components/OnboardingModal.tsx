import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  completed: boolean;
}

export default function OnboardingModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, social links, and pricing to help venues understand your style.',
      action: 'Complete Profile',
      actionUrl: '/app/profile',
      completed: false
    },
    {
      id: 'sample-data',
      title: 'Get Sample Data',
      description: 'We\'ll create sample pitches and campaigns to show you how everything works.',
      action: 'Create Samples',
      completed: false
    },
    {
      id: 'pitch',
      title: 'Generate Your First Pitch',
      description: 'Use AI to create a personalized booking pitch for venues.',
      action: 'Create Pitch',
      actionUrl: '/app/pitch',
      completed: false
    },
    {
      id: 'outreach',
      title: 'Track Your Outreach',
      description: 'Monitor your email campaigns and responses from venues.',
      action: 'View Outreach',
      actionUrl: '/app/outreach',
      completed: false
    }
  ]);

  useEffect(() => {
    if (user?.email) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has a complete profile
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('profile_complete')
        .eq('email', user?.email)
        .single();

      // Check if user has any pitches
      const { count: pitchCount } = await supabase
        .from('pitches')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile?.id);

      // Check if user has any campaigns
      const { count: campaignCount } = await supabase
        .from('outreach_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', profile?.id);

      const updatedSteps = steps.map(step => {
        switch (step.id) {
          case 'profile':
            return { ...step, completed: !!profile?.profile_complete };
          case 'sample-data':
            return { ...step, completed: (pitchCount || 0) > 0 };
          case 'pitch':
            return { ...step, completed: (pitchCount || 0) > 0 };
          case 'outreach':
            return { ...step, completed: (campaignCount || 0) > 0 };
          default:
            return step;
        }
      });

      setSteps(updatedSteps);

      // Show onboarding if user hasn't completed all steps
      const allCompleted = updatedSteps.every(step => step.completed);
      if (!allCompleted) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleStepAction = async (step: OnboardingStep) => {
    if (step.id === 'sample-data') {
      await createSampleData();
    } else if (step.actionUrl) {
      window.location.href = step.actionUrl;
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

      // Move to next step
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));

    } catch (error) {
      console.error('Error creating sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = () => {
    setIsOpen(false);
    // Optionally save that user has seen onboarding
    localStorage.setItem('onboarding_completed', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to TheGreenRoom.ai! 🎵</h2>
              <p className="text-gray-600 mt-1">Let's get you set up to start booking gigs</p>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">
              {steps[currentStep].id === 'profile' && '👤'}
              {steps[currentStep].id === 'sample-data' && '📝'}
              {steps[currentStep].id === 'pitch' && '🤖'}
              {steps[currentStep].id === 'outreach' && '📊'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={() => handleStepAction(steps[currentStep])}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : steps[currentStep].action}
            </button>
          </div>
        </div>

        {/* All Steps Overview */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Your Onboarding Checklist</h4>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  index === currentStep 
                    ? 'bg-green-50 border border-green-200' 
                    : step.completed 
                    ? 'bg-gray-50' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-600 text-white' 
                    : index === currentStep 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.completed ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {step.completed && (
                  <span className="text-green-600 text-sm font-medium">Complete</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={skipOnboarding}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now
            </button>
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 