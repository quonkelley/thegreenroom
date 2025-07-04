import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AppNavigation from '../../components/AppNavigation';
import { UserAnalytics } from '../../types';
import { trackPageView, trackButtonClick } from '../../components/AnalyticsTracker';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  BarChart3,
  Activity,
  Award,
  Zap
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
      trackPageView('/app/analytics', { timeframe });
    }
  }, [user, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?user_id=${user?.id}&timeframe=${timeframe}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analytics) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <AppNavigation />
          <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
              <p className="text-gray-600">Unable to load analytics data.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'opened': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'replied': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track your booking performance and outreach effectiveness
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => {
                  fetchAnalytics();
                  trackButtonClick('refresh_analytics', { timeframe });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{analytics.profile.name}</h2>
                <p className="text-gray-600">{analytics.profile.genre} • {analytics.profile.city}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(analytics.profile.memberSince)}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{analytics.overview.responseRate}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pitches</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalPitches}</p>
                      <p className="text-sm text-green-600">+{analytics.overview.recentPitches} this period</p>
                    </div>
                    <div className="text-blue-600 text-2xl">📝</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.sentEmails}</p>
                      <p className="text-sm text-blue-600">{analytics.overview.openedEmails} opened</p>
                    </div>
                    <div className="text-purple-600 text-2xl">📧</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.responseRate}%</p>
                      <p className="text-sm text-green-600">{analytics.overview.repliedEmails} responses</p>
                    </div>
                    <div className="text-green-600 text-2xl">💬</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeCampaigns}</p>
                      <p className="text-sm text-orange-600">{analytics.overview.totalCampaigns} total</p>
                    </div>
                    <div className="text-orange-600 text-2xl">📊</div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Email Performance Over Time</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {analytics.performance.dailyStats.slice(-14).map((day, index) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-sm relative">
                        <div 
                          className="bg-blue-500 rounded-t-sm transition-all duration-300"
                          style={{ height: `${Math.max((day.sent / Math.max(...analytics.performance.dailyStats.map(d => d.sent))) * 100, 5)}%` }}
                        />
                        <div 
                          className="bg-green-500 absolute bottom-0 rounded-t-sm transition-all duration-300"
                          style={{ 
                            height: `${Math.max((day.replied / Math.max(...analytics.performance.dailyStats.map(d => d.replied))) * 100, 5)}%`,
                            width: '100%'
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Replied</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Daily Averages</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emails Sent</span>
                      <span className="font-semibold">{analytics.performance.averages.dailySent.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emails Opened</span>
                      <span className="font-semibold">{analytics.performance.averages.dailyOpened.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emails Replied</span>
                      <span className="font-semibold">{analytics.performance.averages.dailyReplied.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Response Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Positive</span>
                      <span className="font-semibold text-green-600">{analytics.overview.positiveResponses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Negative</span>
                      <span className="font-semibold text-red-600">{analytics.overview.negativeResponses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Neutral</span>
                      <span className="font-semibold text-yellow-600">
                        {analytics.overview.repliedEmails - analytics.overview.positiveResponses - analytics.overview.negativeResponses}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Campaign Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active</span>
                      <span className="font-semibold text-green-600">{analytics.overview.activeCampaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold text-blue-600">
                        {analytics.overview.totalCampaigns - analytics.overview.activeCampaigns}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-semibold">{analytics.overview.totalCampaigns}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Performance Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                <div className="h-64 flex items-end justify-between gap-1">
                  {analytics.performance.trends.sent.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-sm relative">
                        <div 
                          className="bg-blue-500 rounded-t-sm transition-all duration-300"
                          style={{ height: `${Math.max((value / Math.max(...analytics.performance.trends.sent)) * 100, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">
                  Email volume over the last {timeframe === '7d' ? '7' : timeframe === '30d' ? '30' : '90'} days
                </div>
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analytics.goals).map(([key, goal]) => (
                  <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      {goal.status === 'completed' ? (
                        <Award className="w-6 h-6 text-green-600" />
                      ) : (
                        <Target className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{goal.current} / {goal.goal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg font-bold ${
                        goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {goal.progress.toFixed(0)}%
                      </span>
                      <p className="text-sm text-gray-500">
                        {goal.status === 'completed' ? 'Goal achieved!' : 'Keep going!'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              <div className="divide-y">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            Email to {activity.venue_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.outreach_campaigns?.name && `Campaign: ${activity.outreach_campaigns.name}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.sent_at ? formatDate(activity.sent_at) : 'Draft'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.response_type && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResponseTypeColor(activity.response_type)}`}>
                            {activity.response_type}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 