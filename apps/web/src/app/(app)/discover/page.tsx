import type { Metadata } from 'next';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { CuratorJourneyCard } from '@jerni/shared-types';

export const metadata: Metadata = {
  title: 'Discover — JERNI',
  description: 'Discover new journeys.',
};

interface DiscoverFeedResponse {
  journeys: CuratorJourneyCard[];
  total: number;
  page: number;
  pageSize: number;
}

export default async function DiscoverPage() {
  let feed: DiscoverFeedResponse = { journeys: [], total: 0, page: 1, pageSize: 20 };
  try {
    // The endpoint is /journeys (public)
    feed = await apiClient.get<DiscoverFeedResponse>('/journeys');
  } catch (error) {
    console.error('Error fetching discover feed:', error);
  }

  return (
    <main className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Discover</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>
            Find your next journey
          </p>
        </div>
      </div>

      {feed.journeys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', margin: '2rem auto', maxWidth: '600px' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            No journeys found.
          </p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
          {feed.journeys.map((journey) => (
            <article key={journey.id} className="card dashboard-card">
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
                  <button id={`view-journey-${journey.id}`}>View</button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
