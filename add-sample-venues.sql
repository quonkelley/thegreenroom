-- Add comprehensive sample venue data
-- This script adds a variety of venues across different cities and genres

INSERT INTO venues (name, city, state, country, email, website, phone, capacity, genres, contact_person, booking_email, notes, status) VALUES
-- Jazz Clubs
('Blue Note', 'New York', 'NY', 'USA', 'info@bluenote.com', 'https://bluenote.com', '+1-212-475-8592', 200, ARRAY['jazz', 'blues', 'soul'], 'Sarah Johnson', 'booking@bluenote.com', 'Iconic jazz venue in Greenwich Village', 'active'),
('Village Vanguard', 'New York', 'NY', 'USA', 'info@villagevanguard.com', 'https://villagevanguard.com', '+1-212-255-4037', 123, ARRAY['jazz'], 'Max Gordon', 'booking@villagevanguard.com', 'Historic jazz club since 1935', 'active'),
('Birdland', 'New York', 'NY', 'USA', 'info@birdlandjazz.com', 'https://birdlandjazz.com', '+1-212-581-3080', 150, ARRAY['jazz', 'blues'], 'Gianni Valenti', 'booking@birdlandjazz.com', 'Jazz club in Midtown Manhattan', 'active'),
('Smalls Jazz Club', 'New York', 'NY', 'USA', 'info@smallslive.com', 'https://smallslive.com', '+1-212-252-5091', 60, ARRAY['jazz'], 'Spike Wilner', 'booking@smallslive.com', 'Intimate jazz venue in West Village', 'active'),

-- Rock Venues
('The Troubadour', 'Los Angeles', 'CA', 'USA', 'info@troubadour.com', 'https://troubadour.com', '+1-310-276-1158', 500, ARRAY['rock', 'indie', 'folk'], 'Mike Davis', 'bookings@troubadour.com', 'Historic rock venue in West Hollywood', 'active'),
('The Roxy Theatre', 'Los Angeles', 'CA', 'USA', 'info@theroxy.com', 'https://theroxy.com', '+1-310-278-9457', 500, ARRAY['rock', 'indie', 'alternative'], 'Nic Adler', 'booking@theroxy.com', 'Legendary rock venue on Sunset Strip', 'active'),
('The Whisky a Go Go', 'Los Angeles', 'CA', 'USA', 'info@whiskyagogo.com', 'https://whiskyagogo.com', '+1-310-652-4202', 500, ARRAY['rock', 'metal', 'punk'], 'Mario Maglieri', 'booking@whiskyagogo.com', 'Iconic rock venue since 1964', 'active'),
('The Echo', 'Los Angeles', 'CA', 'USA', 'info@theecho.com', 'https://theecho.com', '+1-213-413-8200', 350, ARRAY['indie', 'rock', 'electronic'], 'Mitchell Frank', 'booking@theecho.com', 'Indie rock venue in Echo Park', 'active'),

-- Coffee Shops & Small Venues
('Caffe Lena', 'Saratoga Springs', 'NY', 'USA', 'info@caffelena.org', 'https://caffelena.org', '+1-518-583-0022', 85, ARRAY['folk', 'acoustic', 'jazz'], 'Sarah Craig', 'booking@caffelena.org', 'Historic folk music venue', 'active'),
('The Bitter End', 'New York', 'NY', 'USA', 'info@bitterend.com', 'https://bitterend.com', '+1-212-673-7030', 230, ARRAY['folk', 'rock', 'jazz'], 'Paul Rizzo', 'booking@bitterend.com', 'Greenwich Village music venue since 1961', 'active'),
('Uncommon Ground', 'Chicago', 'IL', 'USA', 'info@uncommonground.com', 'https://uncommonground.com', '+1-773-929-3680', 50, ARRAY['folk', 'acoustic', 'jazz'], 'Helen Cameron', 'booking@uncommonground.com', 'Intimate coffeehouse with live music', 'active'),
('The Living Room', 'New York', 'NY', 'USA', 'info@livingroomny.com', 'https://livingroomny.com', '+1-212-533-7235', 100, ARRAY['folk', 'acoustic', 'indie'], 'Steve Rosenthal', 'booking@livingroomny.com', 'Intimate venue in Lower East Side', 'active'),

-- Restaurants & Bars
('The Basement', 'Nashville', 'TN', 'USA', 'info@thebasement.com', 'https://thebasement.com', '+1-615-254-8006', 150, ARRAY['country', 'folk', 'americana'], 'Lisa Thompson', 'bookings@thebasement.com', 'Underground venue in Nashville', 'active'),
('The Station Inn', 'Nashville', 'TN', 'USA', 'info@stationinn.com', 'https://stationinn.com', '+1-615-255-3307', 150, ARRAY['bluegrass', 'country', 'folk'], 'J.T. Gray', 'booking@stationinn.com', 'Bluegrass venue in The Gulch', 'active'),
('The 5 Spot', 'Nashville', 'TN', 'USA', 'info@the5spot.com', 'https://the5spot.com', '+1-615-650-9333', 100, ARRAY['country', 'rock', 'indie'], 'Travis Collinsworth', 'booking@the5spot.com', 'East Nashville music venue', 'active'),

-- Large Venues
('The Fillmore', 'San Francisco', 'CA', 'USA', 'info@fillmore.com', 'https://fillmore.com', '+1-415-346-6000', 1200, ARRAY['rock', 'indie', 'electronic'], 'Dawn Holliday', 'booking@fillmore.com', 'Historic venue in San Francisco', 'active'),
('The 9:30 Club', 'Washington', 'DC', 'USA', 'info@930club.com', 'https://930club.com', '+1-202-265-0930', 1200, ARRAY['rock', 'indie', 'alternative'], 'Seth Hurwitz', 'booking@930club.com', 'Premier music venue in DC', 'active'),
('The Metro', 'Chicago', 'IL', 'USA', 'info@metrochicago.com', 'https://metrochicago.com', '+1-773-549-4140', 1100, ARRAY['rock', 'indie', 'alternative'], 'Joe Shanahan', 'booking@metrochicago.com', 'Iconic venue in Wrigleyville', 'active'),

-- Electronic & Dance Venues
('Output', 'Brooklyn', 'NY', 'USA', 'info@outputclub.com', 'https://outputclub.com', '+1-718-486-3400', 400, ARRAY['electronic', 'dance', 'house'], 'Nicholas Matar', 'booking@outputclub.com', 'Electronic music venue in Williamsburg', 'active'),
('Smart Bar', 'Chicago', 'IL', 'USA', 'info@smartbarchicago.com', 'https://smartbarchicago.com', '+1-773-549-4140', 300, ARRAY['electronic', 'dance', 'house'], 'Joe Shanahan', 'booking@smartbarchicago.com', 'Underground dance venue', 'active'),

-- Folk & Americana
('Club Passim', 'Cambridge', 'MA', 'USA', 'info@passim.org', 'https://passim.org', '+1-617-492-7679', 125, ARRAY['folk', 'americana', 'acoustic'], 'Matt Smith', 'booking@passim.org', 'Historic folk music venue in Harvard Square', 'active'),
('The Ark', 'Ann Arbor', 'MI', 'USA', 'info@theark.org', 'https://theark.org', '+1-734-761-1451', 400, ARRAY['folk', 'americana', 'acoustic'], 'Marianne James', 'booking@theark.org', 'Non-profit folk music venue', 'active'),

-- Blues Venues
('Buddy Guy''s Legends', 'Chicago', 'IL', 'USA', 'info@buddyguy.com', 'https://buddyguy.com', '+1-312-427-0333', 300, ARRAY['blues', 'jazz', 'soul'], 'Buddy Guy', 'booking@buddyguy.com', 'Blues club owned by Buddy Guy', 'active'),
('Kingston Mines', 'Chicago', 'IL', 'USA', 'info@kingstonmines.com', 'https://kingstonmines.com', '+1-773-477-4646', 200, ARRAY['blues', 'jazz'], 'Linda Clifford', 'booking@kingstonmines.com', 'Chicago blues venue since 1968', 'active'),

-- Alternative & Indie
('The Bowery Ballroom', 'New York', 'NY', 'USA', 'info@boweryballroom.com', 'https://boweryballroom.com', '+1-212-533-2111', 575, ARRAY['indie', 'rock', 'alternative'], 'John Moore', 'booking@boweryballroom.com', 'Indie rock venue in Lower Manhattan', 'active'),
('Terminal 5', 'New York', 'NY', 'USA', 'info@terminal5nyc.com', 'https://terminal5nyc.com', '+1-212-582-6600', 3000, ARRAY['indie', 'rock', 'electronic'], 'John Moore', 'booking@terminal5nyc.com', 'Large venue in Hell''s Kitchen', 'active'),

-- Country & Americana
('The Bluebird Cafe', 'Nashville', 'TN', 'USA', 'info@bluebirdcafe.com', 'https://bluebirdcafe.com', '+1-615-383-1461', 90, ARRAY['country', 'folk', 'americana'], 'Erika Wollam Nichols', 'booking@bluebirdcafe.com', 'Intimate songwriter venue', 'active'),
('The Listening Room', 'Nashville', 'TN', 'USA', 'info@listeningroomcafe.com', 'https://listeningroomcafe.com', '+1-615-259-3600', 200, ARRAY['country', 'folk', 'americana'], 'Chris Blair', 'booking@listeningroomcafe.com', 'Songwriter showcase venue', 'active'),

-- Jazz & Blues (More Cities)
('The Green Mill', 'Chicago', 'IL', 'USA', 'info@greenmilljazz.com', 'https://greenmilljazz.com', '+1-773-878-5552', 120, ARRAY['jazz', 'blues'], 'Dave Jemilo', 'booking@greenmilljazz.com', 'Historic jazz club in Uptown', 'active'),
('Andy''s Jazz Club', 'Chicago', 'IL', 'USA', 'info@andysjazzclub.com', 'https://andysjazzclub.com', '+1-312-642-6805', 150, ARRAY['jazz', 'blues'], 'Andy''s Management', 'booking@andysjazzclub.com', 'Jazz club in River North', 'active'),

-- Rock & Alternative (More Cities)
('The Middle East', 'Cambridge', 'MA', 'USA', 'info@mideastclub.com', 'https://mideastclub.com', '+1-617-864-3278', 575, ARRAY['rock', 'indie', 'alternative'], 'Joseph Sater', 'booking@mideastclub.com', 'Rock venue in Cambridge', 'active'),
('The Sinclair', 'Cambridge', 'MA', 'USA', 'info@sinclaircambridge.com', 'https://sinclaircambridge.com', '+1-617-547-5200', 525, ARRAY['indie', 'rock', 'alternative'], 'The Bowery Presents', 'booking@sinclaircambridge.com', 'Modern music venue in Harvard Square', 'active'),

-- Folk & Acoustic (More Cities)
('The Cedar Cultural Center', 'Minneapolis', 'MN', 'USA', 'info@thecedar.org', 'https://thecedar.org', '+1-612-338-2674', 465, ARRAY['folk', 'world', 'acoustic'], 'Adrienne Dorn', 'booking@thecedar.org', 'Global music venue', 'active'),
('The Old Town School of Folk Music', 'Chicago', 'IL', 'USA', 'info@oldtownschool.org', 'https://oldtownschool.org', '+1-773-728-6000', 425, ARRAY['folk', 'americana', 'acoustic'], 'Bau Graves', 'booking@oldtownschool.org', 'Folk music school and venue', 'active')

ON CONFLICT (name, city) DO NOTHING; 