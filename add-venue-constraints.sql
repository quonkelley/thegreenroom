-- Add unique constraints to venues table
-- This prevents duplicate venues and enables ON CONFLICT handling

-- Add unique constraint on venue name and city combination
ALTER TABLE venues 
ADD CONSTRAINT venues_name_city_unique UNIQUE (name, city);

-- Add unique constraint on booking email (if not null)
ALTER TABLE venues 
ADD CONSTRAINT venues_booking_email_unique UNIQUE (booking_email) 
WHERE booking_email IS NOT NULL;

-- Add unique constraint on website (if not null)
ALTER TABLE venues 
ADD CONSTRAINT venues_website_unique UNIQUE (website) 
WHERE website IS NOT NULL; 