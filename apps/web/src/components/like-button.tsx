'use client';

import { useLike } from '@/lib/queries/use-like';

interface LikeButtonProps {
  journeyId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

/**
 * LikeButton — optimistic like/unlike with heart icon and count.
 *
 * State is owned by the TanStack Query cache (via useLike).
 * Both isLiked and likeCount update instantly. Error rolls back + toast.
 * No router.refresh() needed.
 */
export function LikeButton({ journeyId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const { isLiked, likeCount, isPending, toggle } = useLike(
    journeyId,
    initialIsLiked,
    initialLikeCount,
  );

  return (
    <button
      id={`like-btn-${journeyId}`}
      onClick={toggle}
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
  );
}
