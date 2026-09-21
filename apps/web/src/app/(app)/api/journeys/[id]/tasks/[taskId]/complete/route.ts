import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';
import { proxyFetch } from '@/lib/proxy-fetch';

const API_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

/**
 * POST /api/journeys/[id]/tasks/[taskId]/complete — Complete a task.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { id, taskId } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/tasks/${taskId}/complete`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    `POST /journeys/${id}/tasks/${taskId}/complete`,
  );

  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}

/**
 * DELETE /api/journeys/[id]/tasks/[taskId]/complete — Uncomplete a task (soft revoke).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { id, taskId } = await params;
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await proxyFetch(
    `${API_BASE}/journeys/${id}/tasks/${taskId}/complete`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    `DELETE /journeys/${id}/tasks/${taskId}/complete`,
  );

  return new NextResponse(null, { status: res.status });
}
