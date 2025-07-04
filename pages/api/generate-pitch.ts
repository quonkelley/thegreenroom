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
    const { artist_id, venue_info, template_id } = req.body;

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
      generatedPitch = await generatePitchWithAI(artist, venue_info, template_id, openai);
    } catch (aiError) {
      console.warn('OpenAI generation failed, falling back to template:', aiError);
      // Fallback to template-based generation
      generatedPitch = generatePitchTemplate(artist, venue_info, template_id);
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

async function generatePitchWithAI(artist: any, venueInfo: any | undefined, templateId: string | undefined, openai: OpenAI) {
  const venueName = venueInfo?.name || 'your venue';
  const venueCity = venueInfo?.city || 'your city';
  const venueType = venueInfo?.type || '';
  
  // Get venue type specific guidance
  const venueTypeGuidance = getVenueTypeGuidance(venueType);
  
  // Get template guidance
  const templateGuidance = getTemplateGuidance(templateId);
  
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
- Venue Type: ${venueType || 'Not specified'}

${venueTypeGuidance}

${templateGuidance}

Please generate a professional booking inquiry email with the following requirements:

1. Create a compelling subject line (max 60 characters)
2. Write a personalized email body that:
   - Introduces the artist professionally
   - Mentions specific venue details when available
   - Highlights the artist's unique qualities and genre fit
   - Includes relevant social media/website links
   - Maintains the specified tone and approach
   - Ends with a clear call to action
   - Keeps the email concise (150-250 words)
   - Incorporates venue-specific insights and tips

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
        content: "You are a professional music industry assistant specializing in helping independent artists write compelling booking inquiry emails. Always respond with valid JSON containing 'subject' and 'body' fields. Tailor your approach based on venue type and template style."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 600,
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

function getVenueTypeGuidance(venueType: string): string {
  const guidance = {
    'jazz-club': `
Venue Type: Jazz Club
Characteristics: Intimate atmosphere, sophisticated audience, acoustic focus, evening performances
Tips for this venue type:
- Emphasize musical sophistication and jazz knowledge
- Mention jazz standards and improvisational skills
- Highlight acoustic quality and intimate performance style
- Reference jazz history and tradition
- Focus on creating an elegant, sophisticated atmosphere
- Mention experience with jazz audiences`,
    
    'rock-venue': `
Venue Type: Rock Venue
Characteristics: High energy, younger audience, full band setup, weekend focus
Tips for this venue type:
- Highlight energy and crowd engagement
- Mention social media following and fan base
- Emphasize stage presence and performance energy
- Include video links and live performance examples
- Focus on bringing in crowds and creating excitement
- Mention experience with high-energy performances`,
    
    'coffee-shop': `
Venue Type: Coffee Shop
Characteristics: Intimate setting, background music, daytime/evening, acoustic focus
Tips for this venue type:
- Emphasize acoustic quality and soft volume capability
- Mention background music experience
- Highlight versatility and adaptability
- Focus on creating a relaxed, comfortable atmosphere
- Mention ability to work with existing setup
- Emphasize daytime and evening availability`,
    
    'restaurant': `
Venue Type: Restaurant
Characteristics: Ambient music, dining atmosphere, evening focus, professional demeanor
Tips for this venue type:
- Emphasize ambient quality and dining experience
- Mention professionalism and reliability
- Highlight background music capabilities
- Focus on enhancing the dining atmosphere
- Mention experience with restaurant environments
- Emphasize evening availability and consistency`
  };
  
  return guidance[venueType as keyof typeof guidance] || '';
}

function getTemplateGuidance(templateId: string | undefined): string {
  const guidance = {
    'professional-intro': `
Template Style: Professional Introduction
Approach: Formal, business-like, comprehensive
- Use formal language and professional tone
- Include detailed artist information
- Emphasize qualifications and experience
- Be thorough and comprehensive
- Use traditional business email format`,
    
    'casual-friendly': `
Template Style: Casual & Friendly
Approach: Warm, approachable, conversational
- Use friendly, conversational tone
- Be more personal and relatable
- Show enthusiasm and personality
- Use casual language while remaining professional
- Create a connection through shared interests`,
    
    'data-driven': `
Template Style: Data-Driven Approach
Approach: Results-focused, metrics-oriented
- Include specific numbers and statistics
- Emphasize track record and proven results
- Focus on business benefits and ROI
- Use data to support claims
- Be specific about audience engagement and attendance`
  };
  
  return guidance[templateId as keyof typeof guidance] || '';
}

// Enhanced fallback template function
function generatePitchTemplate(artist: any, venueInfo?: any, templateId?: string) {
  const venueName = venueInfo?.name || 'your venue';
  const venueCity = venueInfo?.city || 'your city';
  const venueType = venueInfo?.type || '';
  
  // Get venue-specific template
  const venueSpecificTemplate = getVenueSpecificTemplate(artist, venueName, venueCity, venueType);
  
  // Apply template style if specified
  if (templateId) {
    return applyTemplateStyle(venueSpecificTemplate, templateId);
  }
  
  return venueSpecificTemplate;
}

function getVenueSpecificTemplate(artist: any, venueName: string, venueCity: string, venueType: string) {
  const baseTemplate = {
    subject: `Booking Inquiry: ${artist.name} - ${artist.genre} Artist`,
    body: `Hi there,

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

${artist.website ? `Website: ${artist.website}` : ''}`
  };

  // Add venue-specific content
  switch (venueType) {
    case 'jazz-club':
      baseTemplate.body = baseTemplate.body.replace(
        'I believe my music would be a great fit for your venue and audience.',
        'I believe my music would be a great fit for your sophisticated jazz audience. I specialize in jazz standards and improvisational pieces that create an intimate, sophisticated atmosphere perfect for your venue.'
      );
      break;
      
    case 'rock-venue':
      baseTemplate.body = baseTemplate.body.replace(
        'I believe my music would be a great fit for your venue and audience.',
        'I believe my high-energy performances would be a great fit for your venue and audience. I bring a dynamic stage presence and can guarantee an engaging show that will bring in crowds and create an exciting atmosphere.'
      );
      break;
      
    case 'coffee-shop':
      baseTemplate.body = baseTemplate.body.replace(
        'I believe my music would be a great fit for your venue and audience.',
        'I believe my acoustic style would be perfect for creating a relaxed, comfortable atmosphere at your coffee shop. I specialize in background music that enhances the dining experience without overwhelming conversation.'
      );
      break;
      
    case 'restaurant':
      baseTemplate.body = baseTemplate.body.replace(
        'I believe my music would be a great fit for your venue and audience.',
        'I believe my ambient music style would enhance the dining experience at your restaurant. I provide professional, reliable background music that creates the perfect atmosphere for your guests.'
      );
      break;
  }

  return baseTemplate;
}

function applyTemplateStyle(template: any, templateId: string) {
  switch (templateId) {
    case 'casual-friendly':
      template.subject = `Hey ${template.subject.split(': ')[1]?.split(' - ')[0] || 'there'}! ${template.subject.split(': ')[1]?.split(' - ')[0] || 'I'} here`;
      template.body = template.body.replace('Hi there,\n\nI hope this email finds you well!', 'Hi there!\n\nI hope you\'re having a great day!');
      template.body = template.body.replace('Best regards,', 'Thanks for your time,');
      break;
      
    case 'data-driven':
      template.subject = `High-Engagement ${template.subject.split(': ')[1]?.split(' - ')[1] || 'Artist'} for ${template.subject.split(': ')[1]?.split(' - ')[0] || 'your venue'}`;
      template.body = template.body.replace(
        'A bit about me:',
        'Here\'s what I bring to the table:'
      );
      template.body = template.body.replace(
        '• Genre: ${artist.genre}\n• Location: ${artist.city}\n• Website: ${artist.website || \'Available upon request\'}',
        '• ${artist.genre} artist with strong local following\n• Average 150+ attendees at local shows\n• 85% audience retention rate\n• Active social media presence with 5K+ followers\n• Professional sound and lighting setup'
      );
      break;
  }

  return template;
} 