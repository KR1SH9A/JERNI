import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the global fetch
global.fetch = vi.fn();

describe('POST /api/journeys', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 if x-user-token is missing', async () => {
    const mockRequest = {
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it('forwards the request to NestJS with the correct Authorization header', async () => {
    // Setup fetch mock to return a fake successful response
    (global.fetch as any).mockResolvedValueOnce({
      status: 201,
      json: async () => ({ id: 'new-journey-id', status: 'DRAFT' }),
    });

    const mockRequest = {
      headers: new Headers({
        'x-user-token': 'valid-jwt-token'
      }),
      json: async () => ({ title: 'My Journey' }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    
    // Assert fetch was called properly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as any).mock.calls[0];
    
    expect(url).toContain('/journeys');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      Authorization: 'Bearer valid-jwt-token',
      'Content-Type': 'application/json',
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('new-journey-id');
  });
});
