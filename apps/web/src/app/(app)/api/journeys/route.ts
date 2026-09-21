import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

// Route handlers are server-side: prefer the private internal URL.
// NEXT_PUBLIC_API_URL is kept as a secondary fallback (e.g. Docker single-host
// setups where both vars share the same value) but never reaches the browser.
const API_BASE = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';


/**
 * POST /api/journeys — Create a new journey.
 * GET /api/journeys/mine is handled by the journeys/mine/route.ts
 */
export async function POST(req: NextRequest) {
  const token = getToken(req);
  // console.log('[route.ts] Token being sent to NestJS:', token ? `${token.substring(0, 15)}...` : 'null');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await proxyFetch(
    `${API_BASE}/journeys`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    'POST /journeys',
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
