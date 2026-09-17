import { describe, it, expect } from 'vitest';
import { getToken } from './auth';
import { NextRequest } from 'next/server';

describe('getToken utility', () => {
  it('extracts token from x-user-token header', () => {
    // We can simulate a NextRequest by just providing a minimal mock
    // since we only access req.headers.get
    const mockRequest = {
      headers: new Headers({
        'x-user-token': 'mock-jwt-token-123'
      })
    } as unknown as NextRequest;

    const token = getToken(mockRequest);
    expect(token).toBe('mock-jwt-token-123');
  });

  it('returns null if x-user-token header is missing', () => {
    const mockRequest = {
      headers: new Headers()
    } as unknown as NextRequest;

    const token = getToken(mockRequest);
    expect(token).toBeNull();
  });
});
