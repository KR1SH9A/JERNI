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

  const handleClick = () => {
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    startTransition(async () => {
      // Optimistic update
      setIsLiked(nextLiked);
      setLikeCount(nextCount);

      try {
        const res = await fetch(`/api/journeys/${journeyId}/likes`, {
          method: nextLiked ? 'POST' : 'DELETE',
        });
        if (!res.ok && res.status !== 204) {
          throw new Error('Failed');
        }
      } catch {
        // Roll back
        setIsLiked(!nextLiked);
        setLikeCount(nextLiked ? nextCount - 1 : nextCount + 1);
      }
    });
  };

  return (
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
      <span aria-hidden="true" style={{ fontSize: '16px' }}>
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span>{likeCount}</span>
    </button>
  );
}
