'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queries/query-keys';

interface TaskReadModel {
  id: string;
  title: string;
  orderIndex: number;
  kind: 'MILESTONE' | 'RECURRING';
  recurrenceRule: string | null;
}

interface AddTaskFormProps {
  journeyId: string;
  onTaskAdded?: (task: TaskReadModel) => void;
}

export function AddTaskForm({ journeyId, onTaskAdded }: AddTaskFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'MILESTONE' | 'RECURRING'>('MILESTONE');

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; kind: string; recurrenceRule?: string }) => {
      const res = await fetch(`/api/journeys/${journeyId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Your session has expired. Please sign in again to add tasks.');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to add task');
      }
      return res.json() as Promise<TaskReadModel>;
    },

    onSuccess: (newTask) => {
      // Reset form
      setTitle('');
      setKind('MILESTONE');
      toast.success('Task added!');
      // Notify parent (TaskManager) to update its task list in cache
      onTaskAdded?.(newTask);
      // Invalidate journey so taskCount stays accurate
      queryClient.invalidateQueries({ queryKey: queryKeys.journey(journeyId) });
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || mutation.isPending) return;
    const payload: { title: string; kind: string; recurrenceRule?: string } = {
      title: title.trim(),
      kind,
    };
    if (kind === 'RECURRING') payload.recurrenceRule = 'DAILY';
    mutation.mutate(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card animate-fade-in"
      style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        border: '1px dashed var(--color-border)',
        background: 'transparent',
      }}
    >
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add a Task</h3>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            placeholder="e.g. Read Chapter 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>

        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'MILESTONE' | 'RECURRING')}
          disabled={mutation.isPending}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <option value="MILESTONE">Milestone (Once)</option>
          <option value="RECURRING">Recurring (Daily)</option>
        </select>

        <button
          type="submit"
          disabled={mutation.isPending || !title.trim()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: 'var(--color-primary, #6366f1)',
            color: 'white',
            border: 'none',
            fontWeight: 500,
            cursor: (mutation.isPending || !title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (mutation.isPending || !title.trim()) ? 0.6 : 1,
          }}
        >
          {mutation.isPending ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
