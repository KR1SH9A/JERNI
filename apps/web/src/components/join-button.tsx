'use client';

import { useMembership } from '@/lib/queries/use-membership';
import { Check } from 'lucide-react';

interface JoinButtonProps {
  journeyId: string;
  initialIsMember: boolean;
}

/**
 * JoinButton — optimistic join/leave toggle.
 *
 * State is owned by the TanStack Query cache (via useMembership).
 * Optimistic update fires instantly; error rolls back + shows a toast.
 * No router.refresh() needed — other components subscribe to the same cache.
 */
export function JoinButton({ journeyId, initialIsMember }: JoinButtonProps) {
  const { isMember, isPending, toggle } = useMembership(journeyId, initialIsMember);

  return (
    <button
      id={`join-btn-${journeyId}`}
      onClick={toggle}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={isMember ? 'Leave journey' : 'Join journey'}
      className={`join-btn${isMember ? ' is-member' : ' btn-primary'}`}
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      {isPending ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            width: '12px', height: '12px',
            border: `2px solid ${isMember ? 'rgba(52,211,153,0.3)' : 'rgba(5,19,26,0.3)'}`,
            borderTopColor: isMember ? '#34d399' : '#05131a',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }} />
        </span>
      ) : isMember ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Check size={16} strokeWidth={2} /> Joined
        </span>
      ) : 'Join Journey'}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
