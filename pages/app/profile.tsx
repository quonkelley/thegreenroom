import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppNavigation from '../../components/AppNavigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { ArtistProfile } from '../../types';

const steps = [
  'Basic Info',
  'Links & Media',
  'Pricing & Availability',
];

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

export default function ArtistProfileWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    genre: '',
    city: '',
    state: '',
    country: 'USA',
    website: '',
    social_links: {} as Record<string, string>,
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
  const [existingProfile, setExistingProfile] = useState<ArtistProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load existing profile and draft from localStorage
  useEffect(() => {
    if (user?.email) {
      loadExistingProfile();
    }
  }, [user]);

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
      console.error('Error saving draft:', error);
      setAutoSaveStatus('error');
    }
  }, [form]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (form.name || form.genre || form.city) {
      const timer = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_DELAY);
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [form, saveDraft]);

  const loadExistingProfile = async () => {
    if (!user?.email) return;

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (data && !error) {
        setExistingProfile(data);
        // Pre-fill form with existing data
        setForm({
          name: data.name || '',
          genre: data.genre || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'USA',
          website: data.website || '',
          social_links: data.social_links || {},
          pricing: data.pricing || '',
          availability: data.availability || '',
          bio: data.bio || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          press_kit_url: data.press_kit_url || '',
        });
      } else {
        // Load draft from localStorage if no existing profile
        const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (draft) {
          const draftData = JSON.parse(draft);
          setForm(prev => ({ ...prev, ...draftData, email: user.email || '' }));
        } else {
          // Set default email
          setForm(prev => ({ ...prev, email: user.email || '' }));
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle input changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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
        [platform]: url
      }
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
      if (!form.name.trim()) newErrors.name = 'Name is required';
      if (!form.genre.trim()) newErrors.genre = 'Genre is required';
      if (!form.city.trim()) newErrors.city = 'City is required';
      if (!form.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email';
    }

    if (step === 1) {
      if (form.website && !/^https?:\/\/.+/.test(form.website)) {
        newErrors.website = 'Please enter a valid URL starting with http:// or https://';
      }
    }

    if (step === 2) {
      if (!form.bio.trim()) newErrors.bio = 'Bio is required (helps venues understand your style)';
      if (!form.pricing.trim()) newErrors.pricing = 'Pricing range is required';
      if (!form.availability.trim()) newErrors.availability = 'Availability is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      // Save draft when moving to next step
      saveDraft();
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    // Save draft when moving to previous step
    saveDraft();
  };

  // Submit to API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError('');
    setSuccess('');
    if (!validateStep()) return;
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

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile');
      }

      setSuccess(result.message || 'Profile saved successfully!');
      setExistingProfile(result.data);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/app/dashboard';
      }, 1500);

    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = ['name', 'genre', 'city', 'email', 'bio', 'pricing', 'availability'];
    const completedFields = requiredFields.filter(field => form[field as keyof typeof form]?.toString().trim());
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  if (profileLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          {/* Header with Auto-save Status */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Artist Profile</h1>
              <p className="text-gray-600 mt-1">Complete your profile to unlock AI-powered booking features</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Completion:</span>
                  <span className="text-sm font-semibold text-green-600">{getCompletionPercentage()}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      Saving...
                    </div>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Saved
                    </div>
                  )}
                  {autoSaveStatus === 'error' && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      Save failed
                    </div>
                  )}
                  {lastSaved && (
                    <span className="text-xs text-gray-500">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={saveDraft}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={step === steps.length - 1 ? handleSubmit : nextStep}
                disabled={loading}
              >
                {step === steps.length - 1 ? (loading ? 'Saving...' : 'Complete Profile') : 'Save & Continue'}
              </button>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-6">
              {steps.map((label, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i === step ? 'bg-green-600 text-white scale-110' :
                    i < step ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    i === step ? 'text-green-600' : 'text-gray-600'
                  }`}>{label}</span>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-colors ${
                      i < step ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                className="mb-6 text-green-700 font-medium bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="w-5 h-5" />
                {success}
              </motion.div>
            )}
            {submitError && (
              <motion.div
                className="mb-6 text-red-700 font-medium bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-5 h-5" />
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Full Name *</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="Enter your name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.name && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Primary Genre *</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.genre ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="e.g. Jazz, Rock, Electronic"
                          name="genre"
                          value={form.genre}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.genre && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.genre}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">City *</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="e.g. New York"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.city && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.city}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">State/Province</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="e.g. NY, CA"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Email *</label>
                        <input
                          type="email"
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="your@email.com"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.email && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Phone</label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="+1 (555) 123-4567"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Links & Media</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Website or EPK URL</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.website ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="https://yourwebsite.com"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.website && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.website}
                          </motion.div>
                        )}
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Press Kit URL</label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://yourpresskit.com"
                          name="press_kit_url"
                          value={form.press_kit_url}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block mb-4 font-semibold text-gray-700">Social Media Links</label>
                        <div className="space-y-4">
                          {SOCIAL_PLATFORMS.map((platform) => (
                            <div key={platform.key} className="flex items-center gap-4">
                              <span className="text-2xl">{platform.icon}</span>
                              <span className="w-24 text-sm font-semibold text-gray-700">{platform.label}</span>
                              <input
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder={`Your ${platform.label} URL`}
                                value={form.social_links[platform.key] || ''}
                                onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                                disabled={loading}
                              />
                              {form.social_links[platform.key] && (
                                <button
                                  type="button"
                                  onClick={() => removeSocialLink(platform.key)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
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
                  <div className="bg-white rounded-xl p-8 shadow-sm border">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Pricing & Availability</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Pricing Range *</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.pricing ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="e.g. $500-$1000, $75/hour"
                          name="pricing"
                          value={form.pricing}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.pricing && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.pricing}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Availability *</label>
                        <input
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.availability ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="e.g. Weekends, Fridays, Flexible"
                          name="availability"
                          value={form.availability}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.availability && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.availability}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700">Artist Bio *</label>
                        <textarea
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          rows={6}
                          placeholder="Tell venues about your music, experience, and what makes you unique..."
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {errors.bio && (
                          <motion.div
                            className="text-red-600 text-sm mt-2 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.bio}
                          </motion.div>
                        )}
                        <p className="text-sm text-gray-500 mt-2">This helps venues understand your style and experience.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 font-medium px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center gap-2"
                onClick={prevStep}
                disabled={step === 0 || loading}
              >
                ← Back
              </button>
              <button
                type={step === steps.length - 1 ? 'submit' : 'button'}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={step === steps.length - 1 ? undefined : nextStep}
                disabled={loading}
                data-testid="form-save-continue"
              >
                {step === steps.length - 1 ? (
                  loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Profile
                    </>
                  )
                ) : (
                  <>
                    Save & Continue
                    <span className="text-sm">→</span>
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
