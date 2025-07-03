import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { supabase } from '../../lib/supabaseClient';

const steps = [
  'Basic Info',
  'Links & Media',
  'Pricing & Availability',
];

const LOCAL_STORAGE_KEY = 'artist_profile_draft';

export default function ArtistProfileWizard() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    genre: '',
    city: '',
    website: '',
    socials: [{ type: '', url: '' }],
    media: null,
    pricing: '',
    availability: '',
    bio: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      setForm(JSON.parse(draft));
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
    setSuccess('Draft saved!');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Basic validation for required fields
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 0) {
      if (!form.name) newErrors.name = 'Name is required';
      if (!form.genre) newErrors.genre = 'Genre is required';
      if (!form.city) newErrors.city = 'City is required';
      if (!form.email) newErrors.email = 'Email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Submit to Supabase
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError('');
    setSuccess('');
    if (!validateStep()) return;
    setLoading(true);
    try {
      // Insert or update profile (for now, just insert)
      const { data, error } = await supabase.from('artist_profiles').insert([
        {
          name: form.name,
          genre: form.genre,
          city: form.city,
          website: form.website,
          pricing: form.pricing,
          availability: form.availability,
          bio: form.bio,
          email: form.email,
          social_links: form.socials,
          profile_complete: true,
        },
      ]);
      if (error) throw error;
      setSuccess('Profile saved!');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="font-bold text-lg text-gray-800">TheGreenRoom.ai</div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={saveDraft}
              disabled={loading}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={step === steps.length - 1 ? handleSubmit : nextStep}
              disabled={loading}
            >
              {step === steps.length - 1 ? (loading ? 'Saving...' : 'Complete Profile') : 'Save & Continue'}
            </button>
          </div>
        </div>
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-4">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${i === step ? 'bg-green-600' : 'bg-gray-400'}`}></div>
              <span className={`text-sm ${i === step ? 'font-bold text-green-600' : 'text-gray-600'}`}>{label}</span>
              {i < steps.length - 1 && <span className="text-gray-400">•</span>}
            </div>
          ))}
        </div>
        {/* Success/Error Messages */}
        {success && <div className="mb-4 text-green-700 font-medium bg-green-50 p-3 rounded border border-green-200">{success}</div>}
        {submitError && <div className="mb-4 text-red-700 font-medium bg-red-50 p-3 rounded border border-red-200">{submitError}</div>}
        {/* Step Content */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.name && <div className="text-red-600 text-sm mt-1 font-medium">{errors.name}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Primary Genre</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Jazz, Rock"
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.genre && <div className="text-red-600 text-sm mt-1 font-medium">{errors.genre}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">City, State</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. New York, NY"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.city && <div className="text-red-600 text-sm mt-1 font-medium">{errors.city}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Email</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && <div className="text-red-600 text-sm mt-1 font-medium">{errors.email}</div>}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Website or EPK URL</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Social Links</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Instagram, Spotify, TikTok..."
                  name="socials"
                  value={form.socials[0]?.url || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, socials: [{ type: '', url: e.target.value }] }))}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Upload Sample Audio/Video</label>
                <input type="file" className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900" disabled={loading} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Pricing Range</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="$500-$1000"
                  name="pricing"
                  value={form.pricing}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Availability</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Weekends, Fridays"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Short Bio</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Tell us about yourself..."
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div className="flex justify-between mt-8">
            <button type="button" className="text-gray-600 hover:text-gray-800 font-medium" onClick={prevStep} disabled={step === 0 || loading}>
              Back
            </button>
            <button
              type={step === steps.length - 1 ? 'submit' : 'button'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={step === steps.length - 1 ? undefined : nextStep}
              disabled={loading}
              data-testid="form-save-continue"
            >
              {step === steps.length - 1 ? (loading ? 'Saving...' : 'Complete Profile') : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
} 