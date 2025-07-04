import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Mail, Send, Eye, MessageSquare,
  Target, Calendar, Users, Award, Activity, BarChart3,
  ChevronUp, ChevronDown, Minus, RefreshCw, Download
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AnalyticsData {
  profile?: {
    name: string;
    genre: string;
    city: string;
    memberSince: string;
  };
  overview: {
    totalPitches?: number;
    recentPitches?: number;
    totalCampaigns?: number;
    activeCampaigns?: number;
    totalEmails?: number;
    sentEmails?: number;
    openedEmails?: number;
    repliedEmails?: number;
    responseRate?: number;
    openRate?: number;
    positiveResponses?: number;
    negativeResponses?: number;
    successfulBookings?: number;
    bookingConversionRate?: number;
    totalRevenue?: number;
    venuesViewed?: number;
    citiesExplored?: number;
    // Public analytics fields
    totalSignups?: number;
    todaySignups?: number;
    conversionRate?: number;
    emailServiceAvailable?: boolean;
  };
  performance?: {
    dailyStats: Array<{
      date: string;
      sent: number;
      opened: number;
      replied: number;
      positive: number;
      negative: number;
      venuesViewed?: number;
    }>;
    trends: {
      sent: number[];
      opened: number[];
      replied: number[];
    };
    averages: {
      dailySent: number;
      dailyOpened: number;
      dailyReplied: number;
    };
  };
  goals?: {
    pitches: { current: number; goal: number; progress: number; status: string };
    emails: { current: number; goal: number; progress: number; status: string };
    responseRate: { current: number; goal: number; progress: number; status: string };
    bookings: { current: number; goal: number; progress: number; status: string };
  };
  recentActivity?: Array<{
    id: string;
    venue_name: string;
    subject: string;
    status: string;
    response_type?: string;
    created_at: string;
    outreach_campaigns?: { name: string };
  }>;
  timeframe?: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url = user?.id 
        ? `/api/analytics?user_id=${user.id}&timeframe=${timeframe}`
        : `/api/analytics?timeframe=${timeframe}`;
      
      const response = await fetch(url);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding/sample-analytics-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh analytics data after creating sample data
        await fetchAnalytics();
        alert('Sample analytics data created successfully!');
      } else {
        alert('Failed to create sample data: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to create sample data:', error);
      alert('Failed to create sample data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <ChevronDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600';
      case 'opened': return 'text-green-600';
      case 'replied': return 'text-purple-600';
      case 'bounced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getResponseColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Check if this is public analytics (landing page)
  const isPublicAnalytics = !user?.id || !data.profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isPublicAnalytics ? 'Platform Analytics' : 'Analytics Dashboard'}
          </h2>
          <p className="text-gray-600">
            {isPublicAnalytics 
              ? 'See how TheGreenRoom.ai is helping artists' 
              : 'Track your booking performance and insights'
            }
          </p>
        </div>
        {!isPublicAnalytics && (
          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={createSampleData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Add Sample Data
            </button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isPublicAnalytics ? (
          // Public analytics cards
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.totalSignups || 0}</p>
                  <p className="text-sm text-gray-500">Join the waitlist</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Signups</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.todaySignups || 0}</p>
                  <p className="text-sm text-gray-500">New members</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.conversionRate || 0}%</p>
                  <p className="text-sm text-gray-500">Success rate</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Service</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.overview.emailServiceAvailable ? 'Active' : 'Offline'}
                  </p>
                  <p className="text-sm text-gray-500">System status</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Mail className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          // User analytics cards
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.totalEmails || 0}</p>
                  <p className="text-sm text-gray-500">Sent: {data.overview.sentEmails || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.responseRate || 0}%</p>
                  <p className="text-sm text-gray-500">Replies: {data.overview.repliedEmails || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.activeCampaigns || 0}</p>
                  <p className="text-sm text-gray-500">Total: {data.overview.totalCampaigns || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.openRate || 0}%</p>
                  <p className="text-sm text-gray-500">Emails opened</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Eye className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.successfulBookings || 0}</p>
                  <p className="text-sm text-gray-500">{data.overview.bookingConversionRate || 0}% conversion</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${data.overview.totalRevenue || 0}</p>
                  <p className="text-sm text-gray-500">From bookings</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Venues Viewed</p>
                  <p className="text-2xl font-bold text-gray-900">{data.overview.venuesViewed || 0}</p>
                  <p className="text-sm text-gray-500">{data.overview.citiesExplored || 0} cities explored</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </motion.div>


          </>
        )}
      </div>

      {/* Tabs - Only show for user analytics */}
      {!isPublicAnalytics && data.performance && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'activity', label: 'Activity', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && data.performance && (
              <div className="space-y-6">
                {/* Email Performance Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Performance Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.performance.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [value, name === 'sent' ? 'Sent' : name === 'opened' ? 'Opened' : 'Replied']}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="sent" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="opened" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="replied" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="venuesViewed" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Response Rate Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Type Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: data.overview.positiveResponses || 0 },
                            { name: 'Negative', value: data.overview.negativeResponses || 0 },
                            { name: 'No Response', value: (data.overview.sentEmails || 0) - (data.overview.repliedEmails || 0) }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Averages</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Send className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Emails Sent</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {data.performance.averages.dailySent.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Emails Opened</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {data.performance.averages.dailyOpened.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Emails Replied</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {data.performance.averages.dailyReplied.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && data.performance && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.performance.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="replied" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && data.goals && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(data.goals).map(([key, goal]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{goal.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {goal.current} / {goal.goal} {key === 'responseRate' ? '%' : key === 'bookings' ? 'bookings' : key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && data.recentActivity && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {data.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activity.status === 'sent' ? 'bg-blue-100' :
                          activity.status === 'opened' ? 'bg-green-100' :
                          activity.status === 'replied' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Mail className={`w-4 h-4 ${
                            activity.status === 'sent' ? 'text-blue-600' :
                            activity.status === 'opened' ? 'text-green-600' :
                            activity.status === 'replied' ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.venue_name}</p>
                          <p className="text-sm text-gray-600">{activity.subject}</p>
                          {activity.outreach_campaigns && (
                            <p className="text-xs text-gray-500">Campaign: {activity.outreach_campaigns.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </p>
                        {activity.response_type && (
                          <p className={`text-xs ${getResponseColor(activity.response_type)}`}>
                            {activity.response_type}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 