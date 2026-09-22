'use client';

import { useState, useTransition } from 'react';

interface JoinButtonProps {
  journeyId: string;
  initialIsMember: boolean;
}

/**
 * JoinButton — optimistic join/leave toggle with proper loading and hover states.
 * JWT is handled server-side through the Next.js route handler.
 */
export function JoinButton({ journeyId, initialIsMember }: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleClick = () => {
    setError(null);
    setSessionExpired(false);
    const nextState = !isMember;

    startTransition(async () => {
      setIsMember(nextState);
      try {
        const res = await fetch(`/api/journeys/${journeyId}/memberships`, {
          method: nextState ? 'POST' : 'DELETE',
        });
        if (!res.ok) {
          if (res.status === 401) {
            setIsMember(!nextState);
            setSessionExpired(true);
            return;
          }
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Something went wrong');
        }
      } catch (err) {
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
        ) : isMember ? '✓ Joined' : 'Join Journey'}
      </button>

      {sessionExpired && (
        <p role="alert" style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem', textAlign: 'center' }}>
          Session expired.{' '}
          <a href="/auth/login" style={{ color: '#f87171', textDecoration: 'underline' }}>Sign in</a>
        </p>
      )}
      {error && (
        <p role="alert" style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem', textAlign: 'center' }}>
          {error}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
