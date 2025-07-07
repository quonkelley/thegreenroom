import type { AppProps } from 'next/app';
import OnboardingModal from '../components/OnboardingModal';
import { AuthProvider } from '../lib/auth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <OnboardingModal />
    </AuthProvider>
  );
}
