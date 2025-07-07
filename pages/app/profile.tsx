import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Music,
  Phone,
  Save,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppNavigation from '../../components/AppNavigation';
import { useOnboardingStepTracker } from '../../components/OnboardingModal';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';

const steps = ['Basic Info', 'Links & Media', 'Pricing & Availability'];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'spotify', label: 'Spotify', icon: '🎵' },
  { key: 'youtube', label: 'YouTube', icon: '📺' },
  { key: 'tiktok', label: 'TikTok', icon: '🎬' },
  { key: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { key: 'facebook', label: 'Facebook', icon: '📘' },
  { key: 'soundcloud', label: 'SoundCloud', icon: '🎧' },
  { key: 'bandcamp', label: 'Bandcamp', icon: '🎼' },
];

const LOCAL_STORAGE_KEY = 'artist_profile_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds

interface ProfileForm {
  name: string;
  genre: string;
  city: string;
  state: string;
  country: string;
  website: string;
  social_links: { [key: string]: string };
  pricing: string;
  availability: string;
  bio: string;
  email: string;
  phone: string;
  press_kit_url: string;
}

interface ExistingProfile {
  id: string;
  name: string;
  genre: string;
  city: string;
  state: string;
  country: string;
  website: string;
  social_links: { [key: string]: string };
  pricing: string;
  availability: string;
  bio: string;
  email: string;
  phone: string;
  press_kit_url: string;
  created_at: string;
  updated_at: string;
}

export default function ArtistProfilePage() {
  const { user } = useAuth();
  const [existingProfile, setExistingProfile] =
    useState<ExistingProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { markStepActive, markStepCompleted } = useOnboardingStepTracker();

  // Load existing profile on mount
  const loadExistingProfile = useCallback(async () => {
    // Loading profile for user
    if (!user?.id) {
      // No user ID, setting loading to false
      setProfileLoading(false);
      return;
    }
    try {
      // Fetching profile from API
      const response = await fetch(`/api/profiles?user_id=${user.id}`);
      const data = await response.json();
      // API response
      if (data.success) {
        // Profile data received
        setExistingProfile(data.profile); // This will be null if no profile exists
      } else {
        // API error
      }
    } catch (error) {
      // Failed to load profile
    } finally {
      // Setting profile loading to false
      setProfileLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setProfileLoading(false);
      return;
    }
    loadExistingProfile();
  }, [user?.id]); // Remove loadExistingProfile from dependencies

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleProfileSaved = (savedProfile: ExistingProfile) => {
    setExistingProfile(savedProfile);
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If no profile exists or user wants to edit, show the wizard
  if (!existingProfile || isEditing) {
    return (
      <ArtistProfileWizard
        onProfileSaved={handleProfileSaved}
        existingProfile={existingProfile}
      />
    );
  }

  // Show completed profile view
  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <AppNavigation />
        <div className='max-w-4xl mx-auto py-12 px-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-800'>
                Artist Profile
              </h1>
              <p className='text-gray-600 mt-1'>
                Your complete artist profile for venues
              </p>
            </div>
            <button
              onClick={handleEditProfile}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
            >
              <Edit className='w-4 h-4' />
              Edit Profile
            </button>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-xl shadow-sm border overflow-hidden'
          >
            {/* Profile Header */}
            <div className='bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white'>
              <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-white/20 rounded-full flex items-center justify-center'>
                  <Music className='w-10 h-10' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold'>{existingProfile.name}</h2>
                  <p className='text-green-100'>{existingProfile.genre}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {existingProfile.city}, {existingProfile.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className='p-8'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Main Info */}
                <div className='lg:col-span-2 space-y-6'>
                  {/* Bio */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                      About
                    </h3>
                    <p className='text-gray-700 leading-relaxed'>
                      {existingProfile.bio}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                      Contact Information
                    </h3>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <Mail className='w-4 h-4 text-gray-500' />
                        <span className='text-gray-700'>
                          {existingProfile.email}
                        </span>
                      </div>
                      {existingProfile.phone && (
                        <div className='flex items-center gap-3'>
                          <Phone className='w-4 h-4 text-gray-500' />
                          <span className='text-gray-700'>
                            {existingProfile.phone}
                          </span>
                        </div>
                      )}
                      {existingProfile.website && (
                        <div className='flex items-center gap-3'>
                          <Globe className='w-4 h-4 text-gray-500' />
                          <a
                            href={existingProfile.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-700 flex items-center gap-1'
                          >
                            {existingProfile.website}
                            <ExternalLink className='w-3 h-3' />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  {Object.keys(existingProfile.social_links || {}).length >
                    0 && (
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                        Social Media
                      </h3>
                      <div className='flex flex-wrap gap-3'>
                        {Object.entries(existingProfile.social_links).map(
                          ([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
                            >
                              {platform}
                              <ExternalLink className='w-3 h-3' />
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                  {/* Pricing */}
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <DollarSign className='w-4 h-4 text-green-600' />
                      <h4 className='font-semibold text-gray-800'>Pricing</h4>
                    </div>
                    <p className='text-gray-700'>{existingProfile.pricing}</p>
                  </div>

                  {/* Availability */}
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Calendar className='w-4 h-4 text-blue-600' />
                      <h4 className='font-semibold text-gray-800'>
                        Availability
                      </h4>
                    </div>
                    <p className='text-gray-700'>
                      {existingProfile.availability}
                    </p>
                  </div>

                  {/* Press Kit */}
                  {existingProfile.press_kit_url && (
                    <div className='bg-gray-50 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>
                        Press Kit
                      </h4>
                      <a
                        href={existingProfile.press_kit_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1'
                      >
                        View Press Kit
                        <ExternalLink className='w-3 h-3' />
                      </a>
                    </div>
                  )}

                  {/* Profile Stats */}
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-semibold text-gray-800 mb-3'>
                      Profile Status
                    </h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Last Updated:</span>
                        <span className='text-gray-800'>
                          {new Date(
                            existingProfile.updated_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Profile Status:</span>
                        <span className='text-green-600 font-medium'>
                          Complete ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className='mt-8 flex justify-center gap-4'>
            <button
              onClick={() => (window.location.href = '/app/dashboard')}
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => (window.location.href = '/pitch')}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Create Pitch
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ArtistProfileWizard Component for creating/editing profiles
interface ArtistProfileWizardProps {
  onProfileSaved: (profile: ExistingProfile) => void;
  existingProfile: ExistingProfile | null;
}

function ArtistProfileWizard({
  onProfileSaved,
  existingProfile,
}: ArtistProfileWizardProps) {
  const { user } = useAuth();
  const { markStepActive, markStepCompleted } = useOnboardingStepTracker();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    genre: '',
    city: '',
    state: '',
    country: 'USA',
    website: '',
    social_links: {},
    pricing: '',
    availability: '',
    bio: '',
    email: '',
    phone: '',
    press_kit_url: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeoutId, setAutoSaveTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  // Load existing profile data or draft from localStorage
  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name || '',
        genre: existingProfile.genre || '',
        city: existingProfile.city || '',
        state: existingProfile.state || '',
        country: existingProfile.country || 'USA',
        website: existingProfile.website || '',
        social_links: existingProfile.social_links || {},
        pricing: existingProfile.pricing || '',
        availability: existingProfile.availability || '',
        bio: existingProfile.bio || '',
        email: existingProfile.email || user?.email || '',
        phone: existingProfile.phone || '',
        press_kit_url: existingProfile.press_kit_url || '',
      });
    } else {
      // Load draft from localStorage if no existing profile
      const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (draft) {
        const draftData = JSON.parse(draft);
        setForm(prev => ({ ...prev, ...draftData, email: user?.email || '' }));
      } else {
        // Set default email
        setForm(prev => ({ ...prev, email: user?.email || '' }));
      }
    }
  }, [existingProfile, user]);

  // Enhanced auto-save with status feedback
  const saveDraft = useCallback(async () => {
    setAutoSaveStatus('saving');
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      setLastSaved(new Date());
      setAutoSaveStatus('saved');

      // Clear saved status after 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
    } catch (error) {
      // Error saving draft
      setAutoSaveStatus('error');
    }
  }, [form]);

  // Auto-save functionality
  const autoSaveTimer = useCallback(() => {
    if (Object.keys(errors).length === 0) {
      saveDraft();
    }
  }, [errors, saveDraft]);

  useEffect(() => {
    const timer = setTimeout(autoSaveTimer, 2000);
    return () => clearTimeout(timer);
  }, [autoSaveTimer]);

  // Handle input changes with real-time validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle social link changes
  const handleSocialChange = (platform: string, url: string) => {
    setForm(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url,
      },
    }));
  };

  // Remove social link
  const removeSocialLink = (platform: string) => {
    setForm(prev => {
      const newSocialLinks = { ...prev.social_links };
      delete newSocialLinks[platform];
      return { ...prev, social_links: newSocialLinks };
    });
  };

  // Enhanced validation with real-time feedback
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      if (!form.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!form.genre.trim()) {
        newErrors.genre = 'Genre is required';
      }
      if (!form.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (step === 1) {
      if (form.website && !/^https?:\/\/.+/.test(form.website)) {
        newErrors.website =
          'Please enter a valid URL starting with http:// or https://';
      }
    }

    if (step === 2) {
      if (!form.bio.trim()) {
        newErrors.bio = 'Bio is required (helps venues understand your style)';
      }
      if (!form.pricing.trim()) {
        newErrors.pricing = 'Pricing range is required';
      }
      if (!form.availability.trim()) {
        newErrors.availability = 'Availability is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(s => Math.min(s + 1, steps.length - 1));
      // Save draft when moving to next step
      saveDraft();
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 0));
    // Save draft when moving to previous step
    saveDraft();
  };

  // Submit to API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setSubmitError('');
    setSuccess('');
    if (!validateStep()) {
      return;
    }

    // Mark profile step as active when user starts submitting
    markStepActive('profile');
    setLoading(true);

    try {
      const profileData = {
        name: form.name.trim(),
        genre: form.genre.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country,
        website: form.website.trim(),
        pricing: form.pricing.trim(),
        availability: form.availability.trim(),
        bio: form.bio.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        press_kit_url: form.press_kit_url.trim(),
        social_links: form.social_links,
        user_id: user?.id,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Failed to save profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse the response JSON
      let result;
      try {
        const responseText = await response.text();
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        result = JSON.parse(responseText);
      } catch (parseError) {
        // JSON parse error
        throw new Error('Invalid response from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }

      setSuccess(result.message || 'Profile saved successfully!');
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Mark profile step as completed for onboarding
      markStepCompleted('profile');

      // Call the callback to update the parent component
      onProfileSaved(result.data);
    } catch (err: any) {
      // Profile save error

      if (err.name === 'AbortError') {
        setSubmitError(
          'Request timed out. Please check your connection and try again.'
        );
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setSubmitError(
          'Network error. Please check your connection and try again.'
        );
      } else {
        setSubmitError(
          err.message || 'Failed to save profile. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = [
      'name',
      'genre',
      'city',
      'email',
      'bio',
      'pricing',
      'availability',
    ];
    const completedFields = requiredFields.filter(field =>
      form[field as keyof typeof form]?.toString().trim()
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <AppNavigation />
        <div className='max-w-4xl mx-auto py-12 px-4'>
          {/* Header with Auto-save Status */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-800'>
                {existingProfile
                  ? 'Edit Artist Profile'
                  : 'Create Artist Profile'}
              </h1>
              <p className='text-gray-600 mt-1'>
                Complete your profile to unlock AI-powered booking features
              </p>
              <div className='mt-2 flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>Completion:</span>
                  <span className='text-sm font-semibold text-green-600'>
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  {autoSaveStatus === 'saving' && (
                    <div className='flex items-center gap-1 text-sm text-blue-600'>
                      <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600'></div>
                      Saving...
                    </div>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <div className='flex items-center gap-1 text-sm text-green-600'>
                      <CheckCircle className='w-3 h-3' />
                      Saved
                    </div>
                  )}
                  {autoSaveStatus === 'error' && (
                    <div className='flex items-center gap-1 text-sm text-red-600'>
                      <AlertCircle className='w-3 h-3' />
                      Save failed
                    </div>
                  )}
                  {lastSaved && (
                    <span className='text-xs text-gray-500'>
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className='flex gap-3'>
              <button
                type='button'
                className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                onClick={saveDraft}
                disabled={loading}
              >
                <Save className='w-4 h-4' />
                Save Draft
              </button>
              <button
                type='button'
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={step === steps.length - 1 ? handleSubmit : nextStep}
                disabled={loading}
                data-testid='form-save-continue'
              >
                {step === steps.length - 1 ? (
                  loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-4 h-4' />
                      Save Profile
                    </>
                  )
                ) : (
                  <>
                    Save & Continue
                    <span className='text-sm'>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className='flex items-center justify-center mb-8'>
            <div className='flex items-center gap-6'>
              {steps.map((label, i) => (
                <motion.div
                  key={label}
                  className='flex items-center gap-3'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i === step
                        ? 'bg-green-600 text-white scale-110'
                        : i < step
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      i === step ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 transition-colors ${
                        i < step ? 'bg-green-300' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                className='mb-6 text-green-700 font-medium bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-2'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className='w-5 h-5' />
                {success}
              </motion.div>
            )}
            {submitError && (
              <motion.div
                className='mb-6 text-red-700 font-medium bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className='w-5 h-5' />
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <form className='space-y-6' onSubmit={handleSubmit}>
            <AnimatePresence mode='wait'>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className='bg-white rounded-xl p-8 shadow-sm border'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-900'>
                      Basic Information
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Full Name *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.name
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='Enter your name'
                          name='name'
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.name && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.name}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Primary Genre *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.genre
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='e.g. Jazz, Rock, Electronic'
                          name='genre'
                          value={form.genre}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.genre && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.genre}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          City *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.city
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='e.g. New York'
                          name='city'
                          value={form.city}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.city && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.city}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          State/Province
                        </label>
                        <input
                          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                          placeholder='e.g. NY, CA'
                          name='state'
                          value={form.state}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Email *
                        </label>
                        <input
                          type='email'
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.email
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='your@email.com'
                          name='email'
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.email && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.email}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Phone
                        </label>
                        <input
                          type='tel'
                          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                          placeholder='+1 (555) 123-4567'
                          name='phone'
                          value={form.phone}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className='bg-white rounded-xl p-8 shadow-sm border'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-900'>
                      Links & Media
                    </h2>
                    <div className='space-y-6'>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Website or EPK URL
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.website
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='https://yourwebsite.com'
                          name='website'
                          value={form.website}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.website && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.website}
                          </motion.div>
                        )}
                      </div>

                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Press Kit URL
                        </label>
                        <input
                          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                          placeholder='https://yourpresskit.com'
                          name='press_kit_url'
                          value={form.press_kit_url}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className='block mb-4 font-semibold text-gray-700'>
                          Social Media Links
                        </label>
                        <div className='space-y-4'>
                          {SOCIAL_PLATFORMS.map(platform => (
                            <div
                              key={platform.key}
                              className='flex items-center gap-4'
                            >
                              <span className='text-2xl'>{platform.icon}</span>
                              <span className='w-24 text-sm font-semibold text-gray-700'>
                                {platform.label}
                              </span>
                              <input
                                className='flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                placeholder={`Your ${platform.label} URL`}
                                value={form.social_links[platform.key] || ''}
                                onChange={e =>
                                  handleSocialChange(
                                    platform.key,
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                              />
                              {form.social_links[platform.key] && (
                                <button
                                  type='button'
                                  onClick={() => removeSocialLink(platform.key)}
                                  className='text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors'
                                  disabled={loading}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className='bg-white rounded-xl p-8 shadow-sm border'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-900'>
                      Pricing & Availability
                    </h2>
                    <div className='space-y-6'>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Pricing Range *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.pricing
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='e.g. $500-$1000, $75/hour'
                          name='pricing'
                          value={form.pricing}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.pricing && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.pricing}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Availability *
                        </label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.availability
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder='e.g. Weekends, Fridays, Flexible'
                          name='availability'
                          value={form.availability}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.availability && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.availability}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className='block mb-2 font-semibold text-gray-700'>
                          Artist Bio *
                        </label>
                        <textarea
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.bio
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          rows={6}
                          placeholder='Tell venues about your music, experience, and what makes you unique...'
                          name='bio'
                          value={form.bio}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.bio && (
                          <motion.div
                            className='text-red-600 text-sm mt-2 flex items-center gap-1'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className='w-4 h-4' />
                            {errors.bio}
                          </motion.div>
                        )}
                        <p className='text-sm text-gray-500 mt-2'>
                          This helps venues understand your style and
                          experience.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className='flex justify-between mt-8'>
              <button
                type='button'
                className='text-gray-600 hover:text-gray-800 font-medium px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2'
                onClick={prevStep}
                disabled={step === 0 || loading}
              >
                ← Back
              </button>
              <button
                type={step === steps.length - 1 ? 'submit' : 'button'}
                className='bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                onClick={step === steps.length - 1 ? undefined : nextStep}
                disabled={loading}
                data-testid='form-save-continue'
              >
                {step === steps.length - 1 ? (
                  loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='w-4 h-4' />
                      Save Profile
                    </>
                  )
                ) : (
                  <>
                    Save & Continue
                    <span className='text-sm'>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
