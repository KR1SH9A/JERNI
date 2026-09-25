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

    if (action === 'archive') {
      setShowArchiveModal(true);
      return;
    }

    mutation.mutate(action);
  };

  return (
    <>
      <div 
        className="curator-bar animate-fade-in" 
        style={{ 
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          padding: '0.4rem 0.6rem',
          display: 'flex', 
          gap: '0.5rem', 
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: currentStatus === 'PUBLISHED' ? 'var(--color-success)' : currentStatus === 'ARCHIVED' ? 'var(--color-muted-2)' : 'var(--color-warning)',
            boxShadow: currentStatus === 'PUBLISHED' ? '0 0 12px var(--color-success)' : 'none',
            transition: 'all 0.3s ease'
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
            {currentStatus === 'DRAFT' ? 'Draft' : currentStatus === 'PUBLISHED' ? 'Published' : 'Archived'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {currentStatus === 'DRAFT' && (
            <Link href={`/dashboard/journeys/${journeyId}/edit`}>
              <button 
                className="btn-ghost" 
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '9999px', border: 'none' }} 
                disabled={mutation.isPending}
              >
                Edit
              </button>
            </Link>
          )}

          {(currentStatus === 'DRAFT' || currentStatus === 'ARCHIVED') && (
            <button 
              className="btn-primary" 
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.75rem', 
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                minWidth: '80px',
                justifyContent: 'center'
              }}
              onClick={() => handleAction('publish')} 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : currentStatus === 'ARCHIVED' ? 'Re-publish' : 'Publish'}
            </button>
          )}

          {currentStatus === 'PUBLISHED' && (
            <button 
              className="btn-danger" 
              style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.75rem', 
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                minWidth: '80px',
                justifyContent: 'center'
              }}
              onClick={() => handleAction('archive')} 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : 'Archive'}
            </button>
          )}

          <Link href="/dashboard">
            <button 
              className="btn-ghost" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '9999px', border: 'none' }} 
              disabled={mutation.isPending}
            >
              Dashboard
            </button>
          </Link>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
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
    </>
  );
}
