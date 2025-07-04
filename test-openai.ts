import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ArtistData {
  name: string;
  genre: string;
  city: string;
  website?: string;
  bio?: string;
  pricing?: string;
  availability?: string;
  social_links?: Record<string, string>;
}

interface VenueInfo {
  name: string;
  city: string;
}

async function testOpenAI() {
  const artist: ArtistData = {
    name: 'Test Artist',
    genre: 'Jazz',
    city: 'New York, NY',
    website: 'https://test.com',
    bio: 'Test bio',
    pricing: '$500-1000',
    availability: 'Weekends',
    social_links: { instagram: 'https://instagram.com/test' }
  };

  const venueInfo: VenueInfo = {
    name: 'Blue Note',
    city: 'New York'
  };

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
- Venue Name: ${venueInfo.name}
- City: ${venueInfo.city}

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

  try {
    console.log('Testing OpenAI API...');
    console.log('Artist:', artist);
    console.log('Venue:', venueInfo);
    console.log('Prompt:', prompt);

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

    console.log('Raw response:', response);

    try {
      const parsedResponse = JSON.parse(response);
      console.log('Parsed response:', parsedResponse);
      
      if (!parsedResponse.subject || !parsedResponse.body) {
        throw new Error('Invalid response format from OpenAI');
      }

      console.log('✅ Test successful!');
      console.log('Subject:', parsedResponse.subject);
      console.log('Body:', parsedResponse.body);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    process.exit(1);
  }
}

testOpenAI(); 