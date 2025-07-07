import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Filter,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppNavigation from '../../components/AppNavigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import {
  ArtistProfile,
  OutreachCampaign,
  OutreachEmail,
  OutreachFollowup,
  Venue,
} from '../../types';

interface OutreachStats {
  total_emails: number;
  sent_emails: number;
  opened_emails: number;
  replied_emails: number;
  response_rate: number;
  positive_responses: number;
  negative_responses: number;
}

interface Analytics {
  stats: OutreachStats;
  campaigns: {
    total: number;
    active: number;
  };
  followups: {
    pending: number;
  };
  statusBreakdown: {
    draft: number;
    sent: number;
    opened: number;
    replied: number;
    bounced: number;
  };
  responseBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    no_response: number;
  };
  recentEmails: OutreachEmail[];
  upcomingFollowups: OutreachFollowup[];
}

export default function OutreachTracker() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [emailStatus, setEmailStatus] = useState<string>('all');
  const [showNewEmailModal, setShowNewEmailModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  // New email form state
  const [newEmail, setNewEmail] = useState({
    venue_name: '',
    venue_email: '',
    venue_city: '',
    subject: '',
    body: '',
    campaign_id: '',
  });

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `/api/outreach/campaigns?user_id=${user.id}`
      );
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendEmail = async () => {
    if (
      !profile ||
      !newEmail.venue_name ||
      !newEmail.subject ||
      !newEmail.body
    ) {
      return;
    }

    try {
      const response = await fetch('/api/outreach/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmail,
          artist_id: profile.id,
          send_email: true,
        }),
      });

      if (response.ok) {
        setShowNewEmailModal(false);
        setNewEmail({
          venue_name: '',
          venue_email: '',
          venue_city: '',
          subject: '',
          body: '',
          campaign_id: '',
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!profile || !newCampaign.name) {
      return;
    }

    try {
      const response = await fetch('/api/outreach/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCampaign,
          artist_id: profile.id,
        }),
      });

      if (response.ok) {
        setShowNewCampaignModal(false);
        setNewCampaign({ name: '', description: '' });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className='w-4 h-4 text-blue-500' />;
      case 'opened':
        return <Eye className='w-4 h-4 text-green-500' />;
      case 'replied':
        return <MessageSquare className='w-4 h-4 text-purple-500' />;
      case 'bounced':
        return <XCircle className='w-4 h-4 text-red-500' />;
      default:
        return <Clock className='w-4 h-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'opened':
        return 'bg-green-100 text-green-800';
      case 'replied':
        return 'bg-purple-100 text-purple-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmails = emails.filter(email => {
    if (selectedCampaign !== 'all' && email.campaign_id !== selectedCampaign) {
      return false;
    }
    if (emailStatus !== 'all' && email.status !== emailStatus) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='max-w-7xl mx-auto py-8 px-4'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-8'></div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='h-24 bg-gray-200 rounded'></div>
              ))}
            </div>
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
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Outreach Tracker
              </h1>
              <p className='text-gray-600 mt-2'>
                Track your booking pitches and responses
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
              >
                <Plus className='w-4 h-4' />
                New Campaign
              </button>
              <button
                onClick={() => setShowNewEmailModal(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
              >
                <Mail className='w-4 h-4' />
                Send Email
              </button>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow-sm border'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Emails
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analytics.stats.total_emails}
                    </p>
                  </div>
                  <Mail className='w-8 h-8 text-blue-500' />
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Response Rate
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analytics.stats.response_rate}%
                    </p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-green-500' />
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Active Campaigns
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analytics.campaigns.active}
                    </p>
                  </div>
                  <Send className='w-8 h-8 text-purple-500' />
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm border'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Pending Follow-ups
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {analytics.followups.pending}
                    </p>
                  </div>
                  <Calendar className='w-8 h-8 text-orange-500' />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className='bg-white p-4 rounded-lg shadow-sm border mb-6'>
            <div className='flex flex-wrap gap-4 items-center'>
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-700'>
                  Filter:
                </span>
              </div>

              <select
                value={selectedCampaign}
                onChange={e => setSelectedCampaign(e.target.value)}
                className='border border-gray-300 rounded px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Campaigns</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>

              <select
                value={emailStatus}
                onChange={e => setEmailStatus(e.target.value)}
                className='border border-gray-300 rounded px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='draft'>Draft</option>
                <option value='sent'>Sent</option>
                <option value='opened'>Opened</option>
                <option value='replied'>Replied</option>
                <option value='bounced'>Bounced</option>
              </select>
            </div>
          </div>

          {/* Emails Table */}
          <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-medium text-gray-900'>
                Recent Emails
              </h3>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Venue
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Subject
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Sent Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Response
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredEmails.map(email => (
                    <tr key={email.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {email.venue_name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {email.venue_city}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 max-w-xs truncate'>
                          {email.subject}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(email.status)}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(email.status)}`}
                          >
                            {email.status}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {email.sent_at
                          ? new Date(email.sent_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {email.response_type ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              email.response_type === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : email.response_type === 'negative'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {email.response_type}
                          </span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button className='text-blue-600 hover:text-blue-900 mr-3'>
                          <Edit className='w-4 h-4' />
                        </button>
                        <button className='text-red-600 hover:text-red-900'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEmails.length === 0 && (
              <div className='text-center py-12'>
                <Mail className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>
                  No emails found. Start by sending your first pitch!
                </p>
              </div>
            )}
          </div>

          {/* New Email Modal */}
          {showNewEmailModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
                <h3 className='text-lg font-medium mb-4'>Send New Email</h3>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Venue Name
                    </label>
                    <input
                      type='text'
                      value={newEmail.venue_name}
                      onChange={e =>
                        setNewEmail({ ...newEmail, venue_name: e.target.value })
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='e.g. Blue Note'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Venue Email
                      </label>
                      <input
                        type='email'
                        value={newEmail.venue_email}
                        onChange={e =>
                          setNewEmail({
                            ...newEmail,
                            venue_email: e.target.value,
                          })
                        }
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        placeholder='booking@venue.com'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        City
                      </label>
                      <input
                        type='text'
                        value={newEmail.venue_city}
                        onChange={e =>
                          setNewEmail({
                            ...newEmail,
                            venue_city: e.target.value,
                          })
                        }
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        placeholder='New York'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Campaign
                    </label>
                    <select
                      value={newEmail.campaign_id}
                      onChange={e =>
                        setNewEmail({
                          ...newEmail,
                          campaign_id: e.target.value,
                        })
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    >
                      <option value=''>No Campaign</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Subject
                    </label>
                    <input
                      type='text'
                      value={newEmail.subject}
                      onChange={e =>
                        setNewEmail({ ...newEmail, subject: e.target.value })
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='Booking Inquiry: [Your Name]'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email Body
                    </label>
                    <textarea
                      value={newEmail.body}
                      onChange={e =>
                        setNewEmail({ ...newEmail, body: e.target.value })
                      }
                      rows={6}
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='Write your pitch here...'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={() => setShowNewEmailModal(false)}
                    className='px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Campaign Modal */}
          {showNewCampaignModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                <h3 className='text-lg font-medium mb-4'>
                  Create New Campaign
                </h3>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Campaign Name
                    </label>
                    <input
                      type='text'
                      value={newCampaign.name}
                      onChange={e =>
                        setNewCampaign({ ...newCampaign, name: e.target.value })
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='e.g. Summer 2024 Tour'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      value={newCampaign.description}
                      onChange={e =>
                        setNewCampaign({
                          ...newCampaign,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      placeholder='Optional description...'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={() => setShowNewCampaignModal(false)}
                    className='px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
