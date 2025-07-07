import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AppNavigation from '../../components/AppNavigation';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

export default function AnalyticsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <AppNavigation />
        <div className='max-w-7xl mx-auto py-8 px-4'>
          <AnalyticsDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}
