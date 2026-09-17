import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys/[id]/likes — Like a journey (idempotent).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_BASE}/journeys/${id}/likes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  return new NextResponse(null, { status: res.status });
}

/**
 * DELETE /api/journeys/[id]/likes — Unlike a journey (idempotent).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${API_BASE}/journeys/${id}/likes`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return new NextResponse(null, { status: res.status });
}
