'use client';

import { useState, useTransition } from 'react';

interface LikeButtonProps {
  journeyId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

/**
 * LikeButton — optimistic like/unlike with heart icon and count.
 * Rolls back on error; 401 shows a session-expired inline message.
 */
export function LikeButton({ journeyId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    const nextLiked = !isLiked;
    const delta = nextLiked ? 1 : -1;
    setError(null);

    startTransition(async () => {
      setIsLiked(nextLiked);
      setLikeCount((prev) => Math.max(0, prev + delta));

      try {
        const res = await fetch(`/api/journeys/${journeyId}/likes`, {
          method: nextLiked ? 'POST' : 'DELETE',
        });
        if (!res.ok && res.status !== 204) {
          if (res.status === 401) throw new Error('SESSION_EXPIRED');
          throw new Error('Failed');
        }
      } catch (err) {
        setIsLiked(!nextLiked);
        setLikeCount((prev) => Math.max(0, prev - delta));
        if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
          setError('Session expired — sign in again');
        }
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
        className={`like-btn${isLiked ? ' liked' : ''}`}
        style={{ width: '100%', justifyContent: 'center', opacity: isPending ? 0.6 : 1 }}
      >
        <span className="heart-icon" aria-hidden="true">
          {isLiked ? '♥' : '♡'}
        </span>
        <span>{likeCount}</span>
      </button>
      {error && (
        <p role="alert" style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}
