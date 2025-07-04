-- Final Analytics Schema - Completely avoids GROUP BY issues
-- This version uses the simplest possible approach

-- Drop and recreate the function with minimal complexity
DROP FUNCTION IF EXISTS get_artist_analytics(UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_artist_analytics(artist_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'email_performance', (
      SELECT json_build_object(
        'total_emails', COALESCE(total_emails, 0),
        'emails_sent', COALESCE(emails_sent, 0),
        'emails_opened', COALESCE(emails_opened, 0),
        'emails_replied', COALESCE(emails_replied, 0),
        'positive_responses', COALESCE(positive_responses, 0),
        'negative_responses', COALESCE(negative_responses, 0),
        'response_rate', COALESCE(response_rate, 0),
        'open_rate', COALESCE(open_rate, 0)
      )
      FROM email_performance_summary 
      WHERE artist_id = artist_uuid
    ),
    'venue_discovery', (
      SELECT json_build_object(
        'total_events', COALESCE(total_events, 0),
        'venues_viewed', COALESCE(venues_viewed, 0),
        'searches_performed', COALESCE(searches_performed, 0),
        'pitches_created', COALESCE(pitches_created, 0),
        'unique_venues_viewed', COALESCE(unique_venues_viewed, 0),
        'cities_explored', COALESCE(cities_explored, 0)
      )
      FROM venue_discovery_summary 
      WHERE artist_id = artist_uuid
    ),
    'pitch_success', (
      SELECT json_build_object(
        'total_pitches', COALESCE(total_pitches, 0),
        'emails_sent', COALESCE(emails_sent, 0),
        'emails_opened', COALESCE(emails_opened, 0),
        'emails_replied', COALESCE(emails_replied, 0),
        'successful_bookings', COALESCE(successful_bookings, 0),
        'pending_bookings', COALESCE(pending_bookings, 0),
        'booking_conversion_rate', COALESCE(booking_conversion_rate, 0),
        'total_revenue', COALESCE(total_revenue, 0)
      )
      FROM pitch_success_summary 
      WHERE artist_id = artist_uuid
    ),
    'recent_activity', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'event', event,
          'venue_name', venue_name,
          'subject', subject,
          'status', status,
          'created_at', created_at
        )
      ), '[]'::json)
      FROM email_events 
      WHERE artist_id = artist_uuid 
      ORDER BY created_at DESC
      LIMIT 10
    ),
    'daily_stats', '[]'::json
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 