import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/pitches';

// Mock Supabase
const mockMaybeSingle = jest.fn();
const mockSingle = jest.fn();

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: mockMaybeSingle,
          single: mockSingle,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: mockSingle,
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: mockSingle,
          })),
        })),
      })),
    })),
  },
}));

describe('/api/pitches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMaybeSingle.mockReset();
    mockSingle.mockReset();
  });

  describe('POST - Create/Update pitch', () => {
    it('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { artist_id: '123', subject: 'Test' }, // missing body
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toMatch(/artist_id, subject, and body are required/);
    });

    it('creates new pitch when none exists', async () => {
      // Mock no existing pitch
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      // Mock successful insert
      mockSingle.mockResolvedValueOnce({ 
        data: { id: 'pitch-123', artist_id: '123', subject: 'Test', body: 'Test body' }, 
        error: null 
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: { artist_id: '123', subject: 'Test', body: 'Test body' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toMatch(/success/);
    });

    it('updates existing pitch when one exists', async () => {
      // Mock existing pitch
      mockMaybeSingle.mockResolvedValueOnce({ 
        data: { id: 'pitch-123' }, 
        error: null 
      });
      // Mock successful update
      mockSingle.mockResolvedValueOnce({ 
        data: { id: 'pitch-123', artist_id: '123', subject: 'Updated', body: 'Updated body' }, 
        error: null 
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: { artist_id: '123', subject: 'Updated', body: 'Updated body' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toMatch(/success/);
    });

    it('returns 500 if Supabase operation fails', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      const { req, res } = createMocks({
        method: 'POST',
        body: { artist_id: '123', subject: 'Test', body: 'Test body' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toMatch(/Database error/);
    });
  });

  describe('GET - Fetch pitch', () => {
    it('returns 400 if artist_id is missing', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toMatch(/artist_id is required/);
    });

    it('returns pitch data when found', async () => {
      const mockPitch = { id: 'pitch-123', artist_id: '123', subject: 'Test', body: 'Test body' };
      mockMaybeSingle.mockResolvedValueOnce({ data: mockPitch, error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artist_id: '123' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({ pitch: mockPitch });
    });

    it('returns null pitch when not found', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artist_id: '123' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({ pitch: null });
    });

    it('returns 500 if Supabase query fails', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'Query error' } });

      const { req, res } = createMocks({
        method: 'GET',
        query: { artist_id: '123' },
      });
      await handler(req, res);
      expect(res._getStatusCode()).toBe(500);
      expect(res._getData()).toMatch(/Query error/);
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(res._getData()).toMatch(/Method not allowed/);
  });
}); 