import React, { useState, useEffect } from 'react';
import { AnalyticsStats } from '../types';

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalSignups: 0,
    todaySignups: 0,
    conversionRate: 0,
    emailServiceAvailable: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Waitlist Stats</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-gray-700">Total Signups:</span>
          <span className="font-bold text-2xl text-green-600">{stats.totalSignups}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-gray-700">Today's Signups:</span>
          <span className="font-bold text-2xl text-blue-600">{stats.todaySignups}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <span className="text-gray-700">Email Service:</span>
          <span className={`font-bold ${stats.emailServiceAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {stats.emailServiceAvailable ? '✅ Active' : '❌ Offline'}
          </span>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          🔄 Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 