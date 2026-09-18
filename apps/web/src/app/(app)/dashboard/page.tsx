import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import type { CuratorJourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'My Dashboard — JERNI',
  description: 'Manage your curated journeys.',
};

interface MyJourneysResponse {
  journeys: CuratorJourneyCard[];
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
 * Shows all of the curator's journeys (all statuses) with live member count.
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

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // ── Fetch journeys ───────────────────────────────────────────────────────
  let feed: MyJourneysResponse = { journeys: [], total: 0 };
  try {
    feed = await apiClient.get<MyJourneysResponse>('/journeys/mine', {
      token,
    });
  } catch {
    // Show empty state — don't crash the page
  }

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
        <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗺️</p>
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
                  {journey.visibility === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}
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
                <span>📋 {journey.taskCount} tasks</span>
                <span>👥 {journey.memberCount} members</span>
                <span>❤️ {journey.likeCount}</span>
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
    </main>
  );
}
