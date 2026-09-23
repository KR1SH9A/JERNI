'use client';

/**
 * useStats — fetches journey stats (today-board + leaderboard).
 *
 * Replaces the manual useState + fetch + setLoading pattern in StatsPanel.
 * TanStack Query handles loading, error, and background refetch natively.
 *
 * The socket's stats.updated event calls:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.stats(journeyId) })
 * which triggers a background refetch and updates all subscribers.
 */

import { useQuery } from '@tanstack/react-query';
import type { JourneyStatsReadModel } from '@jerni/shared-types';
import { queryKeys } from './query-keys';

export function useStats(journeyId: string) {
  return useQuery<JourneyStatsReadModel>({
    queryKey: queryKeys.stats(journeyId),
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${journeyId}/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    // Stats can be slightly stale — socket will invalidate when real changes happen.
    staleTime: 10_000,
  });
}
