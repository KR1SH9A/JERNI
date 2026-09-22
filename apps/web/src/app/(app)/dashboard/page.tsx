import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CuratorJourneyCard, JoinedJourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'My Dashboard — JERNI',
  description: 'Manage your curated journeys and track your progress.',
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge badge-warning',
  PUBLISHED: 'badge badge-success',
  ARCHIVED: 'badge badge-muted',
};

function JourneyCard({ journey, variant }: { journey: CuratorJourneyCard | JoinedJourneyCard; variant: 'curator' | 'joined' }) {
  const hue = journey.title.charCodeAt(0) * 5;
  const hue2 = (journey.title.charCodeAt(1) || hue + 40) * 5;
  const isCurator = variant === 'curator';
  const card = journey as any;

  return (
    <article className="journey-card" aria-label={journey.title}>
      {/* Cover */}
      <div
        className="journey-card-cover"
        style={{
          background: `linear-gradient(135deg, hsl(${hue},45%,13%) 0%, hsl(${hue2 % 360},35%,10%) 100%)`,
          height: 100,
        }}
      >
        <span className="journey-card-cover-initials" style={{ fontSize: '2rem' }}>
          {journey.title.slice(0, 2).toUpperCase()}
        </span>
        {/* Status pill overlaid on cover */}
        {isCurator && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
            <span className={STATUS_BADGE[journey.status] || 'badge'}>
              {journey.status}
            </span>
          </div>
        )}
        {!isCurator && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
            <span className="badge badge-accent">Joined</span>
          </div>
        )}
      </div>

      <div className="journey-card-body">
        {/* Tags */}
        {journey.tags?.length > 0 && (
          <div className="journey-card-tags">
            {journey.tags.slice(0, 2).map((tag, i) => (
              <span key={`${tag}-${i}`} className="badge">{tag}</span>
            ))}
          </div>
        )}

        <Link href={`/journeys/${journey.id}`} style={{ textDecoration: 'none' }}>
          <h2 className="journey-card-title">{journey.title}</h2>
        </Link>

        {journey.description && (
          <p className="journey-card-desc">
            {journey.description.length > 80
              ? `${journey.description.slice(0, 80)}…`
              : journey.description}
          </p>
        )}

        <div className="journey-card-meta">
          <span className="journey-card-meta-item">✦ {journey.taskCount} tasks</span>
          {isCurator && card.memberCount !== undefined && (
            <span className="journey-card-meta-item">◎ {card.memberCount} members</span>
          )}
          <span className="journey-card-meta-item">♥ {journey.likeCount}</span>
        </div>

        <div className="journey-card-cta" style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/journeys/${journey.id}`} style={{ flex: 1 }}>
            <button id={`view-journey-${journey.id}`} style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
              {isCurator ? 'View' : 'Continue →'}
            </button>
          </Link>
          {isCurator && journey.status === 'DRAFT' && (
            <Link href={`/dashboard/journeys/${journey.id}/edit`}>
              <button id={`edit-journey-${journey.id}`} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}>
                Edit
              </button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  // ── Auth guard ───────────────────────────────────────────────────────────
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

  // ── Fetch data ───────────────────────────────────────────────────────────
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
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
      .order('joined_at', { ascending: false }),
  ]);

  const myJourneys = (mineData.data || []).map((j: any) => ({
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

  const joinedJourneys = (joinedData.data || [])
    .filter((m: any) => m.journeys)
    .map((m: any) => {
      const j = Array.isArray(m.journeys) ? m.journeys[0] : m.journeys;
      return {
        id: j.id, curatorId: j.curator_id, title: j.title, description: j.description || '',
        tags: j.tags || [], likeCount: j.like_count || 0,
        taskCount: Array.isArray(j.task_definitions) ? j.task_definitions[0]?.count || 0 : 0,
        status: j.status, visibility: j.visibility,
        coverProvider: j.cover_provider, coverAssetId: j.cover_asset_id,
        createdAt: j.created_at, joinedAt: m.joined_at,
      };
    });

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You';

  return (
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border-subtle)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <div className="dashboard-header">
            <div>
              <p className="page-header-label">Dashboard</p>
              <h1 className="page-title">
                {displayName}
              </h1>
              <p className="page-subtitle">
                {myJourneys.length} journey{myJourneys.length !== 1 ? 's' : ''} curated
                {joinedJourneys.length > 0 && ` · ${joinedJourneys.length} joined`}
              </p>
            </div>
            <Link href="/dashboard/journeys/new" id="create-journey-link">
              <button className="btn-primary" id="new-journey-btn">
                + New Journey
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

        {/* ── My Journeys ─────────────────────────────────────────────── */}
        <section>
          <div className="section-heading">
            <span className="section-heading-label">Curating</span>
            <span className="section-heading-title">My Journeys</span>
          </div>

          {myJourneys.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div className="empty-state-icon">✦</div>
              <h2 className="empty-state-title">No journeys yet</h2>
              <p className="empty-state-desc">
                Create your first journey to share a curated path with the community.
              </p>
              <Link href="/dashboard/journeys/new">
                <button className="btn-primary" id="first-journey-btn">Create your first journey</button>
              </Link>
            </div>
          ) : (
            <div className="journey-grid">
              {myJourneys.map((j) => (
                <JourneyCard key={j.id} journey={j} variant="curator" />
              ))}
            </div>
          )}
        </section>

        {/* ── Joined Journeys ─────────────────────────────────────────── */}
        <section style={{ marginTop: '4rem' }}>
          <div className="section-heading">
            <span className="section-heading-label">Participating</span>
            <span className="section-heading-title">Journeys I&apos;ve Joined</span>
          </div>

          {joinedJourneys.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <div className="empty-state-icon">◎</div>
              <h2 className="empty-state-title">No journeys joined yet</h2>
              <p className="empty-state-desc">
                Discover journeys created by others and start tracking your progress together.
              </p>
              <Link href="/discover">
                <button id="discover-btn">Discover journeys →</button>
              </Link>
            </div>
          ) : (
            <div className="journey-grid">
              {joinedJourneys.map((j) => (
                <JourneyCard key={j.id} journey={j} variant="joined" />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
