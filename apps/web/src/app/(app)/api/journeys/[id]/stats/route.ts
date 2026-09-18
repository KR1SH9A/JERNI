import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * GET /api/journeys/[id]/stats — Proxies to GET /journeys/:id/stats on NestJS.
 * Public endpoint — no auth needed. Just a proxy to avoid CORS issues.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(`${API_BASE}/journeys/${id}/stats`, {
    next: { revalidate: 30 }, // Cache for 30 seconds — stats are near-realtime
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
