'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { ConfirmModal } from './ui/confirm-modal';
import { queryKeys } from '@/lib/queries/query-keys';

interface CuratorActionsProps {
  journeyId: string;
  status: string;
  taskCount: number;
}

/**
 * CuratorActions — curator state transitions (publish / archive).
 *
 * Uses TanStack Query mutation to optimistically update local status in cache.
 * No router.refresh() needed — status is reflected via the mutation's onMutate.
 */
export function CuratorActions({ journeyId, status, taskCount }: CuratorActionsProps) {
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const mutation = useMutation({
    mutationFn: async (action: 'publish' | 'archive') => {
      const method = action === 'publish' ? 'PATCH' : 'POST';
      const res = await fetch(`/api/journeys/${journeyId}/${action}`, { method });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Your session has expired. Please sign in again.');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Failed to ${action} journey`);
      }
    },

    onMutate: (action) => {
      // Optimistically update local status display
      setCurrentStatus(action === 'publish' ? 'PUBLISHED' : 'ARCHIVED');
    },

    onError: (err, action) => {
      // Roll back status on failure
      setCurrentStatus(status);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} journey`);
    },

    onSuccess: (_, action) => {
      toast.success(action === 'publish' ? 'Journey published!' : 'Journey archived');
      // Invalidate dashboard + discover so cards reflect new status
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.discover() });
    },

    onSettled: () => {
      setShowArchiveModal(false);
    },
  });

  const handleAction = (action: 'publish' | 'archive') => {
    if (mutation.isPending) return;

    if (action === 'publish' && taskCount === 0) {
      toast.error('Cannot publish a journey with no tasks. Add at least one task first.');
      return;
    }

    if (action === 'archive') {
      setShowArchiveModal(true);
      return;
    }

    mutation.mutate(action);
  };

  return (
    <div className="curator-bar animate-fade-in" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span className="curator-bar-label">You are the curator of this journey</span>

        {currentStatus === 'DRAFT' && (
          <>
            <button
              className="btn-sm"
              onClick={() => handleAction('publish')}
              disabled={mutation.isPending}
              style={{ background: 'var(--color-primary, #6366f1)', color: 'white', border: 'none' }}
            >
              {mutation.isPending ? 'Publishing...' : 'Publish'}
            </button>
            <Link href={`/dashboard/journeys/${journeyId}/edit`}>
              <button className="btn-sm" id="curator-edit-btn" disabled={mutation.isPending}>Edit</button>
            </Link>
          </>
        )}

        {currentStatus === 'PUBLISHED' && (
          <button
            className="btn-sm"
            onClick={() => handleAction('archive')}
            disabled={mutation.isPending}
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            {mutation.isPending ? 'Archiving...' : 'Archive'}
          </button>
        )}

        <Link href="/dashboard">
          <button className="btn-sm" id="curator-dashboard-btn" disabled={mutation.isPending}>Dashboard</button>
        </Link>
      </div>

      <ConfirmModal
        isOpen={showArchiveModal}
        title="Archive Journey"
        description="Are you sure you want to archive this journey? This will prevent new users from joining and lock tasks for existing members."
        confirmText="Archive"
        cancelText="Cancel"
        isPending={mutation.isPending}
        onConfirm={() => mutation.mutate('archive')}
        onCancel={() => setShowArchiveModal(false)}
      />
    </div>
  );
}
