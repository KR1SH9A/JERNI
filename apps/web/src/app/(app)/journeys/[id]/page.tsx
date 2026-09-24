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
import { JourneyCover } from '@/components/brand/JourneyCover';

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
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', paddingBottom: '96px' }}>
      {/* Hero cover band */}
      <div style={{ height: '240px', width: '100%', overflow: 'hidden' }}>
        <JourneyCover 
          title={journey.title} 
          tags={journey.tags} 
          style={{ width: '100%', height: '100%', padding: '0', gap: '0' }}
        />
      </div>

      <div className="container" style={{ paddingBottom: 'var(--s8)', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--gutter)', marginTop: 'var(--s5)' }}>
        
        {/* Main Column (Span 8 on desktop, 12 on mobile) */}
        <div style={{ gridColumn: '1 / -1' }} className="journey-main-col">
          
          <div style={{ marginBottom: 'var(--s5)' }}>
            <Link
              href="/discover"
              style={{ fontSize: '14px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontWeight: 600 }}
            >
              ← Back to Discover
            </Link>
          </div>

          <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '48px', fontWeight: 300, lineHeight: 1.1, marginBottom: 'var(--s3)', color: 'var(--text)' }}>
            {journey.title}
          </h1>

          {journey.description && (
            <p style={{ color: 'var(--muted)', fontSize: '20px', fontFamily: 'var(--font-ui)', fontWeight: 500, lineHeight: 1.5, marginBottom: 'var(--s4)', maxWidth: '65ch' }}>
              {journey.description}
            </p>
          )}

          {journey.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', marginBottom: 'var(--s7)' }}>
              {Array.from(new Set(journey.tags)).map((tag, i) => (
                <span key={`${tag}-${i}`} className="badge">{tag}</span>
              ))}
            </div>
          )}

          <section>
            <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '36px', fontWeight: 400, marginBottom: 'var(--s5)', color: 'var(--text)' }}>
              {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''} in this journey
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

          {journey.status === 'PUBLISHED' && (
            <div style={{ marginTop: 'var(--s8)' }}>
              <StatsPanel journeyId={journey.id} totalTasks={journey.taskCount} />
            </div>
          )}
        </div>

        {/* Side Column (Span 4 on desktop, 12 on mobile) */}
        <aside style={{ gridColumn: '1 / -1' }} className="journey-side-col">
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--s5))', background: 'var(--surface)', padding: 'var(--s5)', borderRadius: 'var(--r4)', border: '1px solid var(--line)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s5)' }}>
              <span className="badge" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}>
                {journey.status === 'PUBLISHED' ? 'Published' : journey.status === 'DRAFT' ? 'Draft' : 'Archived'}
              </span>
              <div style={{ display: 'flex', gap: 'var(--s2)', alignItems: 'center' }}>
                <LikeButton
                  journeyId={journey.id}
                  initialIsLiked={initialIsLiked}
                  initialLikeCount={journey.likeCount}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text)', fontFamily: 'var(--font-ui)' }}>
                <span style={{ color: 'var(--muted)' }}>Tasks</span>
                <span style={{ fontWeight: 600 }}>{journey.taskCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text)', fontFamily: 'var(--font-ui)' }}>
                <span style={{ color: 'var(--muted)' }}>Members</span>
                <span style={{ fontWeight: 600 }}>{(journey as any).memberCount || '◎'}</span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--s6)' }}>
              {token && journey.status === 'PUBLISHED' && (
                <div style={{ width: '100%' }}>
                  <JoinButton journeyId={journey.id} initialIsMember={initialIsMember} />
                </div>
              )}
              {!token && journey.status === 'PUBLISHED' && (
                <Link href="/auth/login" style={{ display: 'block', width: '100%' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }}>Sign in to join</button>
                </Link>
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* Curator Bar */}
      {isCurator && (
        <CuratorActions journeyId={journey.id} status={journey.status} taskCount={journey.taskCount} />
      )}
    </main>
  );
}