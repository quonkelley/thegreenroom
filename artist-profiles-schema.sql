-- Artist Profiles Table Schema
-- This table stores artist profile information

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'USA',
  website TEXT,
  pricing TEXT,
  availability TEXT,
  bio TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  press_kit_url TEXT,
  social_links JSONB DEFAULT '{}',
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_profiles_email ON artist_profiles(email);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_city ON artist_profiles(city);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_genre ON artist_profiles(genre);

-- Enable Row Level Security (RLS)
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to manage their own profiles
CREATE POLICY "Users can view their own profile" ON artist_profiles
  FOR SELECT USING (auth.uid()::text = user_id::text OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own profile" ON artist_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own profile" ON artist_profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text OR email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own profile" ON artist_profiles
  FOR DELETE USING (auth.uid()::text = user_id::text OR email = auth.jwt() ->> 'email');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_artist_profiles_updated_at 
    BEFORE UPDATE ON artist_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 