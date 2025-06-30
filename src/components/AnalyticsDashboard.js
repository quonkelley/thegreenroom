import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalSignups: 0,
    todaySignups: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card">
        <h3>Total Signups</h3>
        <p className="text-2xl font-bold">{stats.totalSignups}</p>
      </div>
      <div className="card">
        <h3>Today's Signups</h3>
        <p className="text-2xl font-bold">{stats.todaySignups}</p>
      </div>
      <div className="card">
        <h3>Conversion Rate</h3>
        <p className="text-2xl font-bold">{stats.conversionRate}%</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 