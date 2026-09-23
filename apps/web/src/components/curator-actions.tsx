'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from './ui/confirm-modal';

interface CuratorActionsProps {
  journeyId: string;
  status: string;
  taskCount: number;
}

/**
 * CuratorActions — client component for curators to trigger state transitions.
 */
export function CuratorActions({ journeyId, status, taskCount }: CuratorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const handleAction = (action: 'publish' | 'archive') => {
    if (isPending) return;

    if (action === 'publish' && taskCount === 0) {
      setError('Cannot publish a journey with no tasks. Add at least one task first.');
      return;
    }

    if (action === 'archive') {
      setShowArchiveModal(true);
      return;
    }

    executeAction(action);
  };

  const executeAction = (action: 'publish' | 'archive') => {
    setError(null);
    startTransition(async () => {
      try {
        const method = action === 'publish' ? 'PATCH' : 'POST';
        const res = await fetch(`/api/journeys/${journeyId}/${action}`, {
          method,
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Your session has expired. Please sign in again.');
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? `Failed to ${action} journey`);
        }

        setCurrentStatus(action === 'publish' ? 'PUBLISHED' : 'ARCHIVED');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (action === 'archive') {
          setShowArchiveModal(false);
        }
      }
    });
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
              disabled={isPending}
              style={{ background: 'var(--color-primary, #6366f1)', color: 'white', border: 'none' }}
            >
              {isPending ? 'Publishing...' : 'Publish'}
            </button>
            <Link href={`/dashboard/journeys/${journeyId}/edit`}>
              <button className="btn-sm" id="curator-edit-btn" disabled={isPending}>Edit</button>
            </Link>
          </>
        )}

        {currentStatus === 'PUBLISHED' && (
          <button
            className="btn-sm"
            onClick={() => handleAction('archive')}
            disabled={isPending}
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            {isPending ? 'Archiving...' : 'Archive'}
          </button>
        )}

        <Link href="/dashboard">
          <button className="btn-sm" id="curator-dashboard-btn" disabled={isPending}>Dashboard</button>
        </Link>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', width: '100%' }}>
          {error}
        </p>
      )}

      <ConfirmModal
        isOpen={showArchiveModal}
        title="Archive Journey"
        description="Are you sure you want to archive this journey? This will prevent new users from joining and lock tasks for existing members."
        confirmText="Archive"
        cancelText="Cancel"
        isPending={isPending}
        onConfirm={() => executeAction('archive')}
        onCancel={() => setShowArchiveModal(false)}
      />
    </div>
  );
}
