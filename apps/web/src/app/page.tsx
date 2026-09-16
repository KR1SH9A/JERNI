import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { JourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Browse curated learning journeys — join one and track your progress together.',
};

interface DiscoverFeedResponse {
  journeys: JourneyCard[];
  total: number;
  page: number;
  pageSize: number;
}

const POPULAR_TAGS = ['coding', 'react', 'typescript', 'design', 'productivity', 'health'];

function journeyColor(title: string) {
  const hues = [240, 270, 200, 180, 300, 160, 330, 220];
  return hues[title.charCodeAt(0) % hues.length];
}

/**
 * Discover page — Server Component.
 * Renders the hero, tag filter chips, and journey card grid.
 */
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const activeTag = params.tag;

  let feed: DiscoverFeedResponse | null = null;
  let error: string | null = null;

  try {
    const qs = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (activeTag) qs.set('tags', activeTag);
    feed = await apiClient.get<DiscoverFeedResponse>(`/journeys?${qs.toString()}`);
  } catch {
    error = 'Could not load journeys. Is the API running?';
  }

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero container animate-fade-in">
        <span className="hero-eyebrow">Open Beta</span>
        <h1 className="hero-title">
          Learn together,<br />
          <span className="gradient-text">grow faster.</span>
        </h1>
        <p className="hero-sub">
          Discover curated journeys, join a community, and track your progress day by day.
        </p>

        {/* Tag filter chips */}
        <div className="tag-filters" role="navigation" aria-label="Filter by tag">
          <Link href="/?" replace>
            <button
              className={`tag-chip ${!activeTag ? 'active' : ''}`}
              id="filter-all"
              aria-pressed={!activeTag}
            >
              All
            </button>
          </Link>
          {POPULAR_TAGS.map((tag) => (
            <Link key={tag} href={`/?tag=${tag}`} replace>
              <button
                className={`tag-chip ${activeTag === tag ? 'active' : ''}`}
                id={`filter-${tag}`}
                aria-pressed={activeTag === tag}
              >
                {tag}
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Journey grid ──────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {error && (
          <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', marginBottom: '1.5rem' }}>
            <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {feed && feed.journeys.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗺️</p>
            <p style={{ color: 'var(--color-muted)' }}>
              {activeTag ? `No journeys tagged "${activeTag}" yet.` : 'No journeys yet. Be the first curator!'}
            </p>
          </div>
        )}

        <div className="discover-grid">
          {feed?.journeys.map((journey, i) => {
            const hue = journeyColor(journey.title);
            return (
              <Link
                key={journey.id}
                href={`/journeys/${journey.id}`}
                className="journey-card-link"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <article className="card card-hover animate-slide-up" style={{ height: '100%' }}>
                  {/* Cover */}
                  <div
                    className="journey-card-cover"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue},50%,16%) 0%, hsl(${hue + 30},40%,12%) 100%)`,
                      border: `1px solid hsl(${hue},40%,22%)`,
                    }}
                  >
                    <span style={{ opacity: 0.35, fontSize: '1.75rem' }}>
                      {journey.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <h2 className="card-title">{journey.title}</h2>

                  {journey.description && (
                    <p className="card-desc">{journey.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.5rem 0 0.75rem' }}>
                    {journey.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge">{tag}</span>
                    ))}
                  </div>

                  <footer className="card-meta" style={{ marginTop: 'auto' }}>
                    <span>📋 {journey.taskCount} tasks</span>
                    <span>❤️ {journey.likeCount}</span>
                  </footer>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {feed && feed.total > feed.pageSize && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', justifyContent: 'center', alignItems: 'center' }}>
            {page > 1 && (
              <Link href={`/?page=${page - 1}${activeTag ? `&tag=${activeTag}` : ''}`}>
                <button id="prev-page-btn">← Prev</button>
              </Link>
            )}
            <span style={{ padding: '0.5rem', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              {page} / {Math.ceil(feed.total / feed.pageSize)}
            </span>
            {page < Math.ceil(feed.total / feed.pageSize) && (
              <Link href={`/?page=${page + 1}${activeTag ? `&tag=${activeTag}` : ''}`}>
                <button id="next-page-btn">Next →</button>
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
