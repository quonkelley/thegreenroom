import { motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock as ClockIcon,
  Coffee,
  Copy,
  Download,
  Edit3,
  Eye,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Music,
  Printer,
  RefreshCw,
  Save,
  Send,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AppNavigation from '../../components/AppNavigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import {
  getTemplatesByVenueType,
  replaceTemplateVariables,
} from '../../lib/emailTemplates';
import { supabase } from '../../lib/supabaseClient';

interface Pitch {
  id: string;
  artist_id: string;
  subject: string;
  body: string;
  venue_type?: string;
  venue_name?: string;
  venue_city?: string;
  venue_email?: string;
  status: 'draft' | 'sent' | 'archived' | 'scheduled';
  success_rate?: number;
  response_count?: number;
  sent_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  city: string;
  website: string;
  social_links: any;
  bio: string;
  pricing: string;
  availability: string;
}

interface VenueType {
  id: string;
  name: string;
  description: string;
  icon: any;
  characteristics: string[];
  tips: string[];
}

const VENUE_TYPES: VenueType[] = [
  {
    id: 'jazz-club',
    name: 'Jazz Club',
    description: 'Intimate venues focused on jazz and sophisticated music',
    icon: Music,
    characteristics: [
      'Intimate atmosphere',
      'Sophisticated audience',
      'Acoustic focus',
      'Evening performances',
    ],
    tips: [
      'Emphasize musical sophistication',
      'Mention jazz standards',
      'Highlight acoustic quality',
      'Reference jazz history',
    ],
  },
  {
    id: 'rock-venue',
    name: 'Rock Venue',
    description: 'Larger venues for rock, indie, and high-energy performances',
    icon: Building,
    characteristics: [
      'High energy',
      'Younger audience',
      'Full band setup',
      'Weekend focus',
    ],
    tips: [
      'Highlight energy and crowd engagement',
      'Mention social media following',
      'Emphasize stage presence',
      'Include video links',
    ],
  },
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    description: 'Intimate settings for acoustic and background music',
    icon: Coffee,
    characteristics: [
      'Intimate setting',
      'Background music',
      'Daytime/evening',
      'Acoustic focus',
    ],
    tips: [
      'Emphasize acoustic quality',
      'Mention background music experience',
      'Highlight versatility',
      'Include soft volume capability',
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining establishments seeking ambient music',
    icon: Star,
    characteristics: [
      'Ambient music',
      'Dining atmosphere',
      'Evening focus',
      'Professional demeanor',
    ],
    tips: [
      'Emphasize ambient quality',
      'Mention dining experience',
      'Highlight professionalism',
      'Include background music samples',
    ],
  },
];

const PITCH_TEMPLATES = [
  {
    id: 'professional-intro',
    name: 'Professional Introduction',
    description: 'Formal, business-like approach',
    subject: 'Booking Inquiry: {artist_name} - {genre} Artist',
    body: `Dear {venue_name},

I hope this email finds you well. My name is {artist_name}, and I'm a {genre} artist based in {city}.

I'm reaching out because I would love the opportunity to perform at {venue_name} in {venue_city}. I believe my music would be a great fit for your venue and audience.

A bit about me:
• Genre: {genre}
• Location: {city}
• Website: {website}

{social_links_text}

I'm flexible with dates and would love to discuss potential booking opportunities. I can provide additional materials like press photos, EPK, or sample tracks if needed.

Would you be interested in having a conversation about booking possibilities? I'm happy to discuss rates, availability, and any other details that would help make this a great partnership.

Looking forward to hearing from you!

Best regards,
{artist_name}

{website_text}`,
  },
  {
    id: 'casual-friendly',
    name: 'Casual & Friendly',
    description: 'Warm, approachable tone',
    subject: 'Hey {venue_name}! {artist_name} here',
    body: `Hi there!

I hope you're having a great day! I'm {artist_name}, a {genre} artist from {city}, and I'd love to chat about potentially performing at {venue_name}.

I've heard amazing things about your venue in {venue_city} and think my music would be a perfect fit for your audience. I specialize in {genre} and have been building a solid following in the local music scene.

You can check out my music at {website} and see what I'm up to on social media: {social_links_text}

I'm pretty flexible with dates and would love to discuss what might work for both of us. I can bring my own equipment if needed and am happy to work with your existing setup.

What do you think? Would love to grab a coffee or hop on a call to discuss possibilities!

Thanks for your time,
{artist_name}

{website_text}`,
  },
  {
    id: 'data-driven',
    name: 'Data-Driven Approach',
    description: 'Focus on metrics and results',
    subject: 'High-Engagement {genre} Artist for {venue_name}',
    body: `Dear {venue_name} team,

I'm {artist_name}, a {genre} artist with a proven track record of engaging audiences and driving venue attendance.

Here's what I bring to the table:
• {genre} artist with strong local following
• Average 150+ attendees at local shows
• 85% audience retention rate
• Active social media presence with 5K+ followers
• Professional sound and lighting setup

I'm based in {city} and would love to bring my high-energy performances to {venue_name} in {venue_city}.

Check out my recent performances and audience engagement at {website} and {social_links_text}

I'm available for booking and can provide detailed analytics from previous shows. My rate is competitive and I'm happy to discuss partnership opportunities that benefit both parties.

Would love to schedule a call to discuss how we can create a successful partnership!

Best regards,
{artist_name}

{website_text}`,
  },
];

export default function PitchGenerator() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentPitch, setCurrentPitch] = useState<Pitch | null>(null);
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueEmail, setVenueEmail] = useState('');
  const [selectedVenueType, setSelectedVenueType] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pitchHistory, setPitchHistory] = useState<Pitch[]>([]);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showPitchHistory, setShowPitchHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'mobile' | 'email'
  >('desktop');

  const fetchProfile = useCallback(async () => {
    if (!user?.email) {
      return;
    }

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        setError(
          'Failed to load your profile. Please complete your profile first.'
        );
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load your profile');
    } finally {
      setProfileLoading(false);
    }
  }, [user?.email]);

  const loadPitch = useCallback(async () => {
    if (!profile) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/pitches?artist_id=${profile.id}`);
      const data = await response.json();

      if (response.ok && data.pitch) {
        setCurrentPitch(data.pitch);
        setSubject(data.pitch.subject);
        setBody(data.pitch.body);
      }
    } catch (err) {
      console.error('Failed to load pitch:', err);
      setError('Failed to load existing pitch');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const loadPitchHistory = useCallback(async () => {
    if (!profile) {
      return;
    }

    try {
      const response = await fetch(
        `/api/pitches/history?artist_id=${profile.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setPitchHistory(data.pitches || []);
      }
    } catch (err) {
      console.error('Failed to load pitch history:', err);
    }
  }, [profile]);

  // Fetch user's profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // Load existing pitch when profile is loaded
  useEffect(() => {
    if (profile) {
      loadPitch();
      loadPitchHistory();
    }
  }, [profile, loadPitch, loadPitchHistory]);

  // Handle URL parameters for venue pre-fill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const venueName = urlParams.get('venue');
      const venueCity = urlParams.get('city');
      const venueEmail = urlParams.get('email');
      const venueType = urlParams.get('venueType');

      if (venueName) {
        setVenueName(venueName);
      }
      if (venueCity) {
        setVenueCity(venueCity);
      }
      if (venueEmail) {
        setVenueEmail(venueEmail);
      }
      if (venueType) {
        setSelectedVenueType(venueType);
      }

      // Auto-select venue type based on venue name or city if not provided
      if (!venueType && (venueName || venueCity)) {
        const searchTerm = (venueName + ' ' + venueCity).toLowerCase();
        if (searchTerm.includes('jazz') || searchTerm.includes('blue')) {
          setSelectedVenueType('jazz-club');
        } else if (
          searchTerm.includes('coffee') ||
          searchTerm.includes('cafe')
        ) {
          setSelectedVenueType('coffee-shop');
        } else if (
          searchTerm.includes('restaurant') ||
          searchTerm.includes('bar')
        ) {
          setSelectedVenueType('restaurant');
        } else {
          setSelectedVenueType('rock-venue');
        }
      }
    }
  }, []);

  const savePitch = async () => {
    if (!profile || !subject.trim() || !body.trim()) {
      setError('Subject and body are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: profile.id,
          subject: subject.trim(),
          body: body.trim(),
          venue_type: selectedVenueType,
          venue_name: venueName,
          venue_city: venueCity,
          venue_email: venueEmail,
          status: currentPitch?.status || 'draft',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPitch(data.pitch);
        setSuccess('Pitch saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadPitchHistory(); // Refresh history
      } else {
        throw new Error(data.error || 'Failed to save pitch');
      }
    } catch (err: any) {
      console.error('Save pitch error:', err);
      setError(err.message || 'Failed to save pitch');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!profile) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: profile.id,
          venue_info: {
            name: venueName || 'your venue',
            city: venueCity || 'your city',
            type: selectedVenueType,
          },
          template_id: selectedTemplate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubject(data.pitch.subject);
        setBody(data.pitch.body);
        setSuccess('AI draft generated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to generate pitch');
      }
    } catch (err: any) {
      console.error('Generate pitch error:', err);
      setError(err.message || 'Failed to generate pitch');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: any) => {
    if (!profile) {
      return;
    }

    setSubject(template.subject);
    setBody(template.body);
    setSelectedTemplate(template.id);
  };

  const loadPitchFromHistory = (pitch: Pitch) => {
    setSubject(pitch.subject);
    setBody(pitch.body);
    setVenueName(pitch.venue_name || '');
    setVenueCity(pitch.venue_city || '');
    setVenueEmail(pitch.venue_email || '');
    setSelectedVenueType(pitch.venue_type || '');
    setCurrentPitch(pitch);
    setShowPitchHistory(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const openEmailModal = () => {
    if (!venueName || !emailRecipient) {
      setError('Please fill in venue name and recipient email');
      return;
    }
    if (venueEmail && venueEmail !== emailRecipient) {
      setError('Venue email and recipient email must match');
      return;
    }
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!emailRecipient || !emailSubject || !emailContent) {
      setEmailError('Please fill in all required fields');
      return;
    }

    setSendingEmail(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/send-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailRecipient,
          subject: emailSubject,
          content: emailContent,
          venueName: venueName,
          artistName: profile?.name,
          artistEmail: user?.email,
          venueEmail: emailRecipient,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSuccess('Email sent successfully!');
        setShowEmailModal(false);

        // Save the pitch to history
        await savePitch();

        // Clear form
        setEmailRecipient('');
        setEmailSubject('');
        setEmailContent('');
      } else {
        setEmailError(data.error || 'Failed to send email');
      }
    } catch (error) {
      setEmailError('Network error. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const applyEmailTemplate = (template: any) => {
    const variables = {
      artistName: profile?.name || '',
      venueName: venueName,
      venueCity: venueCity,
      genre: profile?.genre || '',
      city: profile?.city || '',
      website: profile?.website || '',
      social_links_text: profile?.social_links
        ? Object.values(profile.social_links).join(', ')
        : '',
      website_text: profile?.website ? `Website: ${profile.website}` : '',
      location: profile?.city || '',
      influences: 'various artists',
      experience: '5',
      audienceSize: '100-150',
      availability: 'weekends and weekdays',
      energy: 'high',
      setLength: '45-60',
      highlights: 'energetic performances and crowd engagement',
      bookingPeriod: 'the next few months',
      phone: profile?.social_links?.phone || '',
    };

    setEmailSubject(replaceTemplateVariables(template.subject, variables));
    setEmailContent(replaceTemplateVariables(template.content, variables));
  };

  const tabs = [
    { id: 'generator', label: 'Generator', icon: Sparkles },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'templates', label: 'Templates', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit3 className='w-4 h-4 text-gray-500' />;
      case 'sent':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'scheduled':
        return <ClockIcon className='w-4 h-4 text-blue-500' />;
      case 'archived':
        return <Archive className='w-4 h-4 text-gray-400' />;
      default:
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'scheduled':
        return 'Scheduled';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const generatePreviewContent = () => {
    if (!profile) {
      return { subject: '', body: '' };
    }

    const template = PITCH_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) {
      return { subject: subject, body: body };
    }

    const variables = {
      artist_name: profile.name,
      genre: profile.genre,
      city: profile.city,
      venue_name: venueName || '{venue_name}',
      venue_city: venueCity || '{venue_city}',
      website: profile.website || '{website}',
      social_links_text: profile.social_links
        ? Object.entries(profile.social_links)
            .map(([platform, url]) => `${platform}: ${url}`)
            .join(', ')
        : '{social_links}',
      website_text: profile.website ? `\n${profile.website}` : '',
    };

    const previewSubject = template.subject.replace(
      /\{(\w+)\}/g,
      (match, key) => variables[key as keyof typeof variables] || match
    );
    const previewBody = template.body.replace(
      /\{(\w+)\}/g,
      (match, key) => variables[key as keyof typeof variables] || match
    );

    return {
      subject: previewSubject,
      body: previewBody,
    };
  };

  const copyPitchToClipboard = () => {
    const content = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(content);
    setSuccess('Pitch copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const downloadPitch = () => {
    const content = `Subject: ${subject}\n\n${body}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch-${venueName || 'venue'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPitch = () => {
    const content = `Subject: ${subject}\n\n${body}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pitch - ${venueName || 'Venue'}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .subject { font-weight: bold; font-size: 18px; margin-bottom: 20px; }
              .body { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Pitch for ${venueName || 'Venue'}</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="subject">Subject: ${subject}</div>
            <div class="body">${body}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const updatePitchStatus = async (
    pitchId: string,
    status: 'draft' | 'sent' | 'archived' | 'scheduled'
  ) => {
    try {
      const { error } = await supabase
        .from('pitches')
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}),
        })
        .eq('id', pitchId);

      if (error) {
        throw error;
      }

      // Update local state
      setPitchHistory(prev =>
        prev.map(pitch =>
          pitch.id === pitchId
            ? { ...pitch, status, updated_at: new Date().toISOString() }
            : pitch
        )
      );

      if (currentPitch?.id === pitchId) {
        setCurrentPitch(prev =>
          prev
            ? { ...prev, status, updated_at: new Date().toISOString() }
            : null
        );
      }

      setSuccess(`Pitch status updated to ${getStatusText(status)}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating pitch status:', error);
      setError('Failed to update pitch status');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (profileLoading) {
    return (
      <div className='max-w-7xl mx-auto py-12 px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='bg-white rounded-xl shadow-lg p-12 text-center'>
            <h2 className='text-2xl font-bold mb-4 text-gray-900'>
              Complete Your Profile
            </h2>
            <p className='text-gray-700 mb-6'>
              You need to complete your artist profile before using the pitch
              generator.
            </p>
            <Link
              href='/app/profile'
              className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <AppNavigation />
        <div className='max-w-7xl mx-auto py-8 px-4'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Pitch Generator
            </h1>
            <p className='text-gray-600'>
              Create compelling booking pitches with AI assistance
            </p>
          </div>

          {/* Tabs */}
          <div className='bg-white rounded-xl shadow-lg border border-gray-100 mb-8'>
            <div className='border-b border-gray-200'>
              <nav className='flex space-x-8 px-6'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className='w-4 h-4' />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className='p-6'>
              {/* Generator Tab */}
              {activeTab === 'generator' && (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  {/* Profile Summary */}
                  <div className='lg:col-span-1'>
                    <div className='bg-gray-50 rounded-xl p-6'>
                      <h2 className='text-xl font-bold mb-4 text-gray-900'>
                        Profile Summary
                      </h2>
                      <div className='mb-2 font-medium text-gray-900'>
                        {profile.name}
                      </div>
                      <div className='mb-2 text-gray-600'>
                        {profile.genre} • {profile.city}
                      </div>
                      {profile.website && (
                        <div className='mb-2'>
                          <a
                            href={profile.website}
                            className='text-blue-600 hover:text-blue-500 underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {profile.social_links &&
                        Object.keys(profile.social_links).length > 0 && (
                          <div className='mb-2'>
                            {Object.entries(profile.social_links).map(
                              ([type, url]) => (
                                <a
                                  key={type}
                                  href={url as string}
                                  className='text-purple-600 hover:text-purple-500 underline mr-2'
                                  target='_blank'
                                  rel='noopener noreferrer'
                                >
                                  {type}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      {profile.bio && (
                        <div className='mt-4 p-3 bg-white rounded-lg'>
                          <p className='text-gray-700 text-sm'>{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pitch Editor */}
                  <div className='lg:col-span-2'>
                    <div className='bg-white rounded-xl p-6 border border-gray-200'>
                      <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-bold'>Create Your Pitch</h2>
                        {currentPitch && (
                          <div className='text-sm text-gray-500'>
                            Last saved:{' '}
                            {new Date(
                              currentPitch.updated_at
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {success && (
                        <div className='mb-4 text-green-700 font-medium bg-green-50 p-3 rounded border border-green-200'>
                          {success}
                        </div>
                      )}
                      {error && (
                        <div className='mb-4 text-red-700 font-medium bg-red-50 p-3 rounded border border-red-200'>
                          {error}
                        </div>
                      )}

                      {/* Venue Information */}
                      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                        <h3 className='font-medium mb-3 text-gray-700'>
                          Venue Information
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                          <div>
                            <label className='block text-sm mb-1 text-gray-600'>
                              Venue Name
                            </label>
                            <input
                              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              placeholder='e.g. Blue Note'
                              value={venueName}
                              onChange={e => setVenueName(e.target.value)}
                              disabled={loading || saving}
                            />
                          </div>
                          <div>
                            <label className='block text-sm mb-1 text-gray-600'>
                              City
                            </label>
                            <input
                              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              placeholder='e.g. New York'
                              value={venueCity}
                              onChange={e => setVenueCity(e.target.value)}
                              disabled={loading || saving}
                            />
                          </div>
                          <div>
                            <label className='block text-sm mb-1 text-gray-600'>
                              Venue Email
                            </label>
                            <input
                              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              placeholder='venue@example.com'
                              value={venueEmail}
                              onChange={e => setVenueEmail(e.target.value)}
                              disabled={loading || saving}
                            />
                          </div>
                          <div>
                            <label className='block text-sm mb-1 text-gray-600'>
                              Venue Type
                            </label>
                            <select
                              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              value={selectedVenueType}
                              onChange={e =>
                                setSelectedVenueType(e.target.value)
                              }
                              disabled={loading || saving}
                            >
                              <option value=''>Select venue type</option>
                              {VENUE_TYPES.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {selectedVenueType && (
                          <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                            <div className='flex items-center gap-2 mb-2'>
                              {(() => {
                                const venueType = VENUE_TYPES.find(
                                  t => t.id === selectedVenueType
                                );
                                const IconComponent = venueType?.icon;
                                return (
                                  IconComponent && (
                                    <IconComponent className='w-4 h-4 text-blue-600' />
                                  )
                                );
                              })()}
                              <span className='font-medium text-blue-900'>
                                {
                                  VENUE_TYPES.find(
                                    t => t.id === selectedVenueType
                                  )?.name
                                }
                              </span>
                            </div>
                            <p className='text-sm text-blue-800 mb-2'>
                              {
                                VENUE_TYPES.find(
                                  t => t.id === selectedVenueType
                                )?.description
                              }
                            </p>
                            <div className='text-xs text-blue-700'>
                              <strong>Tips:</strong>{' '}
                              {VENUE_TYPES.find(
                                t => t.id === selectedVenueType
                              )?.tips.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Selection */}
                      <div className='mb-6'>
                        <div className='flex items-center justify-between mb-3'>
                          <label className='block font-medium text-gray-700'>
                            Template Style
                          </label>
                          <button
                            onClick={() => setShowTemplateLibrary(true)}
                            className='text-sm text-blue-600 hover:text-blue-500'
                          >
                            View all templates
                          </button>
                        </div>
                        <select
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          value={selectedTemplate}
                          onChange={e => setSelectedTemplate(e.target.value)}
                          disabled={loading || saving}
                        >
                          <option value=''>Select a template style</option>
                          {PITCH_TEMPLATES.map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pitch Content */}
                      <div className='mb-4'>
                        <label className='block mb-2 font-medium text-gray-700'>
                          Subject Line
                        </label>
                        <input
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          placeholder='Booking Inquiry: Jane Doe'
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          disabled={loading || saving}
                        />
                      </div>

                      <div className='mb-6'>
                        <label className='block mb-2 font-medium text-gray-700'>
                          Email Body
                        </label>
                        <textarea
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          rows={8}
                          placeholder='Type your pitch or generate with AI...'
                          value={body}
                          onChange={e => setBody(e.target.value)}
                          disabled={loading || saving}
                        />
                      </div>

                      {/* Email Recipient */}
                      <div className='mb-6'>
                        <label className='block mb-2 font-medium text-gray-700'>
                          Email Recipient
                        </label>
                        <input
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          placeholder='venue@example.com'
                          value={emailRecipient}
                          onChange={e => setEmailRecipient(e.target.value)}
                          disabled={loading || saving}
                        />
                        <p className='text-xs text-gray-500 mt-1'>
                          This is the email address where your pitch will be
                          sent
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex gap-3'>
                        <button
                          onClick={handleGenerateDraft}
                          disabled={loading || saving}
                          className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                          {loading ? (
                            <RefreshCw className='w-4 h-4 animate-spin' />
                          ) : (
                            <Sparkles className='w-4 h-4' />
                          )}
                          {loading ? 'Generating...' : 'Generate AI Draft'}
                        </button>
                        <button
                          onClick={savePitch}
                          disabled={
                            loading || saving || !subject.trim() || !body.trim()
                          }
                          className='flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                          {saving ? (
                            <RefreshCw className='w-4 h-4 animate-spin' />
                          ) : (
                            <Save className='w-4 h-4' />
                          )}
                          {saving ? 'Saving...' : 'Save Pitch'}
                        </button>
                        <button
                          onClick={openEmailModal}
                          disabled={
                            !subject.trim() ||
                            !body.trim() ||
                            !emailRecipient.trim()
                          }
                          className='flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                          <Mail className='w-4 h-4' />
                          Send Email
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(`${subject}\n\n${body}`)
                          }
                          disabled={!subject.trim() || !body.trim()}
                          className='px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                        >
                          <Copy className='w-4 h-4' />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Pitch Preview
                    </h3>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          previewMode === 'desktop'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Desktop
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          previewMode === 'mobile'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Mobile
                      </button>
                      <button
                        onClick={() => setPreviewMode('email')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          previewMode === 'email'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>

                  {!subject.trim() && !body.trim() ? (
                    <div className='text-center py-12 text-gray-500'>
                      <Eye className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                      <p>No pitch content to preview. Create a pitch first!</p>
                    </div>
                  ) : (
                    <div className='space-y-6'>
                      {/* Pitch Status and Actions */}
                      <div className='bg-white border border-gray-200 rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            <span className='text-sm font-medium text-gray-700'>
                              Status:
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentPitch?.status || 'draft')}`}
                            >
                              {getStatusIcon(currentPitch?.status || 'draft')}
                              {getStatusText(currentPitch?.status || 'draft')}
                            </span>
                            {currentPitch?.sent_at && (
                              <span className='text-xs text-gray-500'>
                                Sent:{' '}
                                {new Date(
                                  currentPitch.sent_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-2'>
                            {currentPitch && (
                              <>
                                <select
                                  value={currentPitch.status}
                                  onChange={e =>
                                    updatePitchStatus(
                                      currentPitch.id,
                                      e.target.value as any
                                    )
                                  }
                                  className='text-xs border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                >
                                  <option value='draft'>Draft</option>
                                  <option value='sent'>Sent</option>
                                  <option value='scheduled'>Scheduled</option>
                                  <option value='archived'>Archived</option>
                                </select>
                              </>
                            )}
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <button
                            onClick={copyPitchToClipboard}
                            className='flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                          >
                            <Copy className='w-3 h-3' />
                            Copy
                          </button>
                          <button
                            onClick={downloadPitch}
                            className='flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                          >
                            <Download className='w-3 h-3' />
                            Download
                          </button>
                          <button
                            onClick={printPitch}
                            className='flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                          >
                            <Printer className='w-3 h-3' />
                            Print
                          </button>
                          <button
                            onClick={() => {
                              const content = `Subject: ${subject}\n\n${body}`;
                              navigator.share
                                ? navigator.share({ text: content })
                                : copyPitchToClipboard();
                            }}
                            className='flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                          >
                            <Share2 className='w-3 h-3' />
                            Share
                          </button>
                        </div>
                      </div>

                      {/* Preview Content */}
                      <div
                        className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${
                          previewMode === 'mobile'
                            ? 'max-w-sm mx-auto'
                            : 'w-full'
                        }`}
                      >
                        <div className='bg-gray-50 px-4 py-2 border-b border-gray-200'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-gray-700'>
                              {previewMode === 'email'
                                ? 'Email Preview'
                                : 'Pitch Preview'}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {previewMode === 'mobile'
                                ? 'Mobile View'
                                : previewMode === 'email'
                                  ? 'Email Client'
                                  : 'Desktop View'}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`p-6 ${previewMode === 'mobile' ? 'text-sm' : ''}`}
                        >
                          {previewMode === 'email' ? (
                            <div className='space-y-4'>
                              <div>
                                <div className='text-xs text-gray-500 mb-1'>
                                  From: {profile?.name} &lt;{user?.email}&gt;
                                </div>
                                <div className='text-xs text-gray-500 mb-1'>
                                  To: {venueEmail || 'venue@example.com'}
                                </div>
                                <div className='text-xs text-gray-500 mb-3'>
                                  Subject: {subject}
                                </div>
                              </div>
                              <div className='border-t border-gray-200 pt-4'>
                                <div className='whitespace-pre-wrap text-gray-900'>
                                  {body}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-4'>
                              <div>
                                <h4 className='font-semibold text-gray-900 mb-2'>
                                  Subject
                                </h4>
                                <p className='text-gray-700'>{subject}</p>
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-900 mb-2'>
                                  Message
                                </h4>
                                <div className='whitespace-pre-wrap text-gray-700'>
                                  {body}
                                </div>
                              </div>
                              {venueName && (
                                <div className='bg-blue-50 p-3 rounded-lg'>
                                  <div className='text-sm text-blue-800'>
                                    <strong>Venue:</strong> {venueName}
                                    {venueCity && `, ${venueCity}`}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pitch Analytics Preview */}
                      {currentPitch && (
                        <div className='bg-white border border-gray-200 rounded-lg p-4'>
                          <h4 className='font-medium text-gray-900 mb-3'>
                            Pitch Performance
                          </h4>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-blue-600'>
                                {currentPitch.success_rate || 0}%
                              </div>
                              <div className='text-xs text-gray-500'>
                                Success Rate
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-green-600'>
                                {currentPitch.response_count || 0}
                              </div>
                              <div className='text-xs text-gray-500'>
                                Responses
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-purple-600'>
                                {currentPitch.sent_at ? 'Yes' : 'No'}
                              </div>
                              <div className='text-xs text-gray-500'>Sent</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-orange-600'>
                                {new Date(
                                  currentPitch.created_at
                                ).toLocaleDateString()}
                              </div>
                              <div className='text-xs text-gray-500'>
                                Created
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                    Pitch Templates
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {PITCH_TEMPLATES.map(template => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer'
                        onClick={() => applyTemplate(template)}
                      >
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          {template.name}
                        </h4>
                        <p className='text-sm text-gray-600 mb-4'>
                          {template.description}
                        </p>
                        <div className='text-xs text-gray-500 bg-gray-50 p-3 rounded'>
                          <strong>Subject:</strong> {template.subject}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                    Pitch History
                  </h3>
                  <div className='space-y-4'>
                    {pitchHistory.length === 0 ? (
                      <div className='text-center py-8 text-gray-500'>
                        <History className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                        <p>No pitch history yet. Create your first pitch!</p>
                      </div>
                    ) : (
                      pitchHistory.map(pitch => (
                        <motion.div
                          key={pitch.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                          onClick={() => loadPitchFromHistory(pitch)}
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-medium text-gray-900'>
                              {pitch.subject}
                            </h4>
                            <div className='flex items-center gap-2 text-sm text-gray-500'>
                              {pitch.success_rate && (
                                <div className='flex items-center gap-1'>
                                  <TrendingUp className='w-3 h-3' />
                                  {pitch.success_rate}%
                                </div>
                              )}
                              {pitch.response_count && (
                                <div className='flex items-center gap-1'>
                                  <MessageSquare className='w-3 h-3' />
                                  {pitch.response_count} responses
                                </div>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {new Date(pitch.created_at).toLocaleDateString()}
                            </div>
                            {pitch.venue_name && (
                              <div className='flex items-center gap-1'>
                                <MapPin className='w-3 h-3' />
                                {pitch.venue_name}
                              </div>
                            )}
                            {pitch.venue_type && (
                              <div className='flex items-center gap-1'>
                                <Target className='w-3 h-3' />
                                {VENUE_TYPES.find(
                                  t => t.id === pitch.venue_type
                                )?.name || pitch.venue_type}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
            >
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Send Pitch Email
                  </h2>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <X className='w-6 h-6' />
                  </button>
                </div>
              </div>

              <div className='p-6'>
                {emailSuccess && (
                  <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <p className='text-green-800'>{emailSuccess}</p>
                  </div>
                )}

                {emailError && (
                  <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-800'>{emailError}</p>
                  </div>
                )}

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      To
                    </label>
                    <input
                      type='email'
                      value={emailRecipient}
                      onChange={e => setEmailRecipient(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='venue@example.com'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Subject
                    </label>
                    <input
                      type='text'
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Message
                    </label>
                    <textarea
                      value={emailContent}
                      onChange={e => setEmailContent(e.target.value)}
                      rows={12}
                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    />
                  </div>

                  {/* Email Templates */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quick Templates
                    </label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {getTemplatesByVenueType(selectedVenueType || 'all')
                        .slice(0, 4)
                        .map(template => (
                          <button
                            key={template.id}
                            onClick={() => applyEmailTemplate(template)}
                            className='text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                          >
                            <div className='font-medium text-sm text-gray-900'>
                              {template.name}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {template.description}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className='flex gap-3 mt-6'>
                  <button
                    onClick={sendEmail}
                    disabled={
                      sendingEmail ||
                      !emailRecipient ||
                      !emailSubject ||
                      !emailContent
                    }
                    className='flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {sendingEmail ? (
                      <RefreshCw className='w-4 h-4 animate-spin' />
                    ) : (
                      <Send className='w-4 h-4' />
                    )}
                    {sendingEmail ? 'Sending...' : 'Send Email'}
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
