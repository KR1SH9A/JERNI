'use client';

import { useState, useTransition } from 'react';

interface JoinButtonProps {
  journeyId: string;
  initialIsMember: boolean;
}

/**
 * JoinButton — client component for joining/leaving a journey.
 *
 * Calls the Next.js route handler (not NestJS directly), so the JWT
 * never touches this component or the browser bundle.
 *
 * Optimistic UI: toggles state immediately, rolls back on error.
 */
export function JoinButton({ journeyId, initialIsMember }: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    const nextState = !isMember;

    startTransition(async () => {
      // Optimistic update
      setIsMember(nextState);

      try {
        const res = await fetch(`/api/journeys/${journeyId}/memberships`, {
          method: nextState ? 'POST' : 'DELETE',
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Something went wrong');
        }
      } catch (err) {
        // Roll back optimistic update on error
        setIsMember(!nextState);
        setError(err instanceof Error ? err.message : 'Failed to update membership');
      }
    });
  };

  return (
    <div>
      <button
        id={`join-btn-${journeyId}`}
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={isMember ? 'Leave journey' : 'Join journey'}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '15px',
          opacity: isPending ? 0.7 : 1,
          background: isMember ? 'transparent' : 'var(--color-primary, #6366f1)',
          color: isMember ? 'var(--color-text-secondary, #888)' : '#fff',
          border: isMember ? '1.5px solid var(--color-border, #333)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        {isPending ? '...' : isMember ? 'Leave Journey' : 'Join Journey'}
      </button>
      {error && (
        <p role="alert" style={{ color: 'var(--color-error, #ef4444)', fontSize: '13px', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
