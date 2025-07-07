export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  venueType: string;
  description: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'jazz-club-intro',
    name: 'Jazz Club Introduction',
    subject: 'Jazz Performance Inquiry - {artistName}',
    venueType: 'jazz-club',
    description: 'Professional introduction for jazz clubs and intimate venues',
    content: `
      <p>Dear {venueName} Team,</p>
      
      <p>I hope this email finds you well. My name is {artistName}, and I'm reaching out regarding potential performance opportunities at {venueName}.</p>
      
      <p>I'm a {genre} artist based in {location}, and I've been following {venueName}'s commitment to quality live music. Your venue's reputation for supporting independent artists and creating intimate musical experiences aligns perfectly with my performance style.</p>
      
      <p>Here's what I bring to the table:</p>
      <ul>
        <li><strong>Musical Style:</strong> {genre} with influences from {influences}</li>
        <li><strong>Experience:</strong> {experience} years performing live</li>
        <li><strong>Audience:</strong> {audienceSize} average attendance at shows</li>
        <li><strong>Flexibility:</strong> Available for {availability}</li>
      </ul>
      
      <p>I would love the opportunity to discuss how my music could complement your venue's atmosphere and contribute to your programming. I'm happy to provide additional materials such as press kits, live recordings, or references from other venues.</p>
      
      <p>Would you be available for a brief conversation about potential booking opportunities? I'm flexible with timing and can work around your schedule.</p>
      
      <p>Thank you for considering my inquiry. I look forward to the possibility of performing at {venueName}.</p>
      
      <p>Best regards,<br>
      {artistName}<br>
      {artistEmail}<br>
      {phone}</p>
    `,
  },

  {
    id: 'rock-venue-pitch',
    name: 'Rock Venue Pitch',
    subject: 'Rock Performance Booking - {artistName}',
    venueType: 'rock-venue',
    description: 'High-energy pitch for rock venues and larger spaces',
    content: `
      <p>Hello {venueName} Booking Team,</p>
      
      <p>I'm {artistName}, a {genre} artist looking to bring high-energy performances to {venueName}. After researching your venue, I believe my sound and stage presence would be a perfect fit for your audience.</p>
      
      <p><strong>What I offer:</strong></p>
      <ul>
        <li><strong>Genre:</strong> {genre} with {energy} energy</li>
        <li><strong>Performance:</strong> {setLength} minute sets with full band</li>
        <li><strong>Draw:</strong> Consistently bring {audienceSize} fans to shows</li>
        <li><strong>Experience:</strong> {experience} years of live performance</li>
      </ul>
      
      <p>I've performed at venues similar to {venueName} and understand the importance of delivering memorable experiences that keep audiences coming back. My shows are known for their {highlights}.</p>
      
      <p>I'm currently booking for {bookingPeriod} and would love to discuss potential dates. I'm flexible with scheduling and can work with your calendar.</p>
      
      <p>Would you be interested in setting up a call to discuss booking opportunities? I can provide live videos, press materials, and references from other venues.</p>
      
      <p>Looking forward to potentially rocking {venueName}!</p>
      
      <p>Best,<br>
      {artistName}<br>
      {artistEmail}<br>
      {phone}</p>
    `,
  },

  {
    id: 'coffee-shop-acoustic',
    name: 'Coffee Shop Acoustic',
    subject: 'Acoustic Performance Opportunity - {artistName}',
    venueType: 'coffee-shop',
    description: 'Intimate acoustic performance for coffee shops and cafes',
    content: `
      <p>Hi {venueName} Team,</p>
      
      <p>I'm {artistName}, an acoustic {genre} artist interested in performing at {venueName}. I love the intimate atmosphere of coffee shops and believe my music would enhance your customers' experience.</p>
      
      <p><strong>About my performances:</strong></p>
      <ul>
        <li><strong>Style:</strong> Acoustic {genre} perfect for background ambiance</li>
        <li><strong>Volume:</strong> Appropriate levels that don't interfere with conversation</li>
        <li><strong>Duration:</strong> {setLength} minute sets, flexible scheduling</li>
        <li><strong>Equipment:</strong> Self-contained, minimal setup required</li>
      </ul>
      
      <p>I understand coffee shops need music that complements the atmosphere without overwhelming it. My acoustic sets create a warm, inviting environment that enhances the coffee shop experience.</p>
      
      <p>I'm available for {availability} and would love to discuss how we could work together. I'm happy to provide samples of my music and references from other coffee shops.</p>
      
      <p>Thank you for considering my inquiry!</p>
      
      <p>Warm regards,<br>
      {artistName}<br>
      {artistEmail}<br>
      {phone}</p>
    `,
  },

  {
    id: 'restaurant-background',
    name: 'Restaurant Background Music',
    subject: 'Background Music Performance - {artistName}',
    venueType: 'restaurant',
    description: 'Sophisticated background music for restaurants and bars',
    content: `
      <p>Dear {venueName} Management,</p>
      
      <p>I'm {artistName}, a {genre} artist interested in providing background music for {venueName}. I specialize in creating the perfect ambiance for dining experiences.</p>
      
      <p><strong>What I provide:</strong></p>
      <ul>
        <li><strong>Style:</strong> {genre} that enhances dining atmosphere</li>
        <li><strong>Volume:</strong> Background level that supports conversation</li>
        <li><strong>Repertoire:</strong> Mix of originals and crowd-pleasing covers</li>
        <li><strong>Professionalism:</strong> Punctual, reliable, and respectful of your space</li>
      </ul>
      
      <p>I understand that restaurant music needs to complement the dining experience without dominating it. My performances are designed to enhance the atmosphere while allowing guests to enjoy their meals and conversations.</p>
      
      <p>I'm available for {availability} and can work with your existing schedule. I'm happy to provide samples and discuss how we can create the perfect musical atmosphere for {venueName}.</p>
      
      <p>Looking forward to potentially contributing to {venueName}'s dining experience!</p>
      
      <p>Best regards,<br>
      {artistName}<br>
      {artistEmail}<br>
      {phone}</p>
    `,
  },

  {
    id: 'follow-up',
    name: 'Follow-up Email',
    subject: 'Following up - {artistName} Performance Inquiry',
    venueType: 'all',
    description: "Professional follow-up for venues that haven't responded",
    content: `
      <p>Hi {venueName} Team,</p>
      
      <p>I hope you're doing well. I wanted to follow up on my previous inquiry about performing at {venueName}.</p>
      
      <p>I understand you're busy, but I wanted to make sure my email didn't get lost in your inbox. I'm still very interested in the opportunity to perform at your venue and would love to discuss how we could work together.</p>
      
      <p>If you're not currently booking or if the timing isn't right, I'd be happy to stay in touch for future opportunities. I'm always updating my availability and would be glad to send you updates when I'm in your area.</p>
      
      <p>Thank you for your time and consideration.</p>
      
      <p>Best regards,<br>
      {artistName}<br>
      {artistEmail}</p>
    `,
  },
];

export function getTemplatesByVenueType(venueType: string): EmailTemplate[] {
  if (venueType === 'all') {
    return EMAIL_TEMPLATES;
  }
  return EMAIL_TEMPLATES.filter(
    template => template.venueType === venueType || template.venueType === 'all'
  );
}

export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value || '');
  });
  return result;
}
