import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { AppNavigation } from '../../components/AppNavigation';
import { 
  Mail, 
  BarChart3, 
  User, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Create Pitch',
      description: 'Generate a new booking pitch with AI',
      href: '/app/pitch',
      icon: Mail,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      name: 'Track Outreach',
      description: 'Monitor your pitch responses and follow-ups',
      href: '/app/outreach',
      icon: BarChart3,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'Update Profile',
      description: 'Edit your artist profile and information',
      href: '/app/profile',
      icon: User,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  const stats = [
    {
      name: 'Total Pitches',
      value: '0',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Response Rate',
      value: '0%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Active Campaigns',
      value: '0',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Upcoming Follow-ups',
      value: '0',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0]}! 🎵
            </h1>
            <p className="text-gray-600 mt-2">
              Ready to book your next gig? Let's get started.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${action.color} ${action.hoverColor} transition-colors`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                      <p className="text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-green-100 mb-6">
                New to TheGreenRoom.ai? Here's how to make the most of your booking assistant:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span>Complete your artist profile with your bio, links, and pricing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span>Generate your first AI-powered booking pitch</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span>Track your outreach and manage responses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 