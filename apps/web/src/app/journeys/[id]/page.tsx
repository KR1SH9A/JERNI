import { apiClient } from '@/lib/api-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { JoinButton } from '@/components/join-button';
import { LikeButton } from '@/components/like-button';
import { TaskChecklist } from '@/components/task-checklist';

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
      title: `${journey.title} — JERNI`,
      description: journey.description || `A journey with ${journey.taskCount} tasks.`,
    };
  } catch {
    return { title: 'Journey — JERNI' };
  }
}

/**
 * Journey Detail page — Server Component (Phase 2).
 *
 * Fetches membership status + task progress server-side so the JWT never
 * reaches client JS. Passes initial state to client components as props.
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // ── Fetch membership + progress (only if logged in) ───────────────────────
  let initialIsMember = false;
  let initialCompletions: CompletionReadModel[] = [];

  if (token) {
    // These run in parallel — both needed before rendering
    const [membershipRes, progressRes] = await Promise.allSettled([
      apiClient.get<{ isMember: boolean }>(
        `/journeys/${id}/memberships/me`,
        { token },
      ),
      apiClient.get<{ completions: CompletionReadModel[] }>(
        `/journeys/${id}/progress/me`,
        { token },
      ),
    ]);

    if (membershipRes.status === 'fulfilled') {
      initialIsMember = membershipRes.value.isMember;
    }
    if (progressRes.status === 'fulfilled') {
      initialCompletions = progressRes.value.completions;
    }
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Link href="/" style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
        ← Back to Discover
      </Link>

      {/* Header */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        {/* Placeholder cover */}
        <div
          style={{
            height: 200,
            borderRadius: 'var(--radius)',
            background: `hsl(${journey.title.charCodeAt(0) * 5}, 40%, 18%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.12)',
            marginBottom: '1.5rem',
          }}
        >
          {journey.title.slice(0, 2).toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {journey.title}
            </h1>
            {journey.description && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
                {journey.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {journey.tags.map((tag) => (
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
              📋 {journey.taskCount} tasks
            </span>

            {/* Like button — works for all users */}
            <LikeButton
              journeyId={journey.id}
              initialIsLiked={false}
              initialLikeCount={journey.likeCount}
            />

            {/* Join button — only shown when logged in */}
            {token && (
              <JoinButton journeyId={journey.id} initialIsMember={initialIsMember} />
            )}
            {!token && (
              <Link href="/auth/login" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-muted)' }}>
                Sign in to join
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Tasks
        </h2>

        {journey.tasks.length === 0 && (
          <p style={{ color: 'var(--color-muted)' }}>No tasks yet.</p>
        )}

        {journey.tasks.length > 0 && (
          <>
            {/* Interactive checklist — only for members */}
            {token && initialIsMember ? (
              <TaskChecklist
                journeyId={journey.id}
                tasks={journey.tasks}
                initialCompletions={initialCompletions}
              />
            ) : (
              /* Read-only task list for non-members */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: token ? 1 : 0.8 }}>
                {[...journey.tasks]
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'var(--color-surface, rgba(255,255,255,0.04))',
                        border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                      }}
                    >
                      <span style={{ color: 'var(--color-muted)', fontSize: '14px' }}>
                        {task.kind === 'RECURRING' ? '🔁' : '◻️'}
                      </span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{task.title}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: task.kind === 'RECURRING' ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                          color: task.kind === 'RECURRING' ? '#818cf8' : '#34d399',
                        }}
                      >
                        {task.kind === 'RECURRING' ? 'daily' : 'milestone'}
                      </span>
                    </div>
                  ))}
                {!token && (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
                    <Link href="/auth/login">Sign in</Link> and join this journey to track your progress.
                  </p>
                )}
                {token && !initialIsMember && (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '8px' }}>
                    Join this journey to start tracking your progress.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

