jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: { id: 'test-user-id', email: 'test@example.com' },
            },
          },
        })
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
      signUp: jest.fn(() => Promise.resolve({ error: null })),
      signOut: jest.fn(() => Promise.resolve()),
      resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/app/profile',
    query: {},
    asPath: '/app/profile',
  }),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../lib/auth';
import ArtistProfileWizard from '../pages/app/profile';

// Mock the useAuth hook for testing
jest.mock('../lib/auth', () => ({
  ...jest.requireActual('../lib/auth'),
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { user: { id: 'test-user-id' } },
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('ArtistProfileWizard', () => {
  it('renders the first step and validates required fields', () => {
    render(<ArtistProfileWizard />, { wrapper: TestWrapper });
    expect(screen.getByText('Basic Info')).toBeInTheDocument();

    // Click the form's Save & Continue button
    fireEvent.click(screen.getByTestId('form-save-continue'));
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Genre is required/i)).toBeInTheDocument();
    expect(screen.getByText(/City is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  });
});
