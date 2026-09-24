import { cache } from 'react';
import { apiClient } from '@/lib/api-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { JoinButton } from '@/components/join-button';
import { LikeButton } from '@/components/like-button';
import { TaskManager } from '@/components/task-manager';
import { StatsPanel } from '@/components/stats-panel';
import { CuratorActions } from '@/components/curator-actions';

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

/**
 * Cached journey fetch — React.cache() deduplicates calls within a single
 * request so generateMetadata() and the page component share one fetch.
 */
const getJourney = cache(async (id: string): Promise<JourneyDetail | null> => {
  try {
    return await apiClient.get<JourneyDetail>(`/journeys/${id}`, {
      next: { revalidate: 30 }, // public data — cache 30s, instant repeat navigations
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const journey = await getJourney(id);
  if (!journey) return { title: 'Journey' };
  return {
    title: journey.title,
    description: journey.description || `A journey with ${journey.taskCount} tasks.`,
  };
}

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Reuse the cached fetch — no duplicate network call vs generateMetadata()
  const journey = await getJourney(id);
  if (!journey) notFound();

  // Auth — read cookies once, then parallelize getUser + getSession
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);

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

  // Parallel auth calls — saves ~80ms vs sequential
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const token = headersList.get('x-user-token') || session?.access_token;
  const userId = user?.id;
  const isCurator = Boolean(userId && userId === journey.curatorId);

  let initialIsMember = false;
  let initialIsLiked = false;
  let initialCompletions: CompletionReadModel[] = [];

  if (token) {
    const [membershipRes, progressRes, likeRes] = await Promise.allSettled([
      apiClient.get<{ isMember: boolean }>(`/journeys/${id}/memberships/me`, { token }),
      apiClient.get<{ completions: CompletionReadModel[] }>(`/journeys/${id}/progress/me`, { token }),
      apiClient.get<{ isLiked: boolean }>(`/journeys/${id}/likes/me`, { token }),
    ]);
    if (membershipRes.status === 'fulfilled') initialIsMember = membershipRes.value.isMember;
    if (progressRes.status === 'fulfilled') initialCompletions = progressRes.value.completions;
    if (likeRes.status === 'fulfilled') initialIsLiked = likeRes.value.isLiked;
  }

  const hue = journey.title.charCodeAt(0) * 5;
  const hue2 = (journey.title.charCodeAt(1) || hue + 40) * 5;

  return (
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh' }}>
      {/* Hero cover */}
      <div
        style={{
          height: 'clamp(200px, 30vw, 320px)',
          background: `linear-gradient(135deg, hsl(${hue},50%,12%) 0%, hsl(${hue2 % 360},40%,8%) 100%)`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.5) 40px)',
        }} />
        {/* Large initials */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: 800, letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-sans)',
        }}>
          {journey.title.slice(0, 2).toUpperCase()}
        </div>
        {/* Gradient fade bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, var(--color-bg), transparent)',
        }} />
      </div>

      <div className="container" style={{ paddingBottom: '5rem' }}>
        {/* Back link */}
        <div style={{ paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <Link
            href="/discover"
            style={{ fontSize: '0.825rem', color: 'var(--color-muted-2)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            ← Back to Discover
          </Link>
        </div>

        {/* Curator action bar */}
        {isCurator && (
          <div style={{ marginBottom: '1.5rem' }}>
            <CuratorActions journeyId={journey.id} status={journey.status} taskCount={journey.taskCount} />
          </div>
        )}

        {/* Title + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title" style={{ marginBottom: '0.75rem' }}>
              {journey.title}
            </h1>
            {journey.description && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.65, maxWidth: '640px' }}>
                {journey.description}
              </p>
            )}
            {/* Tags */}
            {journey.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {Array.from(new Set(journey.tags)).map((tag, i) => (
                  <span key={`${tag}-${i}`} className="badge">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <section>
          <div className="section-heading" style={{ marginBottom: '1.5rem' }}>
            <span className="section-heading-label">Tasks</span>
            <span className="section-heading-title">
              {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''} in this journey
            </span>
          </div>
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

        {/* Stats panel */}
        {journey.status === 'PUBLISHED' && (
          <StatsPanel journeyId={journey.id} totalTasks={journey.taskCount} />
        )}
      </div>

      {/* Curator Bar */}
      <div className="curator-bar">
        <div className="curator-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text)' }}>
              U
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>{journey.title}</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{journey.taskCount} tasks • {journey.likeCount} likes</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <LikeButton
              journeyId={journey.id}
              initialIsLiked={initialIsLiked}
              initialLikeCount={journey.likeCount}
            />
            {token && journey.status === 'PUBLISHED' && (
              <JoinButton journeyId={journey.id} initialIsMember={initialIsMember} />
            )}
            {!token && journey.status === 'PUBLISHED' && (
              <Link href="/auth/login" className="btn btn-primary">Sign in to join</Link>
            )}
          </div>
        </div>
      </div>
    </main>

  );
}
