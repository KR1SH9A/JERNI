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
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <DiscoverClient initialJourneys={feed.journeys} total={feed.total} />
    </main>
  );
}
