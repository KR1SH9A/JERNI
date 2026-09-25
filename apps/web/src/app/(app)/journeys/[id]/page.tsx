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
import { JourneyCover, toneFor } from '@/components/brand/JourneyCover';

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

  const tone = toneFor(journey.tags, journey.title);

  return (
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="container" style={{ paddingBottom: '5rem' }}>
        
        {/* Back link */}
        <div style={{ paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <Link
            href="/discover"
            style={{ fontSize: '0.85rem', color: 'var(--color-muted-2)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ← Back to Discover
          </Link>
        </div>

        {/* Hero banner cover */}
        <div style={{ marginBottom: '4rem' }}>
          <JourneyCover 
            title={journey.title} 
            tags={journey.tags} 
            style={{ 
              height: 'clamp(140px, 18vw, 220px)', 
              padding: 0 // Remove default 8px padding to let blocks fill
            }} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4rem', flexWrap: 'wrap' }}>
          
          {/* Left Column */}
          <div style={{ flex: '1 1 600px', minWidth: 0 }}>
            <h1 className="page-title" style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 400 }}>
              {journey.title}
            </h1>
            
            {journey.description && (
              <p style={{ color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '1.1rem' }}>
                {journey.description}
              </p>
            )}
            
            {/* Tags */}
            {journey.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                {Array.from(new Set(journey.tags)).map((tag, i) => (
                  <span key={`${tag}-${i}`} className="badge badge-muted" style={{ background: 'transparent', border: '1px solid var(--color-border-subtle)', borderRadius: '999px', padding: '0.4rem 1rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Tasks Section Heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.02em' }}>Tasks</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-text)' }}>
                {journey.taskCount} tasks in this journey
              </h2>
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
            
            {/* Stats Panel */}
            {journey.status === 'PUBLISHED' && (
              <div style={{ marginTop: '5rem' }}>
                <StatsPanel journeyId={journey.id} totalTasks={journey.taskCount} />
              </div>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
            {/* Action Card */}
            <div style={{ 
              background: 'var(--color-surface)', 
              borderRadius: '16px', 
              padding: '1.5rem',
              border: '1px solid var(--color-border)',
              // Pass the tone so buttons inherit it!
              '--color-accent': `var(--cv-${tone}-a)`,
              '--color-accent-dim': `var(--cv-${tone}-b)`,
            } as React.CSSProperties}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span className={`badge ${journey.status.toLowerCase()}`} style={{ background: 'transparent', border: '1px solid var(--color-border-subtle)', borderRadius: '999px' }}>
                  <span style={{ 
                    width: 6, height: 6, borderRadius: '50%', 
                    background: journey.status === 'PUBLISHED' ? 'var(--color-success)' : 'currentColor', 
                    display: 'inline-block', marginRight: '0.5rem' 
                  }} />
                  {journey.status === 'PUBLISHED' ? 'Published' : journey.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {journey.taskCount} tasks
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LikeButton
                  journeyId={journey.id}
                  initialIsLiked={initialIsLiked}
                  initialLikeCount={journey.likeCount}
                />
                
                {token && journey.status === 'PUBLISHED' && (
                  <JoinButton journeyId={journey.id} initialIsMember={initialIsMember} />
                )}
                {!token && journey.status === 'PUBLISHED' && (
                  <Link
                    href="/auth/login"
                    className="btn-primary"
                    style={{ width: '100%', display: 'block', textAlign: 'center' }}
                  >
                    Join journey
                  </Link>
                )}
              </div>
            </div>

            {isCurator && (
              <CuratorActions journeyId={journey.id} status={journey.status} taskCount={journey.taskCount} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
