'use client';

/**
 * useLike — manages like/unlike state with optimistic count updates.
 *
 * Optimistically updates both `isLiked` and `likeCount` immediately.
 * On error, rolls back both values and shows a toast.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from './query-keys';

interface LikeState {
  isLiked: boolean;
  likeCount: number;
}

export function useLike(
  journeyId: string,
  initialIsLiked?: boolean,
  initialLikeCount?: number,
) {
  const queryClient = useQueryClient();
  const key = queryKeys.like(journeyId);

  const { data } = useQuery<LikeState>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${journeyId}/likes`);
      if (!res.ok) throw new Error('Failed to fetch like state');
      return res.json();
    },
    initialData:
      initialIsLiked !== undefined && initialLikeCount !== undefined
        ? { isLiked: initialIsLiked, likeCount: initialLikeCount }
        : undefined,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      const res = await fetch(`/api/journeys/${journeyId}/likes`, {
        method: nextLiked ? 'POST' : 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        if (res.status === 401) throw new Error('SESSION_EXPIRED');
        throw new Error('Failed to update like');
      }
    },

    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LikeState>(key);
      const delta = nextLiked ? 1 : -1;
      queryClient.setQueryData<LikeState>(key, (old) => ({
        isLiked: nextLiked,
        likeCount: Math.max(0, (old?.likeCount ?? 0) + delta),
      }));
      return { previous };
    },

    onError: (err, _nextLiked, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
      const msg = err instanceof Error && err.message === 'SESSION_EXPIRED'
        ? 'Session expired — please sign in again'
        : 'Failed to update like';
      toast.error(msg);
    },

    onSuccess: (_, nextLiked) => {
      toast.success(nextLiked ? 'Liked! ♥' : 'Unliked');
    },
  });

  return {
    isLiked: data?.isLiked ?? initialIsLiked ?? false,
    likeCount: data?.likeCount ?? initialLikeCount ?? 0,
    isPending: mutation.isPending,
    toggle: () => mutation.mutate(!(data?.isLiked ?? false)),
  };
}
