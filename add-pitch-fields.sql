-- Add new fields to pitches table for enhanced pitch tracking
ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS venue_type TEXT,
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_city TEXT;

-- Add index for venue type lookups
CREATE INDEX IF NOT EXISTS idx_pitches_venue_type ON pitches(venue_type);

-- Add index for venue name lookups
CREATE INDEX IF NOT EXISTS idx_pitches_venue_name ON pitches(venue_name);

-- Add index for venue city lookups
CREATE INDEX IF NOT EXISTS idx_pitches_venue_city ON pitches(venue_city);

-- Create a composite index for venue searches
CREATE INDEX IF NOT EXISTS idx_pitches_venue_search ON pitches(venue_type, venue_city);

-- Update existing pitches with placeholder data if needed
UPDATE pitches 
SET 
  venue_type = 'general',
  venue_name = 'Unknown Venue',
  venue_city = 'Unknown City'
WHERE venue_type IS NULL; 