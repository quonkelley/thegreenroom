// User and Authentication Types
export interface User {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

// Artist Profile Types
export interface ArtistProfile {
  id: string;
  user_id: string;
  name: string;
  genre: string;
  city: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  pricing?: string;
  availability?: string;
  social_links?: Record<string, string>;
  press_kit_url?: string;
  sample_tracks?: string[];
  created_at: string;
  updated_at: string;
}

export interface ArtistProfileFormData {
  name: string;
  genre: string;
  city: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  pricing?: string;
  availability?: string;
  social_links?: Record<string, string>;
  press_kit_url?: string;
  sample_tracks?: string[];
}

// Pitch Types
export interface Pitch {
  id: string;
  artist_id: string;
  venue_name: string;
  venue_city: string;
  venue_email?: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'archived';
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PitchFormData {
  venue_name: string;
  venue_city: string;
  venue_email?: string;
  subject: string;
  body: string;
}

export interface GeneratedPitch {
  subject: string;
  body: string;
}

// Venue Information Types
export interface VenueInfo {
  name: string;
  city: string;
  email?: string;
  website?: string;
  capacity?: number;
  genres?: string[];
}

// Email and Subscription Types
export interface EmailSignupResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface EmailSignupProps {
  className?: string;
  onSuccess?: (result: EmailSignupResult) => void;
  onError?: (error: string) => void;
}

// Analytics Types
export interface AnalyticsStats {
  totalSignups: number;
  todaySignups: number;
  conversionRate: number;
  emailServiceAvailable: boolean;
}

// Enhanced Analytics Types
export interface UserAnalytics {
  profile: {
    name: string;
    genre: string;
    city: string;
    memberSince: string;
  };
  overview: {
    totalPitches: number;
    recentPitches: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalEmails: number;
    sentEmails: number;
    openedEmails: number;
    repliedEmails: number;
    responseRate: number;
    positiveResponses: number;
    negativeResponses: number;
  };
  performance: {
    dailyStats: DailyStats[];
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
  goals: {
    pitches: GoalProgress;
    emails: GoalProgress;
    responseRate: GoalProgress;
    bookings: GoalProgress;
  };
  recentActivity: OutreachEmail[];
  timeframe: string;
}

export interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  replied: number;
  positive: number;
  negative: number;
}

export interface GoalProgress {
  current: number;
  goal: number;
  progress: number;
  status: 'completed' | 'in_progress';
}

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  [key: string]: any;
}

// Outreach Log Types
export interface OutreachLog {
  id: string;
  artist_id: string;
  venue_name: string;
  venue_email?: string;
  pitch_id?: string;
  status: 'sent' | 'opened' | 'replied' | 'booked' | 'declined';
  sent_at: string;
  opened_at?: string;
  replied_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props Types
export interface FloatingButtonsProps {
  onTestConnection: () => void;
  showScrollTop: boolean;
  onScrollToTop: () => void;
}

export interface FloatingElementsProps {
  mousePosition: { x: number; y: number };
}

export interface ProgressBarProps {
  scaleX: any;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Environment Variables Type
export interface EnvironmentVariables {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  OPENAI_API_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

// Outreach Tracker Types
export interface OutreachCampaign {
  id: string;
  artist_id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface OutreachEmail {
  id: string;
  campaign_id?: string;
  artist_id: string;
  venue_name: string;
  venue_email?: string;
  venue_city?: string;
  venue_website?: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  sent_at?: string;
  opened_at?: string;
  replied_at?: string;
  response_content?: string;
  response_type?: 'positive' | 'negative' | 'neutral' | 'no_response';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachFollowup {
  id: string;
  email_id: string;
  artist_id: string;
  type: 'reminder' | 'follow_up' | 'thank_you';
  scheduled_date: string;
  completed_at?: string;
  action_taken?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  email?: string;
  website?: string;
  phone?: string;
  capacity?: number;
  genres?: string[];
  contact_person?: string;
  booking_email?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'verified';
  created_at: string;
  updated_at: string;
  venue_type?: string;
}

export interface OutreachStats {
  total_emails: number;
  sent_emails: number;
  opened_emails: number;
  replied_emails: number;
  response_rate: number;
  positive_responses: number;
  negative_responses: number;
} 