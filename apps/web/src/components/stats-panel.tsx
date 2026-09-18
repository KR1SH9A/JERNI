'use client';

import { useEffect, useState } from 'react';
import type { JourneyStatsReadModel, TodayBoardEntry, LeaderboardEntry } from '@jerni/shared-types';

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

export function StatsPanel({ journeyId, totalTasks }: StatsPanelProps) {
  const [stats, setStats] = useState<JourneyStatsReadModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'today' | 'alltime'>('today');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/journeys/${journeyId}/stats`)
      .then((r) => r.json())
      .then((data: JourneyStatsReadModel) => {
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [journeyId]);

  return (
    <section className="stats-panel card" aria-label="Journey stats">
      <div className="stats-header">
        <h2 className="stats-title">Journey Stats</h2>
        <div className="stats-tabs" role="tablist">
          <button
            role="tab"
            id="tab-today"
            aria-selected={tab === 'today'}
            className={`stats-tab ${tab === 'today' ? 'active' : ''}`}
            onClick={() => setTab('today')}
          >
            Today
          </button>
          <button
            role="tab"
            id="tab-alltime"
            aria-selected={tab === 'alltime'}
            className={`stats-tab ${tab === 'alltime' ? 'active' : ''}`}
            onClick={() => setTab('alltime')}
          >
            All Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="stats-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : !stats ? (
        <p style={{ color: 'var(--color-muted)', padding: '1rem 0' }}>
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
      <p style={{ color: 'var(--color-muted)', padding: '0.75rem 0', fontSize: '0.9rem' }}>
        No activity yet today. Be the first to check off a task!
      </p>
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
          <span className="stats-count">
            {e.completedToday}/{totalTasks}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p style={{ color: 'var(--color-muted)', padding: '0.75rem 0', fontSize: '0.9rem' }}>
        No completions recorded yet.
      </p>
    );
  }
  return (
    <ol className="stats-list" aria-label="All-time leaderboard">
      {entries.map((e, i) => (
        <li key={e.userId} className="stats-row">
          <span className="stats-rank">
            {`#${i + 1}`}
          </span>
          <span className="stats-name">{e.displayName}</span>
          <div className="stats-meta">
            <span title="Milestones">Milestones: {e.milestonesCompleted}</span>
            <span title="Recurring today">Recurring today: {e.recurringDoneToday}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
