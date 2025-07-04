import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AppNavigation from '../../components/AppNavigation';
import OnboardingModal from '../../components/OnboardingModal';
import GettingStartedGuide from '../../components/GettingStartedGuide';
import { supabase } from '../../lib/supabaseClient';
import { ArtistProfile } from '../../types';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pitchesGenerated: 0,
    campaignsCreated: 0,
    emailsSent: 0,
    responsesReceived: 0,
  });

  useEffect(() => {
    if (user?.email) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.email) return;
    
    try {
      // Get profile first to get artist_id
      const { data: profileData } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (profileData) {
        // Get pitch count
        const { count: pitchCount } = await supabase
          .from('pitches')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', profileData.id);

        // Get campaign count
        const { count: campaignCount } = await supabase
          .from('outreach_campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', profileData.id);

        // Get email stats
        const { data: emailStats } = await supabase
          .rpc('get_outreach_stats', { artist_uuid: profileData.id });

        setStats({
          pitchesGenerated: pitchCount || 0,
          campaignsCreated: campaignCount || 0,
          emailsSent: emailStats?.[0]?.sent_emails || 0,
          responsesReceived: emailStats?.[0]?.replied_emails || 0,
        });
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <AppNavigation />
          <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to TheGreenRoom.ai</h1>
              <p className="text-gray-600 mb-8">Complete your artist profile to get started with AI-powered booking</p>
              <Link 
                href="/app/profile"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Complete Your Profile
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <OnboardingModal />
        <div className="max-w-6xl mx-auto py-12 px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {profile.name}! 👋</h1>
            <p className="text-gray-600">Ready to book your next gig? Here's what's happening with your profile.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pitches Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pitchesGenerated}</p>
                </div>
                <div className="text-green-600 text-2xl">📝</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Campaigns Created</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.campaignsCreated}</p>
                </div>
                <div className="text-blue-600 text-2xl">📊</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
                </div>
                <div className="text-purple-600 text-2xl">📧</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.responsesReceived}</p>
                </div>
                <div className="text-orange-600 text-2xl">💬</div>
              </div>
            </div>
          </div>

          {/* Getting Started Guide for New Users */}
          {stats.pitchesGenerated === 0 && (
            <div className="lg:col-span-3 mb-8">
              <GettingStartedGuide />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Genre</p>
                    <p className="text-gray-900">{profile.genre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900">{profile.city}{profile.state && `, ${profile.state}`}</p>
                  </div>
                  {profile.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Website</p>
                      <a href={profile.website} className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </div>
                  )}
                  {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Social Links</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(profile.social_links).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3">
                    <Link 
                      href="/app/profile"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Edit Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/app/pitch"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🤖</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700">Generate Pitch</h3>
                        <p className="text-sm text-gray-600">Create AI-powered booking pitches</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/app/outreach"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Outreach Tracker</h3>
                        <p className="text-sm text-gray-600">Track your email campaigns</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/app/profile"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">Update Profile</h3>
                        <p className="text-sm text-gray-600">Keep your information current</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/app/analytics"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📈</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">Analytics</h3>
                        <p className="text-sm text-gray-600">Track your performance</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg p-6 shadow-sm border mt-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                {stats.pitchesGenerated === 0 && stats.emailsSent === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎵</div>
                    <p className="text-gray-600 mb-4">No activity yet. Let's get you started!</p>
                    <div className="space-y-3">
                      <button
                        onClick={async () => {
                          if (!user?.email) return;
                          const { data: profile } = await supabase
                            .from('artist_profiles')
                            .select('id')
                            .eq('email', user.email)
                            .single();
                          if (profile) {
                            const response = await fetch('/api/onboarding/sample-data', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ artist_id: profile.id, email: user.email })
                            });
                            if (response.ok) {
                              window.location.reload();
                            }
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors mr-3"
                      >
                        Get Sample Data
                      </button>
                      <Link 
                        href="/app/pitch"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Generate Pitch
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.pitchesGenerated > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600">📝</div>
                        <div>
                          <p className="font-medium text-gray-900">Generated {stats.pitchesGenerated} pitch{stats.pitchesGenerated !== 1 ? 'es' : ''}</p>
                          <p className="text-sm text-gray-600">AI-powered booking pitches created</p>
                        </div>
                      </div>
                    )}
                    {stats.emailsSent > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600">📧</div>
                        <div>
                          <p className="font-medium text-gray-900">Sent {stats.emailsSent} email{stats.emailsSent !== 1 ? 's' : ''}</p>
                          <p className="text-sm text-gray-600">Outreach emails delivered to venues</p>
                        </div>
                      </div>
                    )}
                    {stats.responsesReceived > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="text-orange-600">💬</div>
                        <div>
                          <p className="font-medium text-gray-900">Received {stats.responsesReceived} response{stats.responsesReceived !== 1 ? 's' : ''}</p>
                          <p className="text-sm text-gray-600">Venue responses to your outreach</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 