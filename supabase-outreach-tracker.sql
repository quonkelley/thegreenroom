-- Outreach Tracker Tables
-- This tracks all pitch emails sent, responses received, and follow-up activities

-- Outreach campaigns (groups of pitches sent to venues)
CREATE TABLE outreach_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual outreach emails sent to venues
CREATE TABLE outreach_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  venue_name TEXT NOT NULL,
  venue_email TEXT,
  venue_city TEXT,
  venue_website TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'opened', 'replied', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  response_content TEXT,
  response_type TEXT CHECK (response_type IN ('positive', 'negative', 'neutral', 'no_response')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-up reminders and actions
CREATE TABLE outreach_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID REFERENCES outreach_emails(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'follow_up', 'thank_you')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue database for tracking venue information
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'USA',
  email TEXT,
  website TEXT,
  phone TEXT,
  capacity INTEGER,
  genres TEXT[], -- Array of accepted genres
  contact_person TEXT,
  booking_email TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_outreach_emails_artist_id ON outreach_emails(artist_id);
CREATE INDEX idx_outreach_emails_campaign_id ON outreach_emails(campaign_id);
CREATE INDEX idx_outreach_emails_status ON outreach_emails(status);
CREATE INDEX idx_outreach_emails_sent_at ON outreach_emails(sent_at);
CREATE INDEX idx_outreach_followups_email_id ON outreach_followups(email_id);
CREATE INDEX idx_outreach_followups_scheduled_date ON outreach_followups(scheduled_date);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_genres ON venues USING GIN(genres);

-- Row Level Security (RLS) Policies
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Campaign policies
CREATE POLICY "Users can view their own campaigns" ON outreach_campaigns
  FOR SELECT USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can insert their own campaigns" ON outreach_campaigns
  FOR INSERT WITH CHECK (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can update their own campaigns" ON outreach_campaigns
  FOR UPDATE USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can delete their own campaigns" ON outreach_campaigns
  FOR DELETE USING (auth.uid()::text = artist_id::text);

-- Email policies
CREATE POLICY "Users can view their own emails" ON outreach_emails
  FOR SELECT USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can insert their own emails" ON outreach_emails
  FOR INSERT WITH CHECK (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can update their own emails" ON outreach_emails
  FOR UPDATE USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can delete their own emails" ON outreach_emails
  FOR DELETE USING (auth.uid()::text = artist_id::text);

-- Follow-up policies
CREATE POLICY "Users can view their own followups" ON outreach_followups
  FOR SELECT USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can insert their own followups" ON outreach_followups
  FOR INSERT WITH CHECK (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can update their own followups" ON outreach_followups
  FOR UPDATE USING (auth.uid()::text = artist_id::text);

CREATE POLICY "Users can delete their own followups" ON outreach_followups
  FOR DELETE USING (auth.uid()::text = artist_id::text);

-- Venue policies (read-only for now, can be expanded later)
CREATE POLICY "Users can view venues" ON venues
  FOR SELECT USING (true);

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_outreach_stats(artist_uuid UUID)
RETURNS TABLE (
  total_emails INTEGER,
  sent_emails INTEGER,
  opened_emails INTEGER,
  replied_emails INTEGER,
  response_rate DECIMAL,
  positive_responses INTEGER,
  negative_responses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_emails,
    COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'replied') THEN 1 END)::INTEGER as sent_emails,
    COUNT(CASE WHEN status = 'opened' OR status = 'replied' THEN 1 END)::INTEGER as opened_emails,
    COUNT(CASE WHEN status = 'replied' THEN 1 END)::INTEGER as replied_emails,
    CASE 
      WHEN COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'replied') THEN 1 END) > 0 
      THEN ROUND((COUNT(CASE WHEN status = 'replied' THEN 1 END)::DECIMAL / COUNT(CASE WHEN status IN ('sent', 'delivered', 'opened', 'replied') THEN 1 END)::DECIMAL) * 100, 2)
      ELSE 0::DECIMAL
    END as response_rate,
    COUNT(CASE WHEN response_type = 'positive' THEN 1 END)::INTEGER as positive_responses,
    COUNT(CASE WHEN response_type = 'negative' THEN 1 END)::INTEGER as negative_responses
  FROM outreach_emails 
  WHERE artist_id = artist_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing
INSERT INTO venues (name, city, state, email, website, capacity, genres) VALUES
('Blue Note', 'New York', 'NY', 'booking@bluenote.com', 'https://bluenote.com', 200, ARRAY['jazz', 'blues', 'soul']),
('The Troubadour', 'Los Angeles', 'CA', 'info@troubadour.com', 'https://troubadour.com', 500, ARRAY['rock', 'indie', 'folk']),
('The Basement', 'Nashville', 'TN', 'bookings@thebasement.com', 'https://thebasement.com', 150, ARRAY['country', 'folk', 'americana']),
('The Fillmore', 'San Francisco', 'CA', 'booking@fillmore.com', 'https://fillmore.com', 1200, ARRAY['rock', 'indie', 'electronic']),
('The 9:30 Club', 'Washington', 'DC', 'info@930club.com', 'https://930club.com', 1200, ARRAY['rock', 'indie', 'alternative']); 