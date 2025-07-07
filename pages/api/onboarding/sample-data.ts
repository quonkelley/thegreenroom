import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist_id, email } = req.body;

    if (!artist_id || !email) {
      return res
        .status(400)
        .json({ error: 'Artist ID and email are required' });
    }

    // Sample pitch templates
    const samplePitches = [
      {
        artist_id,
        subject: 'Booking Inquiry: Jazz Trio Available for Your Venue',
        body: `Hi there!

I'm reaching out about potential booking opportunities at your venue. I'm a jazz pianist leading a trio that specializes in smooth jazz and classic standards.

We've been performing together for 3 years and have a strong following in the local jazz scene. Our set includes both original compositions and reimagined classics that appeal to a sophisticated audience.

We're available for:
- Evening performances (7-11 PM)
- Private events and corporate functions
- Weekend brunches
- Special jazz nights

Our rate is $800-1200 depending on the event type and duration. We can provide our own PA system if needed.

You can check out our music at [your website] and see some recent performances on our Instagram.

Would love to discuss potential dates and see if we'd be a good fit for your venue!

Best regards,
[Your Name]`,
      },
      {
        artist_id,
        subject: 'Rock Band Looking for Weekend Gigs',
        body: `Hello!

My band and I are looking for weekend performance opportunities at your venue. We're a 4-piece rock band that covers everything from classic rock to modern indie hits.

We've been playing together for 2 years and have built a solid local following. Our energetic performances are perfect for venues looking to bring in a younger crowd on weekends.

What we offer:
- High-energy 2-3 hour sets
- Mix of covers and original songs
- Professional sound and lighting
- Strong social media presence to promote events

Our rate is $600-900 for a full evening. We bring our own equipment and can work with your existing setup.

Check out our latest videos on YouTube and our music on Spotify to get a feel for our sound.

Available for Friday and Saturday nights. Would love to chat about potential bookings!

Thanks,
[Your Name]`,
      },
      {
        artist_id,
        subject: 'Acoustic Solo Artist - Perfect for Intimate Venues',
        body: `Hi!

I'm a singer-songwriter looking for intimate performance opportunities at your venue. My acoustic style is perfect for creating a relaxed, sophisticated atmosphere.

I perform original songs and carefully selected covers that work well in smaller, more intimate settings. My music ranges from folk to soft rock with meaningful lyrics that connect with audiences.

Perfect for:
- Wine bars and coffee shops
- Restaurant background music
- Private events and weddings
- Sunday afternoon performances

My rate is $200-400 for 2-3 hours, depending on the venue and event type. I provide my own acoustic setup.

You can hear my music on Spotify and see some live performances on my Instagram. I also have a demo EP available.

Would love to discuss how I could enhance the atmosphere at your venue!

Best,
[Your Name]`,
      },
    ];

    // Sample outreach campaign
    const sampleCampaign = {
      artist_id,
      name: 'Local Venue Outreach',
      description: 'Initial outreach to local venues in my area',
      status: 'active',
    };

    // Sample venues for outreach
    const sampleVenues = [
      {
        name: 'The Blue Note',
        city: 'New York',
        state: 'NY',
        email: 'booking@bluenote.com',
        website: 'https://bluenote.com',
        capacity: 200,
        genres: ['jazz', 'blues', 'soul'],
        contact_person: 'Sarah Johnson',
        booking_email: 'booking@bluenote.com',
      },
      {
        name: 'The Troubadour',
        city: 'Los Angeles',
        state: 'CA',
        email: 'info@troubadour.com',
        website: 'https://troubadour.com',
        capacity: 500,
        genres: ['rock', 'indie', 'folk'],
        contact_person: 'Mike Davis',
        booking_email: 'bookings@troubadour.com',
      },
      {
        name: 'The Basement',
        city: 'Nashville',
        state: 'TN',
        email: 'bookings@thebasement.com',
        website: 'https://thebasement.com',
        capacity: 150,
        genres: ['country', 'folk', 'americana'],
        contact_person: 'Lisa Thompson',
        booking_email: 'bookings@thebasement.com',
      },
    ];

    // Insert sample pitches
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .insert(samplePitches)
      .select();

    if (pitchesError) {
      console.error('Error creating sample pitches:', pitchesError);
      return res.status(500).json({ error: 'Failed to create sample pitches' });
    }

    // Insert sample campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('outreach_campaigns')
      .insert([sampleCampaign])
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating sample campaign:', campaignError);
      return res
        .status(500)
        .json({ error: 'Failed to create sample campaign' });
    }

    // Insert sample venues (if they don't exist)
    for (const venue of sampleVenues) {
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('name', venue.name)
        .eq('city', venue.city)
        .maybeSingle();

      if (!existingVenue) {
        await supabase.from('venues').insert([venue]);
      }
    }

    // Create sample outreach emails
    const sampleEmails = [
      {
        campaign_id: campaign.id,
        artist_id,
        venue_name: 'The Blue Note',
        venue_email: 'booking@bluenote.com',
        venue_city: 'New York',
        venue_website: 'https://bluenote.com',
        subject: 'Booking Inquiry: Jazz Trio Available for Your Venue',
        body: samplePitches[0]?.body || '',
        status: 'draft',
        notes: 'Sample email - ready to customize and send',
      },
      {
        campaign_id: campaign.id,
        artist_id,
        venue_name: 'The Troubadour',
        venue_email: 'bookings@troubadour.com',
        venue_city: 'Los Angeles',
        venue_website: 'https://troubadour.com',
        subject: 'Rock Band Looking for Weekend Gigs',
        body: samplePitches[1]?.body || '',
        status: 'draft',
        notes: 'Sample email - ready to customize and send',
      },
    ];

    const { data: emails, error: emailsError } = await supabase
      .from('outreach_emails')
      .insert(sampleEmails)
      .select();

    if (emailsError) {
      console.error('Error creating sample emails:', emailsError);
      return res.status(500).json({ error: 'Failed to create sample emails' });
    }

    res.status(200).json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        pitches: pitches.length,
        campaign: campaign.name,
        emails: emails.length,
      },
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
