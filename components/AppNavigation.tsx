import {
  BarChart3,
  Building,
  Home,
  LogOut,
  Mail,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

export default function AppNavigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Profile', href: '/app/profile', icon: User },
    { name: 'Venues', href: '/app/venues', icon: Building },
    { name: 'Pitch Generator', href: '/app/pitch', icon: Mail },
    { name: 'Outreach Tracker', href: '/app/outreach', icon: BarChart3 },
    { name: 'Analytics', href: '/app/analytics', icon: TrendingUp },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center'>
            <Link href='/app/dashboard' className='flex items-center space-x-3'>
              <div className='w-8 h-8 relative'>
                <Image
                  src='/logo.svg'
                  alt='TheGreenRoom.ai Logo'
                  width={32}
                  height={32}
                  className='object-contain'
                />
              </div>
              <span className='font-bold text-xl text-gray-900'>
                TheGreenRoom.ai
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-8'>
            {navigation.map(item => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className='w-4 h-4' />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className='flex items-center space-x-4'>
            <div className='hidden md:block'>
              <div className='text-sm text-gray-700'>
                Welcome, <span className='font-medium'>{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className='flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
            >
              <LogOut className='w-4 h-4' />
              <span className='hidden md:inline'>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className='md:hidden py-4 border-t border-gray-200'>
          <div className='flex flex-col space-y-2'>
            {navigation.map(item => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className='w-4 h-4' />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
