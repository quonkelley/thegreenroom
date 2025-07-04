-- Add unique constraint to venues table
-- This prevents duplicate venues and enables ON CONFLICT handling

-- Add unique constraint on venue name and city combination
-- This is the main constraint needed for the sample venues script
ALTER TABLE venues 
ADD CONSTRAINT venues_name_city_unique UNIQUE (name, city); 