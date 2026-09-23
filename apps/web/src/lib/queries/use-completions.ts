'use client';

/**
 * useCompletions — manages per-task checkbox state with optimistic toggles.
 *
 * The cache stores a Record<taskId, boolean> derived from the completions array.
 * Optimistic update: toggle the task immediately. On error: roll back that task
 * and show an error toast.
 *
 * After success, invalidates stats so the leaderboard/today-board refreshes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from './query-keys';

interface CompletionReadModel {
  taskDefinitionId: string;
  taskKindSnapshot: string;
  forDate: string | null;
  isActive: boolean;
}

/** Derived checked-map: taskId → boolean */
type CheckedMap = Record<string, boolean>;

function todayUtc(): string {
  return new Date().toISOString().split('T')[0];
}

function buildCheckedMap(completions: CompletionReadModel[]): CheckedMap {
  const today = todayUtc();
  const map: CheckedMap = {};
  for (const c of completions) {
    if (!c.isActive) continue;
    if (c.taskKindSnapshot === 'MILESTONE') {
      map[c.taskDefinitionId] = true;
    } else if (c.taskKindSnapshot === 'RECURRING' && c.forDate === today) {
      map[c.taskDefinitionId] = true;
    }
  }
  return map;
}

export function useCompletions(
  journeyId: string,
  initialCompletions?: CompletionReadModel[],
) {
  const queryClient = useQueryClient();
  const key = queryKeys.completions(journeyId);

  const { data: checked = {} } = useQuery<CheckedMap>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/journeys/${journeyId}/completions`);
      if (!res.ok) throw new Error('Failed to fetch completions');
      const { completions } = await res.json() as { completions: CompletionReadModel[] };
      return buildCheckedMap(completions);
    },
    initialData: initialCompletions ? buildCheckedMap(initialCompletions) : undefined,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async ({
      taskId,
      nextChecked,
    }: {
      taskId: string;
      nextChecked: boolean;
    }) => {
      const res = await fetch(
        `/api/journeys/${journeyId}/tasks/${taskId}/complete`,
        { method: nextChecked ? 'POST' : 'DELETE' },
      );
      if (!res.ok && res.status !== 204) {
        if (res.status === 401) throw new Error('SESSION_EXPIRED');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to update task');
      }
    },

    onMutate: async ({ taskId, nextChecked }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CheckedMap>(key);
      queryClient.setQueryData<CheckedMap>(key, (old = {}) => ({
        ...old,
        [taskId]: nextChecked,
      }));
      return { previous };
    },

    onError: (err, { taskId }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
      const msg = err instanceof Error
        ? err.message === 'SESSION_EXPIRED'
          ? 'Session expired — please sign in again'
          : err.message
        : 'Failed to update task';
      toast.error(msg);
    },

    onSuccess: (_, { nextChecked }) => {
      toast.success(nextChecked ? 'Task complete! ✓' : 'Task unchecked');
      // Refresh stats so the leaderboard/today-board picks up the new completion
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(journeyId) });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    checked,
    isPending: (taskId: string) => {
      // TanStack Query tracks pending mutations; we check if any mutation
      // for this task is currently running by looking at the variables.
      return mutation.isPending && mutation.variables?.taskId === taskId;
    },
    toggle: (taskId: string, currentChecked: boolean) =>
      mutation.mutate({ taskId, nextChecked: !currentChecked }),
  };
}
