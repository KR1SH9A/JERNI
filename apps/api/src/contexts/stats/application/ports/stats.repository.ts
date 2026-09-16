/**
 * StatsRepository port — the Stats context's only outbound dependency.
 *
 * Both methods use DB-level upsert (INSERT ... ON CONFLICT DO UPDATE)
 * so they are safe to call multiple times (idempotent with delta=+1)
 * and safe to call from concurrent handlers.
 */
export interface StatsRepository {
  /**
   * Upsert a daily stat row for a specific task on a specific date.
   * delta is +1 (completed) or -1 (uncompleted, never below 0).
   */
  upsertDailyStat(
    journeyId: string,
    userId: string,
    taskDefinitionId: string,
    forDate: string,
    delta: 1 | -1,
  ): Promise<void>;

  /**
   * Upsert the all-time stat for a (journey, user) pair.
   * taskKind determines which counter to increment/decrement.
   */
  upsertAllTimeStat(
    journeyId: string,
    userId: string,
    taskKind: 'MILESTONE' | 'RECURRING',
    forDate: string | null,
    delta: 1 | -1,
  ): Promise<void>;

  /**
   * Return the full stats read model for a journey —
   * today's board (all members' completions for today) AND
   * the all-time leaderboard (sorted by milestones_completed DESC).
   */
  getJourneyStats(journeyId: string, today: string): Promise<JourneyStatsReadModel>;
}

// ─── Read Models ──────────────────────────────────────────────────────────────

export interface TodayBoardEntry {
  userId: string;
  displayName: string;
  /** How many tasks (of any kind) this user has completed today */
  completedToday: number;
  /** Total tasks on the journey (to compute %) */
  totalTasks: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  milestonesCompleted: number;
  recurringDoneToday: number;
}

export interface JourneyStatsReadModel {
  journeyId: string;
  /** Current user's own summary — curator sees full board */
  todayBoard: TodayBoardEntry[];
  allTimeLeaderboard: LeaderboardEntry[];
}

export const STATS_REPOSITORY = Symbol('STATS_REPOSITORY');
