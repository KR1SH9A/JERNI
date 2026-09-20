'use client';

import { useState, useTransition } from 'react';

interface LikeButtonProps {
  journeyId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

/**
 * LikeButton — client component for liking/unliking a journey.
 *
 * Optimistic: updates count instantly, rolls back on error.
 * Idempotent: the backend handles double-like/unlike gracefully.
 */
export function LikeButton({ journeyId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    const nextLiked = !isLiked;
    // Snapshot the delta at click time so the rollback uses the same value
    // regardless of how many re-renders happen while the request is in-flight.
    const delta = nextLiked ? 1 : -1;

    setError(null);
    startTransition(async () => {
      // Optimistic update — use functional form to avoid stale closure bug
      setIsLiked(nextLiked);
      setLikeCount((prev) => Math.max(0, prev + delta));

      try {
        const res = await fetch(`/api/journeys/${journeyId}/likes`, {
          method: nextLiked ? 'POST' : 'DELETE',
        });

        if (!res.ok && res.status !== 204) {
          if (res.status === 401) {
            throw new Error('SESSION_EXPIRED');
          }
          throw new Error('Failed');
        }
      } catch (err) {
        // Roll back using the same delta
        setIsLiked(!nextLiked);
        setLikeCount((prev) => Math.max(0, prev - delta));

        if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
          setError('Your session has expired. Please sign in again.');
        }
        // Non-401 errors are silent (idempotent action — not worth alarming the user)
      }
    });
  };

  return (
    <div>
      <button
        id={`like-btn-${journeyId}`}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isLiked}
        aria-label={isLiked ? 'Unlike this journey' : 'Like this journey'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1.5px solid var(--color-border, #333)',
          background: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
          color: isLiked ? '#ef4444' : 'var(--color-text-secondary, #888)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          opacity: isPending ? 0.7 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '14px', fontWeight: 600 }}>
          {isLiked ? 'Liked' : 'Like'}
        </span>
        <span>{likeCount}</span>
      </button>
      {error && (
        <p role="alert" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
          {error}{' '}
          <a href={`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`}
             style={{ textDecoration: 'underline' }}>
            Sign in
          </a>
        </p>
      )}
    </div>
  );
}
