import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys/[id]/tasks — Add a task to a journey.
 * Proxies to POST /journeys/:id/tasks on NestJS.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/tasks`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    },
    `POST /journeys/${id}/tasks`,
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
