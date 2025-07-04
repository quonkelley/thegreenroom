import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AppNavigation from '../../components/AppNavigation';

interface Pitch {
  id: string;
  artist_id: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  city: string;
  website: string;
  social_links: any;
  bio: string;
  pricing: string;
  availability: string;
}

export default function PitchGenerator() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentPitch, setCurrentPitch] = useState<Pitch | null>(null);
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user's profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Load existing pitch when profile is loaded
  useEffect(() => {
    if (profile) {
      loadPitch();
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!user?.email) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load your profile. Please complete your profile first.');
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load your profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadPitch = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/pitches?artist_id=${profile.id}`);
      const data = await response.json();
      
      if (response.ok && data.pitch) {
        setCurrentPitch(data.pitch);
        setSubject(data.pitch.subject);
        setBody(data.pitch.body);
      }
    } catch (err) {
      console.error('Failed to load pitch:', err);
      setError('Failed to load existing pitch');
    } finally {
      setLoading(false);
    }
  };

  const savePitch = async () => {
    if (!profile || !subject.trim() || !body.trim()) {
      setError('Subject and body are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: profile.id,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCurrentPitch(data.pitch);
        setSuccess('Pitch saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save pitch');
      }
    } catch (err: any) {
      console.error('Save pitch error:', err);
      setError(err.message || 'Failed to save pitch');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: profile.id,
          venue_info: {
            name: venueName || 'your venue',
            city: venueCity || 'your city'
          }
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubject(data.pitch.subject);
        setBody(data.pitch.body);
        setSuccess('AI draft generated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to generate pitch');
      }
    } catch (err: any) {
      console.error('Generate pitch error:', err);
      setError(err.message || 'Failed to generate pitch');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    // Placeholder for send logic
    setTimeout(() => {
      setSuccess('Pitch sent successfully!');
      setLoading(false);
    }, 1000);
  };

  if (profileLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Required</h2>
          <p className="text-gray-600 mb-6">You need to complete your artist profile before using the pitch generator.</p>
          <a 
            href="/app/profile" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="max-w-5xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <div className="bg-dark-800/50 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-white">Profile Summary</h2>
          <div className="mb-2 font-medium text-white">{profile.name}</div>
          <div className="mb-2 text-white/80">{profile.genre} • {profile.city}</div>
          {profile.website && (
            <div className="mb-2">
              <a href={profile.website} className="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">Website</a>
            </div>
          )}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="mb-2">
              {Object.entries(profile.social_links).map(([type, url]) => (
                <a key={type} href={url as string} className="text-purple-400 hover:text-purple-300 underline mr-2" target="_blank" rel="noopener noreferrer">{type}</a>
              ))}
            </div>
          )}
          {profile.bio && (
            <div className="mt-4 p-3 bg-dark-700/50 rounded-lg">
              <p className="text-white/80 text-sm">{profile.bio}</p>
            </div>
          )}
        </div>
        
        {/* Pitch Editor */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pitch Generator</h2>
            {currentPitch && (
              <div className="text-sm text-gray-500">
                Last saved: {new Date(currentPitch.updated_at).toLocaleDateString()}
              </div>
            )}
          </div>
          {success && <div className="mb-2 text-green-700 font-medium bg-green-50 p-2 rounded border border-green-200">{success}</div>}
          {error && <div className="mb-2 text-red-700 font-medium bg-red-50 p-2 rounded border border-red-200">{error}</div>}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Subject</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Booking Inquiry: Jane Doe"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Email Body</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={6}
              placeholder="Type your pitch or generate with AI..."
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          
          {/* Venue Information for AI Generation */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2 text-gray-700">Venue Information (for AI generation)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Venue Name</label>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Blue Note"
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  disabled={loading || saving}
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">City</label>
                <input
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. New York"
                  value={venueCity}
                  onChange={e => setVenueCity(e.target.value)}
                  disabled={loading || saving}
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateDraft}
              disabled={loading || saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate AI Draft'}
            </button>
            <button
              onClick={savePitch}
              disabled={loading || saving || !subject.trim() || !body.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Pitch'}
            </button>
            <button
              onClick={handleSend}
              disabled={loading || saving || !subject.trim() || !body.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Pitch'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 