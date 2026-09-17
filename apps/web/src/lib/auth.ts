import { NextRequest } from 'next/server';

/**
 * Extracts the user token from the request.
 * 
 * To avoid token lifecycle bugs and race conditions, the Next.js API Routes 
 * should *not* instantiate their own Supabase client and call getSession() 
 * which could attempt to refresh an already refreshed token.
 * 
 * Instead, they should rely on the middleware to refresh the session 
 * and attach the access token to the 'x-user-token' header.
 */
export function getToken(req: NextRequest): string | null {
  const token = req.headers.get('x-user-token');
  if (!token) {
    console.warn('[auth.ts] x-user-token header is MISSING in NextRequest headers');
  }
  return token;
}
