// Fix hoisting: define mocks before jest.mock
const mockCreate = jest.fn();
function mockOpenAI() {
  return {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  };
}

jest.mock('openai', () => ({
  __esModule: true,
  default: mockOpenAI,
}));

// Mock Supabase with a simpler approach
const mockSingle = jest.fn();
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));
const mockSupabaseClient = {
  from: mockFrom,
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

import { createMocks } from 'node-mocks-http';

describe('/api/generate-pitch', () => {
  let handler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Import handler after mocks are set up
    handler = require('../pages/api/generate-pitch').default;
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    });
  });

  it('should return 400 if artist_id is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Artist ID is required',
    });
  });

  it('should return 404 if artist is not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: 'Not found',
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { artist_id: 'test-id' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Artist not found',
    });
  });

  it('should generate pitch with OpenAI successfully', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'test-id',
        name: 'Test Artist',
        genre: 'Jazz',
        city: 'New York, NY',
        website: 'https://test.com',
        bio: 'Test bio',
        pricing: '$500-1000',
        availability: 'Weekends',
        social_links: { instagram: 'https://instagram.com/test' },
      },
      error: null,
    });

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              subject: 'Booking Inquiry: Test Artist - Jazz',
              body: 'Dear Venue,\n\nI am Test Artist...\n\nBest regards,\nTest Artist',
            }),
          },
        },
      ],
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        artist_id: 'test-id',
        venue_info: { name: 'Test Venue', city: 'New York' },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Pitch generated successfully');
    expect(data.pitch.subject).toBe('Booking Inquiry: Test Artist - Jazz');
    expect(data.pitch.body).toContain('Test Artist');
  });

  it('should fallback to template if OpenAI fails', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'test-id',
        name: 'Test Artist',
        genre: 'Jazz',
        city: 'New York, NY',
        website: 'https://test.com',
        bio: 'Test bio',
        pricing: '$500-1000',
        availability: 'Weekends',
        social_links: { instagram: 'https://instagram.com/test' },
      },
      error: null,
    });

    mockCreate.mockRejectedValue(new Error('OpenAI API error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        artist_id: 'test-id',
        venue_info: { name: 'Test Venue', city: 'New York' },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Pitch generated successfully');
    expect(data.pitch.subject).toContain('Test Artist');
    expect(data.pitch.body).toContain('Test Artist');
  });

  it('should handle invalid OpenAI response format', async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: 'test-id',
        name: 'Test Artist',
        genre: 'Jazz',
        city: 'New York, NY',
        website: 'https://test.com',
        bio: 'Test bio',
        pricing: '$500-1000',
        availability: 'Weekends',
        social_links: { instagram: 'https://instagram.com/test' },
      },
      error: null,
    });

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Invalid JSON response',
          },
        },
      ],
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        artist_id: 'test-id',
        venue_info: { name: 'Test Venue', city: 'New York' },
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Pitch generated successfully');
    // Should fallback to template
    expect(data.pitch.subject).toContain('Test Artist');
    expect(data.pitch.body).toContain('Test Artist');
  });
});
