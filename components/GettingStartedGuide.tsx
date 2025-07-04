import { useState } from 'react';
import Link from 'next/link';

interface Tip {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  actionUrl?: string;
}

export default function GettingStartedGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const tips: Tip[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, social links, and pricing to help venues understand your style and experience.',
      icon: '👤',
      action: 'Update Profile',
      actionUrl: '/app/profile'
    },
    {
      id: 'pitch',
      title: 'Create Your First Pitch',
      description: 'Use AI to generate personalized booking pitches that highlight your unique style and experience.',
      icon: '🤖',
      action: 'Generate Pitch',
      actionUrl: '/app/pitch'
    },
    {
      id: 'outreach',
      title: 'Track Your Outreach',
      description: 'Monitor your email campaigns and responses to see what\'s working and what needs improvement.',
      icon: '📊',
      action: 'View Outreach',
      actionUrl: '/app/outreach'
    },
    {
      id: 'venues',
      title: 'Find Venues',
      description: 'Discover venues in your area that match your genre and style. Build your venue database.',
      icon: '🏢',
      action: 'Coming Soon',
    },
    {
      id: 'analytics',
      title: 'Analyze Performance',
      description: 'Track your response rates, successful pitches, and booking patterns to improve your strategy.',
      icon: '📈',
      action: 'Coming Soon',
    }
  ];

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Getting Started Guide</h2>
          <p className="text-gray-600 mt-1">Follow these steps to maximize your booking success</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.slice(0, isExpanded ? tips.length : 3).map((tip) => (
          <div key={tip.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{tip.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                {tip.actionUrl ? (
                  <Link
                    href={tip.actionUrl}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    {tip.action}
                  </Link>
                ) : (
                  <span className="inline-block bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm font-medium">
                    {tip.action}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isExpanded && (
        <div className="text-center mt-4">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Show all {tips.length} tips →
          </button>
        </div>
      )}
    </div>
  );
} 