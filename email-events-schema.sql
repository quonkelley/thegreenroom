-- Email Events Tracking Table
CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event VARCHAR(50) NOT NULL, -- 'email_sent', 'email_opened', 'email_replied', 'email_bounced'
  email_id VARCHAR(255), -- Resend message ID
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  venue_name VARCHAR(255),
  venue_email VARCHAR(255),
  subject TEXT,
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'opened', 'replied', 'bounced'
  response_type VARCHAR(50), -- 'positive', 'negative', 'neutral'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_events_artist_id ON email_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event ON email_events(event);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);

-- Venue Discovery Analytics Table
CREATE TABLE IF NOT EXISTS venue_discovery_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'venue_view', 'venue_search', 'venue_filter', 'pitch_created'
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  venue_name VARCHAR(255),
  venue_city VARCHAR(255),
  search_terms TEXT,
  filters JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for venue discovery analytics
CREATE INDEX IF NOT EXISTS idx_venue_discovery_artist_id ON venue_discovery_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_venue_discovery_event_type ON venue_discovery_events(event_type);
CREATE INDEX IF NOT EXISTS idx_venue_discovery_created_at ON venue_discovery_events(created_at);

-- Pitch Success Metrics Table
CREATE TABLE IF NOT EXISTS pitch_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  venue_name VARCHAR(255),
  venue_city VARCHAR(255),
  venue_type VARCHAR(50),
  email_sent BOOLEAN DEFAULT FALSE,
  email_opened BOOLEAN DEFAULT FALSE,
  email_replied BOOLEAN DEFAULT FALSE,
  response_type VARCHAR(50), -- 'positive', 'negative', 'neutral'
  booking_result VARCHAR(50), -- 'booked', 'not_booked', 'pending'
  booking_date DATE,
  revenue DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pitch metrics
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_artist_id ON pitch_metrics(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_pitch_id ON pitch_metrics(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_metrics_booking_result ON pitch_metrics(booking_result);

-- Analytics Views for easier querying
CREATE OR REPLACE VIEW email_performance_summary AS
SELECT 
  artist_id,
  COUNT(*) as total_emails,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as emails_sent,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as emails_opened,
  COUNT(CASE WHEN status = 'replied' THEN 1 END) as emails_replied,
  COUNT(CASE WHEN response_type = 'positive' THEN 1 END) as positive_responses,
  COUNT(CASE WHEN response_type = 'negative' THEN 1 END) as negative_responses,
  ROUND(
    (COUNT(CASE WHEN status = 'replied' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
  ) as response_rate,
  ROUND(
    (COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
  ) as open_rate
FROM email_events 
WHERE event = 'email_sent'
GROUP BY artist_id;

-- Venue Discovery Summary View
CREATE OR REPLACE VIEW venue_discovery_summary AS
SELECT 
  artist_id,
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_type = 'venue_view' THEN 1 END) as venues_viewed,
  COUNT(CASE WHEN event_type = 'venue_search' THEN 1 END) as searches_performed,
  COUNT(CASE WHEN event_type = 'pitch_created' THEN 1 END) as pitches_created,
  COUNT(DISTINCT venue_id) as unique_venues_viewed,
  COUNT(DISTINCT venue_city) as cities_explored
FROM venue_discovery_events
GROUP BY artist_id;

-- Pitch Success Summary View
CREATE OR REPLACE VIEW pitch_success_summary AS
SELECT 
  artist_id,
  COUNT(*) as total_pitches,
  COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
  COUNT(CASE WHEN email_opened THEN 1 END) as emails_opened,
  COUNT(CASE WHEN email_replied THEN 1 END) as emails_replied,
  COUNT(CASE WHEN booking_result = 'booked' THEN 1 END) as successful_bookings,
  COUNT(CASE WHEN booking_result = 'pending' THEN 1 END) as pending_bookings,
  ROUND(
    (COUNT(CASE WHEN booking_result = 'booked' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN email_sent THEN 1 END), 0)) * 100, 2
  ) as booking_conversion_rate,
  SUM(revenue) as total_revenue
FROM pitch_metrics
GROUP BY artist_id;

-- Function to get comprehensive analytics for an artist
CREATE OR REPLACE FUNCTION get_artist_analytics(artist_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP := NOW() - (days_back || ' days')::INTERVAL;
BEGIN
  SELECT json_build_object(
    'email_performance', (
      SELECT json_build_object(
        'total_emails', total_emails,
        'emails_sent', emails_sent,
        'emails_opened', emails_opened,
        'emails_replied', emails_replied,
        'positive_responses', positive_responses,
        'negative_responses', negative_responses,
        'response_rate', response_rate,
        'open_rate', open_rate
      )
      FROM email_performance_summary 
      WHERE artist_id = artist_uuid
    ),
    'venue_discovery', (
      SELECT json_build_object(
        'total_events', total_events,
        'venues_viewed', venues_viewed,
        'searches_performed', searches_performed,
        'pitches_created', pitches_created,
        'unique_venues_viewed', unique_venues_viewed,
        'cities_explored', cities_explored
      )
      FROM venue_discovery_summary 
      WHERE artist_id = artist_uuid
    ),
    'pitch_success', (
      SELECT json_build_object(
        'total_pitches', total_pitches,
        'emails_sent', emails_sent,
        'emails_opened', emails_opened,
        'emails_replied', emails_replied,
        'successful_bookings', successful_bookings,
        'pending_bookings', pending_bookings,
        'booking_conversion_rate', booking_conversion_rate,
        'total_revenue', total_revenue
      )
      FROM pitch_success_summary 
      WHERE artist_id = artist_uuid
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'event', event,
          'venue_name', venue_name,
          'subject', subject,
          'status', status,
          'created_at', created_at
        )
      )
      FROM email_events 
      WHERE artist_id = artist_uuid 
      AND created_at >= start_date
      ORDER BY created_at DESC
      LIMIT 10
    ),
    'daily_stats', (
      SELECT json_agg(
        json_build_object(
          'date', date_series.date,
          'emails_sent', COALESCE(stats.emails_sent, 0),
          'emails_opened', COALESCE(stats.emails_opened, 0),
          'emails_replied', COALESCE(stats.emails_replied, 0),
          'venues_viewed', COALESCE(venue_stats.venues_viewed, 0)
        )
      )
      FROM (
        SELECT generate_series(
          start_date::date, 
          NOW()::date, 
          '1 day'::interval
        )::date as date
      ) date_series
      LEFT JOIN (
        SELECT 
          DATE(created_at) as date,
          COUNT(CASE WHEN event = 'email_sent' THEN 1 END) as emails_sent,
          COUNT(CASE WHEN status = 'opened' THEN 1 END) as emails_opened,
          COUNT(CASE WHEN status = 'replied' THEN 1 END) as emails_replied
        FROM email_events 
        WHERE artist_id = artist_uuid 
        AND created_at >= start_date
        GROUP BY DATE(created_at)
      ) stats ON date_series.date = stats.date
      LEFT JOIN (
        SELECT 
          DATE(created_at) as date,
          COUNT(CASE WHEN event_type = 'venue_view' THEN 1 END) as venues_viewed
        FROM venue_discovery_events 
        WHERE artist_id = artist_uuid 
        AND created_at >= start_date
        GROUP BY DATE(created_at)
      ) venue_stats ON date_series.date = venue_stats.date
      ORDER BY date_series.date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 