import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Journey {
  id: string;
  title: string;
  description: string;
  tags: string[];
  likeCount: number;
  taskCount: number;
  createdAt: string;
}

interface DiscoverFeedResponse {
  journeys: Journey[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Discover page — Server Component.
 *
 * Fetches the journey list from NestJS server-side (the API URL never reaches
 * the browser). Renders statically at request time.
 */
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tags?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  let feed: DiscoverFeedResponse | null = null;
  let error: string | null = null;

  try {
    feed = await apiClient.get<DiscoverFeedResponse>(
      `/journeys?page=${page}&pageSize=20`,
    );
  } catch (e) {
    error = 'Could not load journeys. Is the API running?';
  }

  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Discover Journeys
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Curated learning paths you can join and track together.
        </p>
      </header>

      {error && (
        <div className="card" style={{ borderColor: '#5a1a1a', background: '#2a1010', marginBottom: '1.5rem' }}>
          <p style={{ color: '#e07070' }}>{error}</p>
        </div>
      )}

      {feed && feed.journeys.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            No journeys yet. Be the first curator!
          </p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {feed?.journeys.map((journey) => (
          <Link
            key={journey.id}
            href={`/journeys/${journey.id}`}
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <article className="card" style={{ height: '100%' }}>
              {/* Placeholder cover — replaced by Cloudinary image in Phase 1.5 */}
              <div
                style={{
                  height: 120,
                  borderRadius: 'var(--radius)',
                  background: `hsl(${journey.title.charCodeAt(0) * 5}, 40%, 20%)`,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.15)',
                }}
              >
                {journey.title.slice(0, 2).toUpperCase()}
              </div>

              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {journey.title}
              </h2>

              {journey.description && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-muted)',
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {journey.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {journey.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>

              <footer
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                }}
              >
                <span>📋 {journey.taskCount} tasks</span>
                <span>❤️ {journey.likeCount}</span>
              </footer>
            </article>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {feed && feed.total > feed.pageSize && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', justifyContent: 'center' }}>
          {page > 1 && (
            <Link href={`/?page=${page - 1}`}>
              <button>← Previous</button>
            </Link>
          )}
          <span style={{ padding: '0.5rem', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            Page {page} of {Math.ceil(feed.total / feed.pageSize)}
          </span>
          {page < Math.ceil(feed.total / feed.pageSize) && (
            <Link href={`/?page=${page + 1}`}>
              <button>Next →</button>
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
