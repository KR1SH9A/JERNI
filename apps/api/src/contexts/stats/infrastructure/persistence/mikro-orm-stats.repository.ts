import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  StatsRepository,
  JourneyStatsReadModel,
  TodayBoardEntry,
  LeaderboardEntry,
} from '../../application/ports/stats.repository';
import { DailyStatOrmEntity } from './daily-stat.orm-entity';
import { AllTimeStatOrmEntity } from './all-time-stat.orm-entity';

@Injectable()
export class MikroOrmStatsRepository implements StatsRepository {
  constructor(
    @InjectRepository(DailyStatOrmEntity)
    private readonly dailyRepo: EntityRepository<DailyStatOrmEntity>,
    @InjectRepository(AllTimeStatOrmEntity)
    private readonly allTimeRepo: EntityRepository<AllTimeStatOrmEntity>,
  ) {}

  /**
   * Upsert daily stat with a raw SQL query for atomic increment/decrement.
   * Uses ON CONFLICT DO UPDATE so it is safe under concurrency.
   */
  async upsertDailyStat(
    journeyId: string,
    userId: string,
    taskDefinitionId: string,
    forDate: string,
    delta: 1 | -1,
  ): Promise<void> {
    const em = this.dailyRepo.getEntityManager() as EntityManager;
    await em.getConnection().execute(
      `
      INSERT INTO daily_stats (journey_id, user_id, task_definition_id, for_date, completed_count)
      VALUES (?, ?, ?, ?, GREATEST(0, ?))
      ON CONFLICT (journey_id, user_id, task_definition_id, for_date)
      DO UPDATE SET
        completed_count = GREATEST(0, daily_stats.completed_count + ?)
      `,
      [journeyId, userId, taskDefinitionId, forDate, Math.max(0, delta), delta],
    );
  }

  /**
   * Upsert all-time stat.
   * - MILESTONE: increment/decrement milestones_completed
   * - RECURRING: increment/decrement recurring_done_today
   *
   * displayName is set on INSERT. On conflict (row exists), only the counter changes.
   * displayName is fetched from user_profiles at insert time via a subquery.
   */
  async upsertAllTimeStat(
    journeyId: string,
    userId: string,
    taskKind: 'MILESTONE' | 'RECURRING',
    _forDate: string | null,
    delta: 1 | -1,
  ): Promise<void> {
    const em = this.allTimeRepo.getEntityManager() as EntityManager;
    const isMilestone = taskKind === 'MILESTONE';

    await em.getConnection().execute(
      `
      INSERT INTO all_time_stats
        (journey_id, user_id, display_name, milestones_completed, recurring_done_today)
      VALUES (
        ?,
        ?,
        COALESCE((SELECT display_name FROM user_profiles WHERE id = ?), ''),
        ?,
        ?
      )
      ON CONFLICT (journey_id, user_id)
      DO UPDATE SET
        milestones_completed  = GREATEST(0, all_time_stats.milestones_completed  + ?),
        recurring_done_today  = GREATEST(0, all_time_stats.recurring_done_today  + ?)
      `,
      [
        journeyId,
        userId,
        userId,
        // INSERT values
        isMilestone ? Math.max(0, delta) : 0,
        isMilestone ? 0 : Math.max(0, delta),
        // UPDATE deltas
        isMilestone ? delta : 0,
        isMilestone ? 0 : delta,
      ],
    );
  }

  /**
   * Returns the today board (all members' completions for today) and
   * the all-time leaderboard, sorted by milestones_completed DESC.
   *
   * totalTasks is fetched from task_definitions via a subquery — cached
   * at the ORM level in the journey aggregate for most callers, but we
   * query directly here to keep Stats context self-contained.
   */
  async getJourneyStats(journeyId: string, today: string): Promise<JourneyStatsReadModel> {
    const em = this.dailyRepo.getEntityManager() as EntityManager;

    // ── Today board ───────────────────────────────────────────────────────────
    const totalTasksResult = await em.getConnection().execute<[{ count: string }]>(
      `SELECT COUNT(*) AS count FROM task_definitions WHERE journey_id = ?`,
      [journeyId],
    );
    const totalTasks = parseInt(totalTasksResult[0]?.count ?? '0', 10);

    const dailyRows = await em.getConnection().execute<
      { user_id: string; display_name: string; completed_today: string }[]
    >(
      `
      SELECT
        d.user_id,
        COALESCE(a.display_name, up.display_name, d.user_id) AS display_name,
        SUM(d.completed_count) AS completed_today
      FROM daily_stats d
      LEFT JOIN all_time_stats a ON a.journey_id = d.journey_id AND a.user_id = d.user_id
      LEFT JOIN user_profiles up ON up.id = d.user_id
      WHERE d.journey_id = ? AND d.for_date = ?
      GROUP BY d.user_id, a.display_name, up.display_name
      ORDER BY completed_today DESC
      `,
      [journeyId, today],
    );

    const todayBoard: TodayBoardEntry[] = dailyRows.map((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      completedToday: parseInt(r.completed_today, 10),
      totalTasks,
    }));

    // ── All-time leaderboard ──────────────────────────────────────────────────
    const allTimeRows = await em.getConnection().execute<
      {
        user_id: string;
        display_name: string;
        milestones_completed: number;
        recurring_done_today: number;
      }[]
    >(
      `
      SELECT user_id, display_name, milestones_completed, recurring_done_today
      FROM all_time_stats
      WHERE journey_id = ?
      ORDER BY milestones_completed DESC, recurring_done_today DESC
      LIMIT 50
      `,
      [journeyId],
    );

    const allTimeLeaderboard: LeaderboardEntry[] = allTimeRows.map((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      milestonesCompleted: r.milestones_completed,
      recurringDoneToday: r.recurring_done_today,
    }));

    return { journeyId, todayBoard, allTimeLeaderboard };
  }
}
