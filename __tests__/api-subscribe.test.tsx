import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/subscribe';

jest.mock('../lib/supabaseClient', () => {
  const maybeSingle = jest.fn();
  const single = jest.fn();
  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({ maybeSingle })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({ single })),
        })),
      })),
      __mock: { maybeSingle, single },
    },
  };
});

jest.mock('resend', () => ({
  Resend: function () {
    return { emails: { send: jest.fn(() => Promise.resolve({})) } };
  },
}));

const { supabase } = require('../lib/supabaseClient');

describe('/api/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if email is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: 'Test', genre: 'Jazz', city: 'NY' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/Email is required/);
  });

  it('returns 400 if email already exists', async () => {
    supabase.__mock.maybeSingle.mockResolvedValueOnce({
      data: { id: '123' },
      error: null,
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test',
        genre: 'Jazz',
        city: 'NY',
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/Email already subscribed/);
  });

  it('returns 200 and inserts profile for valid request', async () => {
    supabase.__mock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });
    supabase.__mock.single.mockResolvedValueOnce({
      data: { id: 'newid' },
      error: null,
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test',
        genre: 'Jazz',
        city: 'NY',
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toMatch(/success/);
  });

  it('returns 500 if Supabase insert fails', async () => {
    supabase.__mock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });
    supabase.__mock.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'fail' },
    });
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test',
        genre: 'Jazz',
        city: 'NY',
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toMatch(/fail/);
  });
});
