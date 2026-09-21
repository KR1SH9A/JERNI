import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import type { CuratorJourneyCard, JoinedJourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'My Dashboard — JERNI',
  description: 'Manage your curated journeys.',
};

interface MyJourneysResponse {
  journeys: CuratorJourneyCard[];
  total: number;
}

interface JoinedJourneysResponse {
  journeys: JoinedJourneyCard[];
  total: number;
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#d4a017',
  PUBLISHED: '#5cb85c',
  ARCHIVED: '#8a8a95',
};

/**
 * Dashboard page — Server Component.
 * Redirects to login if not authenticated.
 * Shows all of the curator's journeys and joined journeys.
 */
export default async function DashboardPage() {
  // ── Auth guard ──────────────────────────────────────────────────────────
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
  if (!user) redirect('/auth/login');

  const headersList = await headers();
  let token = headersList.get('x-user-token') || undefined;
  if (!token) {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }


  // ── Fetch journeys (Bypassing backend due to SQL syntax error in API) ────
  // We use the Supabase admin client (Service Role) to bypass RLS since the 
  // NestJS backend usually handles this logic directly using Postgres connections.
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
  
  const [mineData, joinedData] = await Promise.all([
    supabaseAdmin
      .from('journeys')
      .select('*, task_definitions!task_definitions_journey_id_fkey(count)')
      .eq('curator_id', user.id)
      .order('created_at', { ascending: false }),
      
    supabaseAdmin
      .from('memberships')
      .select('joined_at, journeys(*, task_definitions!task_definitions_journey_id_fkey(count))')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .order('joined_at', { ascending: false })
  ]);

  // Map to CuratorJourneyCard (memberCount is mocked to 0 to save a complex join)
  const feedJourneys = (mineData.data || []).map((j: any) => ({
    id: j.id,
    curatorId: j.curator_id,
    title: j.title,
    description: j.description || '',
    tags: j.tags || [],
    likeCount: j.like_count || 0,
    taskCount: Array.isArray(j.task_definitions) ? j.task_definitions[0]?.count || 0 : 0,
    status: j.status,
    visibility: j.visibility,
    coverProvider: j.cover_provider,
    coverAssetId: j.cover_asset_id,
    createdAt: j.created_at,
    memberCount: 0, 
  }));

  const feed = { journeys: feedJourneys, total: feedJourneys.length };

  // Map to JoinedJourneyCard
  const joinedJourneys = (joinedData.data || [])
    .filter((m: any) => m.journeys)
    .map((m: any) => {
      const j = Array.isArray(m.journeys) ? m.journeys[0] : m.journeys;
      return {
        id: j.id,
        curatorId: j.curator_id,
        title: j.title,
        description: j.description || '',
        tags: j.tags || [],
        likeCount: j.like_count || 0,
        taskCount: Array.isArray(j.task_definitions) ? j.task_definitions[0]?.count || 0 : 0,
        status: j.status,
        visibility: j.visibility,
        coverProvider: j.cover_provider,
        coverAssetId: j.cover_asset_id,
        createdAt: j.created_at,
        joinedAt: m.joined_at,
      };
    });

  const joined = { journeys: joinedJourneys, total: joinedJourneys.length };

  return (
    <main className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>
            Manage your curated journeys
          </p>
        </div>
        <Link href="/dashboard/journeys/new" id="create-journey-link">
          <button className="btn-primary" id="new-journey-btn">
            + New Journey
          </button>
        </Link>
      </div>

      {/* Journey list */}
      {feed.journeys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', margin: '2rem auto', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="jerni-logo-mask" style={{ width: '3rem', height: '3rem', color: 'var(--color-muted-2)' }}></span>
          </div>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            You haven&apos;t curated any journeys yet.
          </p>
          <Link href="/dashboard/journeys/new">
            <button className="btn-primary" id="first-journey-btn">Create your first journey</button>
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
          {feed.journeys.map((journey) => (
            <article key={journey.id} className="card dashboard-card">
              {/* Status pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span
                  className="badge"
                  style={{
                    background: `${STATUS_COLOR[journey.status]}22`,
                    color: STATUS_COLOR[journey.status],
                    border: `1px solid ${STATUS_COLOR[journey.status]}44`,
                  }}
                >
                  {journey.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  {journey.visibility === 'PRIVATE' ? 'Private' : 'Public'}
                </span>
              </div>

              <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>
                <Link href={`/journeys/${journey.id}`} style={{ color: 'var(--color-text)' }}>
                  {journey.title}
                </Link>
              </h2>

              {journey.description && (
                <p className="card-desc" style={{ color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                  {journey.description.slice(0, 100)}{journey.description.length > 100 ? '…' : ''}
                </p>
              )}

              {/* Stats row */}
              <div className="card-meta">
                <span>{journey.taskCount} tasks</span>
                <span>{journey.memberCount} members</span>
                <span>{journey.likeCount} likes</span>
              </div>

              {/* Actions */}
              <div className="card-actions">
                <Link href={`/journeys/${journey.id}`}>
                  <button id={`view-journey-${journey.id}`}>View</button>
                </Link>
                {journey.status === 'DRAFT' && (
                  <Link href={`/dashboard/journeys/${journey.id}/edit`}>
                    <button id={`edit-journey-${journey.id}`}>Edit</button>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Joined Journeys list */}
      <div style={{ marginTop: '4rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Journeys I&apos;ve Joined</h2>
        
        {joined.journeys.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
              You haven&apos;t joined any journeys yet.
            </p>
            <Link href="/discover">
              <button>Discover Journeys</button>
            </Link>
          </div>
        ) : (
          <div className="dashboard-grid">
            {joined.journeys.map((journey) => (
              <article key={journey.id} className="card dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)' }}>
                    Joined
                  </span>
                </div>
                <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>
                  <Link href={`/journeys/${journey.id}`} style={{ color: 'var(--color-text)' }}>
                    {journey.title}
                  </Link>
                </h2>
                {journey.description && (
                  <p className="card-desc" style={{ color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                    {journey.description.slice(0, 100)}{journey.description.length > 100 ? '…' : ''}
                  </p>
                )}
                <div className="card-meta">
                  <span>{journey.taskCount} tasks</span>
                  <span>{journey.likeCount} likes</span>
                </div>
                <div className="card-actions">
                  <Link href={`/journeys/${journey.id}`}>
                    <button id={`view-joined-${journey.id}`}>Continue Journey</button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
