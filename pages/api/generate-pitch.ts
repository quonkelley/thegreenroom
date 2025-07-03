import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create clients inside the handler for better testability and performance
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { artist_id, venue_info } = req.body;

    if (!artist_id) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    // Get artist profile from Supabase
    const { data: artist, error: artistError } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', artist_id)
      .single();

    if (artistError || !artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Try to generate pitch with OpenAI first
    let generatedPitch;
    try {
      generatedPitch = await generatePitchWithAI(artist, venue_info, openai);
    } catch (aiError) {
      console.warn('OpenAI generation failed, falling back to template:', aiError);
      // Fallback to template-based generation
      generatedPitch = generatePitchTemplate(artist, venue_info);
    }

    res.status(200).json({ 
      pitch: generatedPitch,
      message: 'Pitch generated successfully'
    });

  } catch (error) {
    console.error('Generate pitch error:', error);
    res.status(500).json({ error: 'Failed to generate pitch' });
  }
}

async function generatePitchWithAI(artist: any, venueInfo?: any, openai: OpenAI) {
  const venueName = venueInfo?.name || 'your venue';
  const venueCity = venueInfo?.city || 'your city';
  
  const prompt = `You are an AI assistant helping independent musicians write professional booking inquiry emails to venues. 

Artist Information:
- Name: ${artist.name}
- Genre: ${artist.genre}
- Location: ${artist.city}
- Website: ${artist.website || 'Not provided'}
- Bio: ${artist.bio || 'Not provided'}
- Pricing: ${artist.pricing || 'Not specified'}
- Availability: ${artist.availability || 'Flexible'}
- Social Links: ${artist.social_links ? JSON.stringify(artist.social_links) : 'Not provided'}

Venue Information:
- Venue Name: ${venueName}
- City: ${venueCity}

Please generate a professional booking inquiry email with the following requirements:

1. Create a compelling subject line (max 60 characters)
2. Write a personalized email body that:
   - Introduces the artist professionally
   - Mentions specific venue details when available
   - Highlights the artist's unique qualities and genre fit
   - Includes relevant social media/website links
   - Maintains a professional but friendly tone
   - Ends with a clear call to action
   - Keeps the email concise (150-250 words)

Format the response as JSON with "subject" and "body" fields.

Example format:
{
  "subject": "Booking Inquiry: [Artist Name] - [Genre]",
  "body": "Dear [Venue Name],\n\n[Email content...]\n\nBest regards,\n[Artist Name]"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional music industry assistant specializing in helping independent artists write compelling booking inquiry emails. Always respond with valid JSON containing 'subject' and 'body' fields."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const response = completion.choices[0]?.message?.content;
  
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Parse the JSON response
    const parsedResponse = JSON.parse(response);
    
    if (!parsedResponse.subject || !parsedResponse.body) {
      throw new Error('Invalid response format from OpenAI');
    }

    return {
      subject: parsedResponse.subject,
      body: parsedResponse.body
    };
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    throw new Error('Invalid response format from AI');
  }
}

// Fallback template function (kept for reliability)
function generatePitchTemplate(artist: any, venueInfo?: any) {
  const venueName = venueInfo?.name || 'your venue';
  const venueCity = venueInfo?.city || 'your city';
  
  const subject = `Booking Inquiry: ${artist.name} - ${artist.genre} Artist`;
  
  const body = `Hi there,

I hope this email finds you well! My name is ${artist.name}, and I'm a ${artist.genre} artist based in ${artist.city}.

I'm reaching out because I would love the opportunity to perform at ${venueName} in ${venueCity}. I believe my music would be a great fit for your venue and audience.

A bit about me:
• Genre: ${artist.genre}
• Location: ${artist.city}
• Website: ${artist.website || 'Available upon request'}

${artist.social_links && Object.keys(artist.social_links).length > 0 ? 
  `You can check out my music and social media presence at: ${Object.values(artist.social_links).join(', ')}` : 
  ''
}

I'm flexible with dates and would love to discuss potential booking opportunities. I can provide additional materials like press photos, EPK, or sample tracks if needed.

Would you be interested in having a conversation about booking possibilities? I'm happy to discuss rates, availability, and any other details that would help make this a great partnership.

Looking forward to hearing from you!

Best regards,
${artist.name}

${artist.website ? `Website: ${artist.website}` : ''}`;

  return { subject, body };
} 