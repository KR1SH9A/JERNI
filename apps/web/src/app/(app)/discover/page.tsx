import type { Metadata } from 'next';
import { apiClient } from '@/lib/api-client';
import type { CuratorJourneyCard } from '@jerni/shared-types';
import { DiscoverClient } from './client';

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
        <DiscoverClient initialJourneys={feed.journeys} />
      </div>
    </main>
  );
}
