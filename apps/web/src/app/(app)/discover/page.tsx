import type { Metadata } from 'next';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { CuratorJourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'Discover — JERNI',
  description: 'Find your next curated learning journey.',
};

interface DiscoverFeedResponse {
  journeys: CuratorJourneyCard[];
  total: number;
  page: number;
  pageSize: number;
}

function JourneyCard({ journey }: { journey: CuratorJourneyCard }) {
  const hue = journey.title.charCodeAt(0) * 5;
  const hue2 = (journey.title.charCodeAt(1) || hue + 40) * 5;

  return (
    <article className="journey-card" aria-label={journey.title}>
      {/* Cover gradient */}
      <div
        className="journey-card-cover"
        style={{
          background: `linear-gradient(135deg, hsl(${hue},45%,14%) 0%, hsl(${hue2 % 360},35%,10%) 100%)`,
        }}
      >
        <span className="journey-card-cover-initials">
          {journey.title.slice(0, 2).toUpperCase()}
        </span>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.5) 20px)',
        }} />
      </div>

      <div className="journey-card-body">
        {/* Tags */}
        {journey.tags?.length > 0 && (
          <div className="journey-card-tags">
            {journey.tags.slice(0, 3).map((tag, i) => (
              <span key={`${tag}-${i}`} className="badge">{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/journeys/${journey.id}`} style={{ textDecoration: 'none' }}>
          <h2 className="journey-card-title">{journey.title}</h2>
        </Link>

        {/* Description */}
        {journey.description && (
          <p className="journey-card-desc">
            {journey.description.length > 90
              ? `${journey.description.slice(0, 90)}…`
              : journey.description}
          </p>
        )}

        {/* Meta */}
        <div className="journey-card-meta">
          <span className="journey-card-meta-item">
            <span>✦</span>
            {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''}
          </span>
          <span className="journey-card-meta-item">
            <span>♥</span>
            {journey.likeCount}
          </span>
        </div>

        {/* CTA */}
        <div className="journey-card-cta">
          <Link href={`/journeys/${journey.id}`}>
            <button
              id={`view-journey-${journey.id}`}
              style={{ width: '100%', fontSize: '0.825rem', padding: '0.55rem 1rem' }}
            >
              View journey →
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function DiscoverPage() {
  let feed: DiscoverFeedResponse = { journeys: [], total: 0, page: 1, pageSize: 20 };
  try {
    feed = await apiClient.get<DiscoverFeedResponse>('/journeys', {
      next: { revalidate: 60 }, // public feed — cache 60s, instant back-navigation
    });
  } catch (error) {
    console.error('Error fetching discover feed:', error);
  }

  return (
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh' }}>
      {/* Page header — Swiss editorial style */}
      <div style={{ borderBottom: '1px solid var(--color-border-subtle)', padding: '3rem 0 2.5rem' }}>
        <div className="container">
          <p className="page-header-label">Browse</p>
          <h1 className="page-title">Discover Journeys</h1>
          <p className="page-subtitle">
            Curated learning paths crafted by the community.
            {feed.total > 0 && ` ${feed.total} journeys available.`}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        {feed.journeys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✦</div>
            <h2 className="empty-state-title">No journeys yet</h2>
            <p className="empty-state-desc">
              Be the first to create a journey and share your knowledge with the community.
            </p>
            <Link href="/dashboard">
              <button className="btn-primary" id="discover-create-btn">Create a journey</button>
            </Link>
          </div>
        ) : (
          <div className="journey-grid">
            {feed.journeys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
