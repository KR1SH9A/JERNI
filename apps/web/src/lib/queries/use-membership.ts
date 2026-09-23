'use client';

/**
 * useMembership — manages join/leave state with optimistic updates.
 *
 * On mutation:
 *   1. Immediately toggles isMember in cache (optimistic).
 *   2. Fires POST/DELETE to the route handler.
 *   3. On error: rolls back to previous state + shows error toast.
 *   4. On settle: invalidates membership + stats so other panels refresh.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from './query-keys';

interface MembershipState {
  isMember: boolean;
}

export function useMembership(journeyId: string, initialIsMember?: boolean) {
  const queryClient = useQueryClient();
  const key = queryKeys.membership(journeyId);

  // Query — seeded from server props on first render, then kept fresh.
  const { data } = useQuery<MembershipState>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${journeyId}/memberships`);
      if (!res.ok) throw new Error('Failed to fetch membership');
      return res.json();
    },
    // Seed the cache with the server-rendered value to prevent loading flash.
    initialData: initialIsMember !== undefined ? { isMember: initialIsMember } : undefined,
    // Don't re-fetch immediately if we have fresh initial data.
    staleTime: initialIsMember !== undefined ? 30_000 : 0,
  });

  const mutation = useMutation({
    mutationFn: async (nextIsMember: boolean) => {
      const res = await fetch(`/api/journeys/${journeyId}/memberships`, {
        method: nextIsMember ? 'POST' : 'DELETE',
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('SESSION_EXPIRED');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Something went wrong');
      }
    },

    // ── Optimistic update ────────────────────────────────────────────────
    onMutate: async (nextIsMember) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MembershipState>(key);
      queryClient.setQueryData<MembershipState>(key, { isMember: nextIsMember });
      return { previous };
    },

    // ── Rollback on error ────────────────────────────────────────────────
    onError: (err, _nextIsMember, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
      const msg = err instanceof Error
        ? err.message === 'SESSION_EXPIRED'
          ? 'Session expired — please sign in again'
          : err.message
        : 'Failed to update membership';
      toast.error(msg);
    },

    onSuccess: (_, nextIsMember) => {
      toast.success(nextIsMember ? 'Joined journey!' : 'Left journey');
      // Invalidate stats so StatsPanel reflects new member
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(journeyId) });
    },

    // Always refetch from server after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    isMember: data?.isMember ?? initialIsMember ?? false,
    isPending: mutation.isPending,
    toggle: () => mutation.mutate(!(data?.isMember ?? false)),
  };
}
