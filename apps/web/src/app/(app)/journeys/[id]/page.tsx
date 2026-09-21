import { apiClient } from '@/lib/api-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { JoinButton } from '@/components/join-button';
import { LikeButton } from '@/components/like-button';
import { TaskChecklist } from '@/components/task-checklist';
import { StatsPanel } from '@/components/stats-panel';
import { CuratorActions } from '@/components/curator-actions';
import { AddTaskForm } from '@/components/add-task-form';
import { TaskManager } from '@/components/task-manager';

interface TaskReadModel {
  id: string;
  title: string;
  orderIndex: number;
  kind: 'MILESTONE' | 'RECURRING';
  recurrenceRule: string | null;
}

interface JourneyDetail {
  id: string;
  curatorId: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  visibility: string;
  likeCount: number;
  taskCount: number;
  createdAt: string;
  tasks: TaskReadModel[];
}

interface CompletionReadModel {
  taskDefinitionId: string;
  taskKindSnapshot: string;
  forDate: string | null;
  isActive: boolean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const journey = await apiClient.get<JourneyDetail>(`/journeys/${id}`);
    return {
      title: journey.title,
      description: journey.description || `A journey with ${journey.taskCount} tasks.`,
    };
  } catch {
    return { title: 'Journey' };
  }
}

/**
 * Journey Detail page — Server Component (Phase 3).
 *
 * Phase 3 additions:
 *  - initialIsLiked fetched from GET /journeys/:id/likes/me (fixes the bug)
 *  - StatsPanel rendered below tasks
 *  - Curator action bar (Edit/Archive) shown when viewer is the curator
 */
export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ── Load journey ──────────────────────────────────────────────────────────
  let journey: JourneyDetail;
  try {
    journey = await apiClient.get<JourneyDetail>(`/journeys/${id}`);
  } catch {
    notFound();
  }

  // ── Load authenticated user session (server-side only) ────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const headersList = await headers();
  let token = headersList.get('x-user-token') || undefined;
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }
  const userId = user?.id;
  const isCurator = Boolean(userId && userId === journey.curatorId);

  // ── Fetch membership + progress + like status (only if logged in) ─────────
  let initialIsMember = false;
  let initialIsLiked = false;
  let initialCompletions: CompletionReadModel[] = [];

  if (token) {
    const [membershipRes, progressRes, likeRes] = await Promise.allSettled([
      apiClient.get<{ isMember: boolean }>(
        `/journeys/${id}/memberships/me`,
        { token },
      ),
      apiClient.get<{ completions: CompletionReadModel[] }>(
        `/journeys/${id}/progress/me`,
        { token },
      ),
      apiClient.get<{ isLiked: boolean }>(
        `/journeys/${id}/likes/me`,
        { token },
      ),
    ]);

    if (membershipRes.status === 'fulfilled') {
      initialIsMember = membershipRes.value.isMember;
    }
    if (progressRes.status === 'fulfilled') {
      initialCompletions = progressRes.value.completions;
    }
    if (likeRes.status === 'fulfilled') {
      initialIsLiked = likeRes.value.isLiked;
    }
  }

  const hue = journey.title.charCodeAt(0) * 5;

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Link href="/" className="animate-fade-in" style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
        ← Back to Discover
      </Link>

      {/* ── Curator action bar ──────────────────────────────────────────── */}
      {isCurator && (
        <CuratorActions
          journeyId={journey.id}
          status={journey.status}
          taskCount={journey.taskCount}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="animate-slide-up" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        {/* Cover */}
        <div
          style={{
            height: 200,
            borderRadius: 'var(--radius-lg)',
            background: `linear-gradient(135deg, hsl(${hue},50%,16%) 0%, hsl(${hue + 30},40%,12%) 100%)`,
            border: `1px solid hsl(${hue},40%,22%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.08)',
            marginBottom: '1.5rem',
          }}
        >
          {journey.title.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
              {journey.title}
            </h1>
            {journey.description && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                {journey.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {Array.from(new Set(journey.tags)).map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          </div>

          {/* Action sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 160 }}>
            <span className={`badge ${journey.status.toLowerCase()}`} style={{ textAlign: 'center' }}>
              {journey.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center' }}>
              Tasks: {journey.taskCount}
            </span>

            {/* Like button — now with correct initial state */}
            <LikeButton
              journeyId={journey.id}
              initialIsLiked={initialIsLiked}
              initialLikeCount={journey.likeCount}
            />

            {/* Join button — only shown when logged in AND journey is published */}
            {token && journey.status === 'PUBLISHED' && (
              <JoinButton journeyId={journey.id} initialIsMember={initialIsMember} />
            )}
            {!token && journey.status === 'PUBLISHED' && (
              <Link href="/auth/login" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
                Sign in to join
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Tasks ──────────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Tasks
        </h2>

        <TaskManager
          journeyId={journey.id}
          initialTasks={journey.tasks}
          initialCompletions={initialCompletions}
          token={token}
          initialIsMember={initialIsMember}
          status={journey.status}
          isCurator={isCurator}
        />
      </section>

      {/* ── Stats panel ────────────────────────────────────────────────── */}
      {journey.status === 'PUBLISHED' && (
        <StatsPanel journeyId={journey.id} totalTasks={journey.taskCount} />
      )}
    </main>
  );
}
