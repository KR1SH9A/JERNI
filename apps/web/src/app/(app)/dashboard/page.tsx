import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CuratorJourneyCard, JoinedJourneyCard } from '@jerni/shared-types';
import { JourneyCover } from "@/components/brand/JourneyCover";
import { CheckSquare, Users, Heart, Plus, ArrowRight } from 'lucide-react';

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
  const isCurator = variant === 'curator';
  const card = journey as any;

  return (
    <article className="journey-card" aria-label={journey.title}>
      {/* Cover */}
      <JourneyCover title={journey.title} tags={journey.tags} style={{ height: 100 }} />

      <div className="journey-card-body">
        <div className="journey-card-tags">
          {isCurator ? (
            <span className={STATUS_BADGE[journey.status] || 'badge'}>
              {journey.status}
            </span>
          ) : (
            <span className="badge badge-accent">Joined</span>
          )}
          {journey.tags?.slice(0, 2).map((tag, i) => (
            <span key={`${tag}-${i}`} className="badge">{tag}</span>
          ))}
        </div>

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

        <div className="journey-card-meta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckSquare size={14} /> {journey.taskCount} tasks
          </span>
          {isCurator && card.memberCount !== undefined && (
            <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Users size={14} /> {card.memberCount} members
            </span>
          )}
          <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Heart size={14} /> {journey.likeCount}
          </span>
        </div>

        <div className="journey-card-cta" style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/journeys/${journey.id}`} style={{ flex: 1 }}>
            <button id={`view-journey-${journey.id}`} style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}>
              {isCurator ? 'View' : 'Continue'} {!isCurator && <ArrowRight size={14} />}
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
      .select('*, task_definitions!task_definitions_journey_id_fkey(count), memberships(count)')
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
    memberCount: Array.isArray(j.memberships) ? j.memberships[0]?.count || 0 : j.memberships?.count || 0,
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
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '6rem 0 4rem' }}>
        <div className="container">
          <div className="dashboard-header" style={{ alignItems: 'center' }}>
            <div>
              <p className="page-header-label" style={{ marginBottom: '1rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '0.2em' }}>DASHBOARD</p>
              <h1 className="page-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em', fontWeight: 500, marginBottom: '0.75rem' }}>
                {displayName}
              </h1>
              <p className="page-subtitle" style={{ fontSize: '1.1rem', color: 'var(--color-muted)' }}>
                {myJourneys.length} journey{myJourneys.length !== 1 ? 's' : ''} curated
                {joinedJourneys.length > 0 && <span style={{ padding: '0 0.75rem', opacity: 0.3 }}>|</span>}
                {joinedJourneys.length > 0 && `${joinedJourneys.length} joined`}
              </p>
            </div>
            <Link href="/dashboard/journeys/new" id="create-journey-link">
              <button className="btn-primary" id="new-journey-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '1rem', borderRadius: '9999px', boxShadow: '0 8px 24px var(--color-accent-dim)', transition: 'all 0.3s ease' }}>
                <Plus size={18} /> New Journey
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '8rem' }}>

        {/* ── Joined Journeys ─────────────────────────────────────────── */}
        <section>
          <div className="section-heading" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <span className="section-heading-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 400 }}>Participating</span>
            <span className="section-heading-label" style={{ borderRight: 'none', paddingRight: 0, paddingBottom: '0.4rem', color: 'var(--color-muted-2)' }}>Journeys I&apos;ve Joined</span>
          </div>

          {joinedJourneys.length === 0 ? (
            <div className="empty-state" style={{ padding: '4rem 2rem', border: '1px dashed var(--color-border-subtle)', borderRadius: '24px', background: 'var(--color-surface)' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '1rem' }}>◎</div>
              <h2 className="empty-state-title" style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>No journeys joined yet</h2>
              <p className="empty-state-desc" style={{ color: 'var(--color-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Discover journeys created by others and start tracking your progress together.
              </p>
              <Link href="/discover">
                <button id="discover-btn" style={{ padding: '0.75rem 2rem', borderRadius: '9999px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>Discover journeys →</button>
              </Link>
            </div>
          ) : (
            <div className="journey-grid" style={{ gap: '2rem', marginTop: '0' }}>
              {joinedJourneys.map((j) => (
                <JourneyCard key={j.id} journey={j} variant="joined" />
              ))}
            </div>
          )}
        </section>

        {/* ── My Journeys ─────────────────────────────────────────────── */}
        <section style={{ marginTop: '6rem' }}>
          <div className="section-heading" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <span className="section-heading-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 400 }}>Curating</span>
            <span className="section-heading-label" style={{ borderRight: 'none', paddingRight: 0, paddingBottom: '0.4rem', color: 'var(--color-muted-2)' }}>My Journeys</span>
          </div>

          {myJourneys.length === 0 ? (
            <div className="empty-state" style={{ padding: '4rem 2rem', border: '1px dashed var(--color-border-subtle)', borderRadius: '24px', background: 'var(--color-surface)' }}>
              <div className="empty-state-icon" style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '1rem' }}>✦</div>
              <h2 className="empty-state-title" style={{ fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>No journeys yet</h2>
              <p className="empty-state-desc" style={{ color: 'var(--color-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Create your first journey to share a curated path with the community.
              </p>
              <Link href="/dashboard/journeys/new">
                <button className="btn-primary" id="first-journey-btn" style={{ padding: '0.75rem 2rem', borderRadius: '9999px' }}>Create your first journey</button>
              </Link>
            </div>
          ) : (
            <div className="journey-grid" style={{ gap: '2rem', marginTop: '0' }}>
              {myJourneys.map((j) => (
                <JourneyCard key={j.id} journey={j} variant="curator" />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
