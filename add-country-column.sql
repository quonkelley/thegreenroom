-- Add missing country column to artist_profiles table
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';

-- Update existing records to have a default country value
UPDATE artist_profiles 
SET country = 'USA' 
WHERE country IS NULL;

-- Make sure the column is not null for future inserts
ALTER TABLE artist_profiles 
ALTER COLUMN country SET NOT NULL; 