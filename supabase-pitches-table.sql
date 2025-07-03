-- Create pitches table for storing artist pitch templates
CREATE TABLE IF NOT EXISTS pitches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by artist_id
CREATE INDEX IF NOT EXISTS idx_pitches_artist_id ON pitches(artist_id);

-- Enable Row Level Security (RLS)
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow artists to manage their own pitches
CREATE POLICY "Artists can manage their own pitches" ON pitches
  FOR ALL USING (artist_id IN (
    SELECT id FROM artist_profiles WHERE email = auth.jwt() ->> 'email'
  ));

-- Add some sample data for testing (optional)
INSERT INTO pitches (artist_id, subject, body) 
SELECT 
  ap.id,
  'Booking Inquiry: ' || ap.name,
  'Hi there! I''m ' || ap.name || ', a ' || ap.genre || ' artist based in ' || ap.city || '. I''d love to perform at your venue! You can check out my music at ' || COALESCE(ap.website, 'my website') || '. Looking forward to hearing from you!'
FROM artist_profiles ap
WHERE NOT EXISTS (SELECT 1 FROM pitches p WHERE p.artist_id = ap.id)
LIMIT 5; 