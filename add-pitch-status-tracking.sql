-- Add status tracking fields to pitches table
ALTER TABLE pitches
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived', 'scheduled')),
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS venue_email TEXT;

-- Add index for status lookups
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);

-- Add index for sent_at lookups
CREATE INDEX IF NOT EXISTS idx_pitches_sent_at ON pitches(sent_at);

-- Add index for scheduled_at lookups
CREATE INDEX IF NOT EXISTS idx_pitches_scheduled_at ON pitches(scheduled_at);

-- Update existing pitches to have draft status if not set
UPDATE pitches
SET status = 'draft'
WHERE status IS NULL;

-- Add a composite index for status and artist_id for faster queries
CREATE INDEX IF NOT EXISTS idx_pitches_artist_status ON pitches(artist_id, status);
