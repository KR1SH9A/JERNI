'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useJourneySocket } from '@/lib/use-journey-socket';
import { useStats } from '@/lib/queries/use-stats';
import { queryKeys } from '@/lib/queries/query-keys';
import type { TodayBoardEntry, LeaderboardEntry } from '@jerni/shared-types';

interface StatsPanelProps {
  journeyId: string;
  totalTasks: number;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={`${pct}% complete`}
      />
    </div>
  );
}

function LiveIndicator() {
  return (
    <span
      title="Live updates active"
      aria-label="Live"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.73rem', color: '#34d399', fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0.05em' }}
    >
      <span
        style={{
          width: 7, height: 7, borderRadius: '50%', background: '#34d399',
          display: 'inline-block',
          animation: 'live-pulse 1.8s ease-in-out infinite',
        }}
      />
      LIVE
    </span>
  );
}

export function StatsPanel({ journeyId, totalTasks }: StatsPanelProps) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'today' | 'alltime'>('today');

  // TanStack Query handles loading, error, and background refetching.
  const { data: stats, isLoading } = useStats(journeyId);

  // Socket integration: events invalidate the stats query key directly,
  // causing TanStack Query to background-refetch for all subscribers.
  const { isConnected } = useJourneySocket(journeyId, {
    onStatsUpdated: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(journeyId) });
    },
  });

  return (
    <section className="stats-panel card" aria-label="Journey stats">
      <div className="stats-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="stats-title">Journey Stats</h2>
          {isConnected && <LiveIndicator />}
        </div>
        <div className="stats-tabs" role="tablist">
          <button
            role="tab"
            id="tab-today"
            aria-selected={tab === 'today'}
            className={`stats-tab${tab === 'today' ? ' active' : ''}`}
            onClick={() => setTab('today')}
          >
            Today
          </button>
          <button
            role="tab"
            id="tab-alltime"
            aria-selected={tab === 'alltime'}
            className={`stats-tab${tab === 'alltime' ? ' active' : ''}`}
            onClick={() => setTab('alltime')}
          >
            All Time
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="stats-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : !stats ? (
        <p style={{ color: 'var(--color-muted)', padding: '1rem 0', fontSize: '0.875rem' }}>
          Could not load stats.
        </p>
      ) : tab === 'today' ? (
        <TodayBoard entries={stats.todayBoard} totalTasks={totalTasks} />
      ) : (
        <Leaderboard entries={stats.allTimeLeaderboard} />
      )}
    </section>
  );
}

function TodayBoard({ entries, totalTasks }: { entries: TodayBoardEntry[]; totalTasks: number }) {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted-2)', fontSize: '0.875rem' }}>
          No activity yet today. Be the first to check off a task!
        </p>
      </div>
    );
  }
  return (
    <ol className="stats-list" aria-label="Today's board">
      {entries.map((e, i) => (
        <li key={e.userId} className="stats-row">
          <span className="stats-rank">#{i + 1}</span>
          <div className="stats-user">
            <span className="stats-name">{e.displayName}</span>
            <ProgressBar value={e.completedToday} max={totalTasks} />
          </div>
          <span className="stats-count">{e.completedToday}/{totalTasks}</span>
        </li>
      ))}
    </ol>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted-2)', fontSize: '0.875rem' }}>No completions recorded yet.</p>
      </div>
    );
  }
  return (
    <ol className="stats-list" aria-label="All-time leaderboard">
      {entries.map((e, i) => (
        <li key={e.userId} className="stats-row">
          <span className="stats-rank">#{i + 1}</span>
          <span className="stats-name" style={{ flex: 1 }}>{e.displayName}</span>
          <div className="stats-meta">
            <span title="Milestones">◆ {e.milestonesCompleted}</span>
            <span title="Recurring done today">↻ {e.recurringDoneToday}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
